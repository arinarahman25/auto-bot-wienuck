require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const webhookRoute = require("./routes/webhook");

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const qrcode = require("qrcode-terminal");
const connectDB = require("./database/connection");
const keepAlive = require("./keepalive");
const monitor = require("./monitor");

// Commands
const menuCommand = require("./commands/menu");
const helpCommand = require("./commands/help");
const produkCommand = require("./commands/produk");
const pubgCommand = require("./commands/pubg");
const mlCommand = require("./commands/ml");
const ffCommand = require("./commands/ff");
const topupCommand = require("./commands/topup");
const cekstatusCommand = require("./commands/cekstatus");
const saldoCommand = require("./commands/saldo");
const belisaldoCommand = require("./commands/belisaldo");
const buktiCommand = require("./commands/bukti");

// Konfigurasi grup & admin
const allowedGroups = [];
const adminNumbers = process.env.ADMIN_NUMBERS
  ? process.env.ADMIN_NUMBERS.split(",").map((n) => n.trim())
  : [];

const allowedCommands = [
  "menu",
  "help",
  "produk",
  "pubg",
  "ml",
  "ff",
  "topup",
  "cek status",
  "saldo",
  "beli saldo",
  "isi saldo",
  "bukti",
];

async function startBot() {
  await connectDB();

  const { state, saveCreds } = await useMultiFileAuthState("auth");
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: "info" }),
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("\n📱 Silakan scan QR berikut untuk login WhatsApp:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("✅ Bot berhasil terhubung ke WhatsApp");
      console.log("🚀 Bot MAXI siap melayani 24/7!");
    } else if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;
      console.log("⛔️ Koneksi terputus. Reconnect:", shouldReconnect);
      
      if (shouldReconnect) {
        console.log("🔄 Mencoba reconnect dalam 5 detik...");
        setTimeout(() => {
          startBot();
        }, 5000);
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const isGroup = from.endsWith("@g.us");
    const sender = msg.key.participant || msg.key.remoteJid;
    const messageContent =
      msg.message.conversation || msg.message.extendedTextMessage?.text;

    if (!messageContent) return;

    const [cmdRaw, ...args] = messageContent.trim().split(" ");
    const cmd = cmdRaw.toLowerCase();
    const isAdmin = adminNumbers.includes(sender.split("@")[0]);

    if (
      allowedGroups.length > 0 &&
      isGroup &&
      !allowedGroups.includes(from) &&
      !isAdmin
    ) {
      return sock.sendMessage(
        from,
        { text: "⛔️ Bot ini hanya untuk grup tertentu." },
        { quoted: msg },
      );
    }

    switch (cmd) {
      case "menu":
        menuCommand(sock, msg);
        break;
      case "help":
        helpCommand(sock, msg);
        break;
      case "produk":
        produkCommand(sock, msg);
        break;
      case "pubg":
        pubgCommand(sock, msg);
        break;
      case "ml":
        mlCommand(sock, msg);
        break;
      case "ff":
        ffCommand(sock, msg);
        break;
      case "topup":
        topupCommand(sock, msg, args);
        break;
      case "cekstatus":
        cekstatusCommand(sock, msg, args);
        break;
      case "cek":
        saldoCommand(sock, msg);
        break;
      case "riwayat":
        if (args[0] === "saldo" && isAdmin) {
          const riwayatsaldoCommand = require("./commands/riwayatsaldo");
          riwayatsaldoCommand(sock, msg);
        }
        break;
      case "beli":
        if (args[0] === "saldo") {
          belisaldoCommand(sock, msg, args.slice(1));
        }
        break;
      case "isi":
        if (!isAdmin) {
          return sock.sendMessage(
            from,
            { text: "❌ Hanya admin yang bisa mengisi saldo." },
            { quoted: msg },
          );
        }
        if (args[0] === "saldo") {
          const isisaldoCommand = require("./commands/isisaldo");
          isisaldoCommand(sock, msg, args.slice(1));
        }
        break;
      case "bukti":
        buktiCommand(sock, msg, args);
        break;
      case "!konfirmasi":
        if (isAdmin) require("./commands/konfirmasi")(sock, msg);
        break;
      case "!approve":
        if (isAdmin) require("./commands/approve")(sock, msg, args);
        break;
      case "!tolak":
        if (isAdmin) require("./commands/tolak")(sock, msg, args);
        break;
    }
  });

  sock.ev.on("group-participants.update", async (update) => {
    const metadata = await sock.groupMetadata(update.id);
    const groupName = metadata.subject;

    for (let participant of update.participants) {
      if (update.action === "add") {
        try {
          const ppUrl = await sock
            .profilePictureUrl(participant, "image")
            .catch(() => null);
          const name =
            (await sock.onWhatsApp(participant))[0]?.notify ||
            participant.split("@")[0];
          const joinTime = new Date().toLocaleString("id-ID", {
            timeZone: "Asia/Jakarta",
          });

          const welcomeMessage = `
👋 *Selamat datang di grup ${groupName}!*\n\n💼 *Nama:* @${participant.split("@")[0]}\n🕒 *Bergabung:* ${joinTime}\n\nSemoga betah dan jangan lupa baca deskripsi grup ya!\n\n📜 *Deskripsi Grup:*\n${metadata.desc || "_Tidak ada deskripsi grup_"}\n\nSilakan perkenalkan diri jika berkenan 🙌
          `.trim();

          if (ppUrl) {
            await sock.sendMessage(update.id, {
              image: { url: ppUrl },
              caption: welcomeMessage,
              mentions: [participant],
            });
          } else {
            await sock.sendMessage(update.id, {
              text: welcomeMessage,
              mentions: [participant],
            });
          }
        } catch (err) {
          console.error("❌ Gagal mengirim sambutan:", err);
        }
      }
    }
  });

  // Setup webhook routes pada keep-alive server
  keepAlive.use(bodyParser.json());
  keepAlive.use("/webhook", webhookRoute);
  
  console.log("🔗 Webhook endpoint: /webhook/tripay");
}

startBot();
