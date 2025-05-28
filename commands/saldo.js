const User = require("../models/user");

module.exports = async function saldoCommand(sock, msg) {
  const from = msg.key.remoteJid;
  const nomor = msg.key.participant
    ? msg.key.participant.split("@")[0]
    : msg.key.remoteJid.split("@")[0];

  try {
    let user = await User.findOne({ nomor });

    if (!user) {
      user = new User({ nomor, saldo: 0 });
      await user.save();
    }

    await sock.sendMessage(from, {
      text: `💰 *Saldo Anda*\n\n📱 Nomor: ${nomor}\n💳 Saldo saat ini: Rp ${user.saldo}`,
    });
  } catch (error) {
    console.error("❌ Gagal mengambil saldo:", error);
    sock.sendMessage(from, {
      text: "❌ Gagal memuat saldo. Silakan coba lagi nanti.",
    });
  }
};
