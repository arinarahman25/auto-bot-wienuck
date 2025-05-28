// commands/konfirmasi.js
const Konfirmasi = require("../database/models/Konfirmasi");

module.exports = async (sock, msg) => {
  const from = msg.key.remoteJid;
  const messages = await Konfirmasi.find({ status: "pending" }).sort({
    waktu: 1,
  });

  if (!messages.length) {
    return sock.sendMessage(
      from,
      { text: "✅ Tidak ada permintaan konfirmasi saat ini." },
      { quoted: msg },
    );
  }

  for (const [index, item] of messages.entries()) {
    const caption =
      `*📥 Permintaan #${index + 1}*\n\n` +
      `👤 User: wa.me/${item.user}\n` +
      `📛 Nama: ${item.nama || "-"}\n` +
      `💰 Nominal: Rp${item.nominal.toLocaleString("id-ID")}\n` +
      `📅 Waktu: ${item.waktu.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}\n\n` +
      `Ketik: *!approve ${item._id}* untuk menyetujui.\nKetik: *!tolak ${item._id}* untuk menolak.`;

    await sock.sendMessage(from, {
      image: { url: item.buktiUrl },
      caption,
    });
  }
};
