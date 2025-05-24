require('dotenv').config();
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const path = require('path');
const fs = require('fs');
const qrcode = require('qrcode-terminal');
const connectDB = require('./database/connection');
const menuCommand = require('./commands/menu');

// Command
const produkCommand = require('./commands/produk');
const topupCommand = require('./commands/topup');
const cekstatusCommand = require('./commands/cekstatus');

// Konfigurasi
const allowedGroups = [];
const adminNumbers = process.env.ADMIN_NUMBERS
  ? process.env.ADMIN_NUMBERS.split(',').map(n => n.trim())
  : [];

async function startBot() {
  await connectDB(); // koneksi MongoDB

  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false, // kita tampilkan QR manual pakai qrcode-terminal
    logger: pino({ level: 'info' })
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n📱 Silakan scan QR berikut untuk login WhatsApp:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'open') {
      console.log('✅ Bot berhasil terhubung ke WhatsApp');
    } else if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('⛔ Koneksi terputus. Reconnect:', shouldReconnect);
      if (shouldReconnect) {
        startBot(); // auto reconnect
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    const sender = msg.key.participant || msg.key.remoteJid;
    const messageContent = msg.message.conversation || msg.message.extendedTextMessage?.text;

    if (!messageContent) return;
    if (!messageContent.startsWith('!')) return;

    const [cmd, ...args] = messageContent.slice(1).split(' ');
    const isAdmin = adminNumbers.includes(sender.split('@')[0]);

    if (allowedGroups.length > 0 && isGroup && !allowedGroups.includes(from) && !isAdmin) {
      return sock.sendMessage(from, { text: '❌ Bot ini hanya untuk grup tertentu.' }, { quoted: msg });
    }

    switch (cmd.toLowerCase()) {
      case 'menu':
        menuCommand(sock, msg);
        break;
      case 'produk':
        produkCommand(sock, msg);
        break;
      case 'topup':
        topupCommand(sock, msg, args);
        break;
      case 'cekstatus':
        cekstatusCommand(sock, msg, args);
        break;
      default:
        sock.sendMessage(from, { text: '❌ Perintah tidak dikenal.' }, { quoted: msg });
    }
  });
}

startBot();
