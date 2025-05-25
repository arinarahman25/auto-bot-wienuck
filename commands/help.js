// commands/help.js
module.exports = async (sock, msg) => {
  const menuText = `
  📖 *DAFTAR PERINTAH BOT TOPUP MAXI*

  Berikut perintah yang tersedia:
1. *menu*
   ➤ Menampilkan daftar produk top up.
   ➤ Contoh: ml / pubg / ff

2. *topup <SKU> <ID_Pengguna>*
   ➤ Membuat transaksi top up.
   ➤ Contoh: topup ml85 123456789

3. *cekstatus <ref_id>*
   ➤ Cek status pembayaran dan topup.
   ➤ Contoh: cekstatus a1b2c3d4

4. *help*
   ➤ Menampilkan pesan ini.

Silakan gunakan perintah di atas sesuai kebutuhan.
`;

   await sock.sendMessage(msg.key.remoteJid, { text: menuText }, { quoted: msg });
};