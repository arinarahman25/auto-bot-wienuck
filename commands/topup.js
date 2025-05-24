const { getProduk } = require('../helpers/digiflazz');
const { createTransaction } = require('../helpers/tripay');
const Transaction = require('../models/transaction');
const crypto = require('crypto');

module.exports = async (sock, msg, args) => {
  const sender = msg.key.participant || msg.key.remoteJid;
  const chat = msg.key.remoteJid;

  if (args.length < 2) {
    return sock.sendMessage(chat, { text: 'Format salah!\nContoh: !topup ML10 1234567890' }, { quoted: msg });
  }

  const [sku, uid] = args;
  const produk = await getProduk();
  const item = produk.find(p => p.buyer_sku_code === sku);

  if (!item) {
    return sock.sendMessage(chat, { text: 'Produk tidak ditemukan. Ketik !produk untuk melihat daftar.' }, { quoted: msg });
  }

  const ref_id = crypto.randomBytes(6).toString('hex'); // ID unik acak
  const phone = sender.split('@')[0]; // ambil nomor WhatsApp

  try {
    const payment = await createTransaction({
      method: 'QRIS', // default metode QRIS, bisa diganti
      name: phone,
      email: `${phone}@gmail.com`,
      phone: phone,
      amount: item.price,
      ref_id
    });

    // Simpan ke database
    await Transaction.create({
      ref_id,
      customer_no: uid,
      buyer_sku_code: item.buyer_sku_code,
      amount: item.price,
      payment_method: 'QRIS',
      status_payment: 'UNPAID',
      status_topup: 'PENDING'
    });

    // Kirim info ke user
    const message = `✅ Transaksi dibuat!

🆔 Ref ID: ${ref_id}
🎮 Game: ${item.product_name}
📌 SKU: ${item.buyer_sku_code}
👤 UID: ${uid}
💰 Harga: Rp${item.price.toLocaleString()}

Silakan bayar via QRIS:
${payment.data.checkout_url}`;

    await sock.sendMessage(chat, { text: message }, { quoted: msg });

  } catch (err) {
    console.error('Topup error:', err);
    await sock.sendMessage(chat, { text: 'Gagal membuat transaksi. Coba lagi nanti.' }, { quoted: msg });
  }
};
