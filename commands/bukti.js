const Konfirmasi = require("../database/models/konfirmasi");

module.exports = async function buktiCommand(sock, msg, args) {
  const sender = msg.key.remoteJid;
  const isImage = !!msg.message.imageMessage;
  const caption = msg.message?.imageMessage?.caption || "";

  if (!isImage || !caption.startsWith("!bukti")) {
    return sock.sendMessage(
      sender,
      {
        text: "❌ Kirim gambar dengan caption: *!bukti [nominal] [id/nomor]*\n\nContoh:\nbukti 20000 081234567890",
      },
      { quoted: msg },
    );
  }

  const [cmd, nominalStr, userId] = caption.trim().split(" ");
  const nominal = parseInt(nominalStr);

  if (!nominal || isNaN(nominal)) {
    return sock.sendMessage(
      sender,
      {
        text: "❌ Nominal tidak valid. Gunakan: *bukti 20000 08xxxx*",
      },
      { quoted: msg },
    );
  }

  const buffer = await sock.downloadMediaMessage(msg);
  const buktiBase64 = buffer.toString("base64");

  // Simpan gambar ke server lokal atau pakai uploader pihak ketiga
  const buktiUrl = `data:image/jpeg;base64,${buktiBase64}`;

  await Konfirmasi.create({
    user: userId || sender.split("@")[0],
    nominal,
    buktiUrl,
  });

  return sock.sendMessage(
    sender,
    {
      text: `✅ Bukti pembayaran sebesar *Rp${nominal.toLocaleString()}* berhasil dikirim. Mohon tunggu verifikasi dari admin.`,
    },
    { quoted: msg },
  );
};
