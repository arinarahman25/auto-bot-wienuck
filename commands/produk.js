const { getProduk } = require('../helpers/digiflazz');

module.exports = async (sock, msg) => {
  try {
    const produk = await getProduk();

    const filtered = produk.filter(p => p.category === 'Games'); // filter kategori game
    const limited = filtered.slice(0, 10); // batasi agar tidak panjang

    let list = '*📦 Daftar Produk Game (Contoh)*\n\n';
    for (const item of limited) {
      list += `🆔 *${item.buyer_sku_code}*\n📌 ${item.product_name}\n💰 Rp${item.price.toLocaleString()}\n\n`;
    }

    list += '_Ketik kode produk dan UID kamu untuk top up_\nContoh: `!topup ML10 12345678`';

    await sock.sendMessage(msg.key.remoteJid, { text: list }, { quoted: msg });
  } catch (err) {
    console.error('Error getProduk:', err);
    await sock.sendMessage(msg.key.remoteJid, { text: 'Gagal mengambil produk, coba lagi nanti.' }, { quoted: msg });
  }
};
