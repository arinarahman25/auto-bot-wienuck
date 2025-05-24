// commands/menu.js
module.exports = (sock, msg) => {
  const from = msg.key.remoteJid;
  const menuText = `
📦 *Daftar Perintah:*
!produk - Lihat daftar produk
!topup <id> <nominal> - Top up game
!cekstatus <ref> - Cek status topup
`;

  sock.sendMessage(from, { text: menuText }, { quoted: msg });
};
