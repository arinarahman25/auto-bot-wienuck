module.exports = async (sock, msg) => {
  const chat = msg.key.remoteJid;

  const helpText = `📖 *DAFTAR PERINTAH BOT TOPUP MAXI*

1. *!produk*
   ➤ Menampilkan daftar produk top up.

2. *!topup <SKU> <ID_Pengguna>*
   ➤ Membuat transaksi top up.
   ➤ Contoh: !topup ML10 123456789

3. *!cekstatus <ref_id>*
   ➤ Cek status pembayaran dan topup.
   ➤ Contoh: !cekstatus a1b2c3d4

4. *!help*
   ➤ Menampilkan pesan ini.

Silakan gunakan perintah di atas sesuai kebutuhan.
`;

  await sock.sendMessage(chat, { text: helpText }, { quoted: msg });
};
