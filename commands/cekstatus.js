const Transaction = require('../models/transaction');
const { checkTransaction } = require('../helpers/tripay');
const { topupGame } = require('../helpers/digiflazz');

module.exports = async (sock, msg, args) => {
  const chat = msg.key.remoteJid;

  if (args.length < 1) {
    return sock.sendMessage(chat, { text: 'Ketik: !cekstatus <ref_id>' }, { quoted: msg });
  }

  const ref_id = args[0];
  const trx = await Transaction.findOne({ ref_id });

  if (!trx) {
    return sock.sendMessage(chat, { text: `Transaksi dengan ref_id ${ref_id} tidak ditemukan.` }, { quoted: msg });
  }

  // Jika sudah sukses
  if (trx.status_topup === 'SUCCESS') {
    return sock.sendMessage(chat, { text: `✅ Transaksi sudah selesai dan sukses.` }, { quoted: msg });
  }

  try {
    const status = await checkTransaction(ref_id);
    const status_payment = status.data.status;

    if (status_payment === 'PAID' && trx.status_topup === 'PENDING') {
      // lanjut topup ke Digiflazz
      const result = await topupGame({
        ref_id: trx.ref_id,
        buyer_sku_code: trx.buyer_sku_code,
        customer_no: trx.customer_no
      });

      if (result.data.rc === '00') {
        trx.status_topup = 'SUCCESS';
        trx.status_payment = 'PAID';
        await trx.save();

        await sock.sendMessage(chat, {
          text: `✅ Topup berhasil!\nRef ID: ${ref_id}\nStatus: SUCCESS`
        }, { quoted: msg });
      } else {
        await sock.sendMessage(chat, {
          text: `❌ Topup gagal: ${result.data.message}`
        }, { quoted: msg });
      }
    } else {
      await sock.sendMessage(chat, {
        text: `⏳ Status saat ini:\nRef ID: ${ref_id}\nPembayaran: ${status_payment}\nTopup: ${trx.status_topup}`
      }, { quoted: msg });
    }
  } catch (err) {
    console.error('Cek status error:', err);
    await sock.sendMessage(chat, {
      text: '❌ Gagal cek status. Silakan coba beberapa saat lagi.'
    }, { quoted: msg });
  }
};
