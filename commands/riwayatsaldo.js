const SaldoHistory = require("../models/saldoHistory");

module.exports = async (sock, msg) => {
  const from = msg.key.remoteJid;
  const history = await SaldoHistory.find().sort({ waktu: -1 }).limit(10);

  if (history.length === 0) {
    return sock.sendMessage(
      from,
      { text: "❌ Belum ada riwayat isi saldo." },
      { quoted: msg },
    );
  }

  let teks = "*📋 Riwayat Isi Saldo Terakhir:*\n\n";
  history.forEach((item, i) => {
    teks += `${i + 1}. Nomor: ${item.nomor}\n   Jumlah: Rp${item.jumlah.toLocaleString()}\n   Admin: ${item.admin}\n   Waktu: ${item.waktu.toLocaleString("id-ID")}\n\n`;
  });

  await sock.sendMessage(from, { text: teks }, { quoted: msg });
};
