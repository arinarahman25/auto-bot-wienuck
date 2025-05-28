const User = require("../models/user");
const SaldoHistory = require("../models/saldoHistory");
const generateStruk = require("../helpers/strukGenerator");

module.exports = async function isisaldoCommand(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.pushName || msg.key.participant || msg.key.remoteJid;

  const jumlah = parseInt(args[0]);
  const nomor = args[1];

  if (!jumlah || isNaN(jumlah) || !nomor) {
    return sock.sendMessage(
      from,
      {
        text: "❌ Format salah. Gunakan:\n*isi saldo <jumlah> <nomor>*\n\nContoh:\nisi saldo 20000 081234567890",
      },
      { quoted: msg },
    );
  }

  try {
    // ⛔️ Cegah pengisian ganda dalam 5 menit terakhir
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recent = await SaldoHistory.findOne({
      nomor,
      jumlah,
      createdAt: { $gte: fiveMinutesAgo },
    });

    if (recent) {
      return sock.sendMessage(
        from,
        {
          text: "⚠️ Pengisian saldo ini baru saja dilakukan beberapa menit yang lalu.\nTunggu sekitar 5 menit sebelum mengisi lagi ke nomor yang sama.",
        },
        { quoted: msg },
      );
    }

    // ➕ Tambahkan saldo
    let user = await User.findOne({ nomor });
    if (!user) {
      user = new User({ nomor, saldo: 0 });
    }

    user.saldo += jumlah;
    await user.save();

    // 💾 Catat ke histori isi saldo
    await SaldoHistory.create({
      nomor,
      jumlah,
      admin: sender.split("@")[0],
    });

    // 📤 Kirim notifikasi ke admin di grup
    await sock.sendMessage(
      from,
      {
        text: `✅ *Saldo berhasil ditambahkan!*\n\n📱 Nomor: ${nomor}\n➕ Jumlah: Rp ${jumlah.toLocaleString("id-ID")}\n💰 Total saldo: Rp ${user.saldo.toLocaleString("id-ID")}`,
      },
      { quoted: msg },
    );

    // 📩 Kirim struk dan notifikasi ke pelanggan
    const userJid = nomor.replace(/^0/, "62") + "@s.whatsapp.net";
    const namaUser = (await sock.onWhatsApp(userJid))[0]?.notify || nomor;
    const tanggal = new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
    });

    // 🧾 Generate struk bergambar
    const buffer = await generateStruk({
      nama: namaUser,
      nomor,
      jumlah,
      metode: "Manual Admin",
      tanggal,
    });

    await sock.sendMessage(userJid, {
      image: buffer,
      caption: `✅ *Saldo berhasil masuk!*\n\n➕ Rp ${jumlah.toLocaleString("id-ID")}\n💰 Total: Rp ${user.saldo.toLocaleString("id-ID")}\n\nBerikut struk isi saldo kamu 👇`,
    });
  } catch (error) {
    console.error("❌ Gagal isi saldo:", error);
    sock.sendMessage(
      from,
      {
        text: "❌ Terjadi kesalahan saat mengisi saldo.",
      },
      { quoted: msg },
    );
  }
};
