const { getProduk } = require('../helpers/digiflazz');
const { createTransaction } = require('../helpers/tripay');
const Transaction = require('../models/transaction');
const crypto = require('crypto');

module.exports = async (sock, msg, args) => {
  const sender = msg.key.participant || msg.key.remoteJid;
  const chat = msg.key.remoteJid;

  if (args.length < 2) {
    return sock.sendMessage(chat, {
      text: '❌ Format salah!\nContoh:\n• topup ml5 123456789 1234\n• topup pubg60 123456789'
    }, { quoted: msg });
  }

  const [sku, uid, serverId] = args;

  try {
    const produk = await getProduk();
    const item = produk.find(p => p.buyer_sku_code.toLowerCase() === sku.toLowerCase());

    if (!item) {
      return sock.sendMessage(chat, {
        text: '❌ Produk tidak ditemukan. Ketik !help untuk melihat daftar perintah.'
      }, { quoted: msg });
    }

    // Periksa apakah produk adalah Mobile Legends
    const isML = /mobile\s?legends?/i.test(item.product_name);

    if (isML && (!uid || !serverId)) {
      return sock.sendMessage(chat, {
        text: '❌ Untuk Mobile Legends, gunakan format:\ntopup ml5 123456789 1234'
      }, { quoted: msg });
    }

    const customer_no = isML ? `${uid}${serverId}` : uid;

    const ref_id = crypto.randomBytes(6).toString('hex');
    const phone = sender.split('@')[0];
    const hargaAsli = Number(item.price);

    if (isNaN(hargaAsli)) {
      throw new Error('Harga asli tidak valid!');
    }

    const payment = await createTransaction({
      method: 'QRIS',
      name: phone,
      email: `${phone}@gmail.com`,
      phone: phone,
      hargaAsli,
      ref_id
    });

    await Transaction.create({
      ref_id,
      customer_no,
      buyer_sku_code: item.buyer_sku_code,
      amount: Math.round(hargaAsli * 1.05),
      payment_method: 'QRIS',
      status_payment: 'UNPAID',
      status_topup: 'PENDING'
    });

    // Buat URL fallback
    const checkoutURL = encodeURI(payment?.data?.checkout_url || 'https://tripay.co.id/checkout');

    // Buat isi pesan WhatsApp
    const userInfo = isML
      ? `👤 UID: ${uid}\n🌐 Server ID: ${serverId}`
      : `👤 UID: ${uid}`;

    const messageText = `✅ Transaksi berhasil dibuat!

🆔 Ref ID: ${ref_id}
🎮 Game: ${item.product_name}
📌 SKU: ${item.buyer_sku_code}
${userInfo}
💰 Harga: Rp${Math.round(hargaAsli * 1.05).toLocaleString()}

Silakan bayar via QRIS:
🔗 ${checkoutURL}`;

    console.log('[DEBUG MESSAGE]:', messageText);

    await sock.sendMessage(chat, { text: messageText }, { quoted: msg });

  } catch (err) {
    console.error('Topup error:', err);
    await sock.sendMessage(chat, {
      text: `❌ Gagal membuat transaksi:\n${err.message}`
    }, { quoted: msg });
  }
};
