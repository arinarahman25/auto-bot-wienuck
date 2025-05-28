const fs = require("fs");
const path = require("path");

module.exports = async function belisaldoCommand(sock, msg, args) {
  const from = msg.key.remoteJid;
  const jumlah = args[0];

  // Jika tidak ada jumlah, tetap kirim QR dan minta mereka konfirmasi ke admin
  let caption;

  if (!jumlah || isNaN(jumlah)) {
    caption = `🧾 *Permintaan Isi Saldo*\n\n📥 Silakan scan QR berikut untuk melakukan pembayaran.\n\n❗ Kirim bukti pembayaran dan *jumlah saldo yang ingin diisi* ke admin agar bisa diproses.`;
  } else {
    caption = `🧾 *Permintaan Isi Saldo*\n\n💰 Jumlah: Rp ${jumlah}\n📥 Silakan scan QR berikut untuk membayar. Setelah bayar, kirim bukti transfer ke admin.`;
  }

  const qrPath = path.join(__dirname, "../assets/qr.png");

  if (!fs.existsSync(qrPath)) {
    return sock.sendMessage(from, {
      text: "❌ Gambar QR tidak ditemukan di folder /assets/qr.png",
    });
  }

  const imageBuffer = fs.readFileSync(qrPath);
  await sock.sendMessage(from, {
    image: imageBuffer,
    caption,
  });
};
