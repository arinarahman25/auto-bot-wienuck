const { getProduk } = require('../helpers/digiflazz');

module.exports = async (sock, msg) => {
  try {
    const produk = await getProduk();

    // DEBUGGING
    console.log('📥 Total produk dari Digiflazz:', produk.length);

    const pubgList = produk.filter(p =>
      p.product_name && p.product_name.toLowerCase().includes('pubg')
    );

    console.log('🎯 PUBG ditemukan:', pubgList.map(p => p.product_name));

    const limited = pubgList.slice(0, 40);

    let list = '*🎮 Daftar Produk PUBG*\n\n';
    for (const item of limited) {
      list += `🆔 *${item.buyer_sku_code}*\n📌 ${item.product_name}\n💰 Rp${item.price.toLocaleString()}\n\n`;
    }

    if (limited.length === 0) {
      list = '❌ Tidak ada produk PUBG ditemukan.\nSilakan periksa kembali penamaan produk di Digiflazz.';
    } else {
      list += '_Ketik kode produk dan UID kamu untuk top up_\nContoh: `topup uc60 1234567890`';
    }

    await sock.sendMessage(msg.key.remoteJid, { text: list }, { quoted: msg });
  } catch (err) {
    console.error('❌ Error ambil produk PUBG:', err);
    await sock.sendMessage(msg.key.remoteJid, { text: 'Gagal mengambil produk PUBG.' }, { quoted: msg });
  }
};
