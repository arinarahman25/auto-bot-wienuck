const Konfirmasi = require("../database/models/Konfirmasi");
const { tambahSaldo } = require("../helpers/saldo");

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

  await tambahSaldo(data.user, data.nominal);
  data.status = "approved";
  await data.save();

  await sock.sendMessage(
    from,
    { text: `✅ Saldo Rp${data.nominal} berhasil ditambahkan ke ${data.user}` },
    { quoted: msg },
  );
  await sock.sendMessage(`${data.user}@s.whatsapp.net`, {
    text: `✅ Permintaan saldo Anda Rp${data.nominal} telah disetujui. Saldo Anda telah ditambahkan.`,
  });
};
