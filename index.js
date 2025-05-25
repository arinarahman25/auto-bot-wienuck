require('dotenv').config();
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const connectDB = require('./database/connection');

// Commands
const menuCommand = require('./commands/menu');
const helpCommand = require('./commands/help');
const produkCommand = require('./commands/produk');
const topupCommand = require('./commands/topup');
const cekstatusCommand = require('./commands/cekstatus');
const pubgCommand = require('./commands/pubg');
const mlCommand = require('./commands/ml');
const ffCommand = require('./commands/ff');

// Konfigurasi
const allowedGroups = [];
const adminNumbers = process.env.ADMIN_NUMBERS
  ? process.env.ADMIN_NUMBERS.split(',').map(n => n.trim())
  : [];

// ✅ Daftar command yang diperbolehkan
const allowedCommands = ['menu', 'help', 'produk', 'pubg', 'ml', 'ff', 'topup', 'cekstatus'];

async function startBot() {
  await connectDB();

  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
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
      if (shouldReconnect) startBot();
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

    // Hapus prefix "!" jika ada
    const cleanMessage = messageContent.startsWith('!') ? messageContent.slice(1) : messageContent;
    const [cmd, ...args] = cleanMessage.trim().split(' ');
    const isAdmin = adminNumbers.includes(sender.split('@')[0]);

    // ❌ Jika bukan perintah yang diizinkan, abaikan
    if (!allowedCommands.includes(cmd.toLowerCase())) return;

    if (allowedGroups.length > 0 && isGroup && !allowedGroups.includes(from) && !isAdmin) {
      return sock.sendMessage(from, { text: '❌ Bot ini hanya untuk grup tertentu.' }, { quoted: msg });
    }

    // Jalankan command yang cocok
    switch (cmd.toLowerCase()) {
      case 'menu':
        menuCommand(sock, msg);
        break;
      case 'help':
        helpCommand(sock, msg);
        break;
      case 'produk':
        produkCommand(sock, msg);
        break;
      case 'pubg':
        pubgCommand(sock, msg);
        break;
      case 'ml':
        mlCommand(sock, msg);
        break;
      case 'ff':
        ffCommand(sock, msg);
        break;
      case 'topup':
        topupCommand(sock, msg, args);
        break;
      case 'cekstatus':
        cekstatusCommand(sock, msg, args);
        break;
    }
  });
}

startBot();
