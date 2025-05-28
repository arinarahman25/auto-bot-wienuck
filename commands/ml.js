const { getProduk } = require("../helpers/digiflazz");

module.exports = async (sock, msg) => {
  try {
    const produk = await getProduk();
    const filtered = produk.filter(
      (p) => p.brand && p.brand.toLowerCase().includes("mobile legend"),
    );

    const limited = filtered.slice(0, 50);

    let list = "*🎮 Daftar Produk Mobile Legends*\n\n";
    for (const item of limited) {
      list += `🆔 *${item.buyer_sku_code}*\n📌 ${item.product_name}\n💰 Rp${item.price.toLocaleString()}\n\n`;
    }

    list +=
      "_Ketik kode produk dan UID kamu untuk top up_\nContoh: `topup ml1000 1234567890 1234`";

    await sock.sendMessage(msg.key.remoteJid, { text: list }, { quoted: msg });
  } catch (err) {
    console.error("Error getProduk ML:", err);
    await sock.sendMessage(
      msg.key.remoteJid,
      { text: "Gagal mengambil produk Mobile Legends." },
      { quoted: msg },
    );
  }
};
