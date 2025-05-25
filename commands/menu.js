// commands/menu.js
module.exports = (sock, msg) => {
  const from = msg.key.remoteJid;
  const menuText = `
📦 *Daftar produk game yang tersedia untuk Top Up melalui MAXI Bot:*
1. *PUBG Mobile*
2. *Mobile Legend*
3. *Free Fire*

Silakan gunakan perintah dibawah sesuai kebutuhan.
➤ Contoh: ml / pubg / ff
`;

  sock.sendMessage(from, { text: menuText }, { quoted: msg });
};
