const Konfirmasi = require("../database/models/Konfirmasi");

module.exports = async (sock, msg, args) => {
  const from = msg.key.remoteJid;
  const id = args[0];

  const data = await Konfirmasi.findById(id);
  if (!data || data.status !== "pending") {
    return sock.sendMessage(
      from,
      { text: "❌ Data tidak ditemukan atau sudah diproses." },
      { quoted: msg },
    );
  }

  data.status = "rejected";
  await data.save();

  await sock.sendMessage(
    from,
    { text: `⛔ Permintaan dari ${data.user} telah ditolak.` },
    { quoted: msg },
  );
  await sock.sendMessage(`${data.user}@s.whatsapp.net`, {
    text: `⛔ Maaf, permintaan saldo Anda Rp${data.nominal} ditolak oleh admin.`,
  });
};
