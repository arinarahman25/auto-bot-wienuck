const axios = require('axios');
const crypto = require('crypto');

// Ambil kredensial dari .env
const TRIPAY_API_KEY = process.env.TRIPAY_API_KEY;
const TRIPAY_MERCHANT_CODE = process.env.TRIPAY_MERCHANT_CODE;
const TRIPAY_PRIVATE_KEY = process.env.TRIPAY_PRIVATE_KEY;

const BASE_URL = 'https://tripay.co.id/api';

// Fungsi untuk membuat signature
function generateSignature(ref_id, amount) {
  return crypto.createHmac('sha256', TRIPAY_PRIVATE_KEY)
    .update(`${TRIPAY_MERCHANT_CODE}${ref_id}${amount}`)
    .digest('hex');
}

// Fungsi: Ambil semua metode pembayaran dari Tripay
async function getPaymentChannels() {
  try {
    const { data } = await axios.get(`${BASE_URL}/merchant/payment-channel`, {
      headers: {
        Authorization: `Bearer ${TRIPAY_API_KEY}`
      }
    });
    return data.data;
  } catch (err) {
    console.error('Gagal mengambil kanal pembayaran:', err.response?.data || err.message);
    return [];
  }
}

// Fungsi: Buat transaksi pembayaran
async function createTransaction({ method, name, amount, email, phone, ref_id }) {
  const signature = generateSignature(ref_id, amount);

  const payload = {
    method,
    merchant_ref: ref_id,
    amount,
    customer_name: name,
    customer_email: email,
    customer_phone: phone,
    order_items: [
      {
        sku: 'TOPUP',
        name: 'Top Up Game',
        price: amount,
        quantity: 1
      }
    ],
    callback_url: 'https://maxigamesstore.com/callback', // bisa dikosongkan jika tidak dipakai
    return_url: 'https://maxigamesstore.com/thanks',    // bisa dikosongkan jika tidak dipakai
    signature
  };

  try {
    const { data } = await axios.post(`${BASE_URL}/transaction/create`, payload, {
      headers: {
        Authorization: `Bearer ${TRIPAY_API_KEY}`
      }
    });
    return data;
  } catch (err) {
    console.error('Gagal membuat transaksi Tripay:', err.response?.data || err.message);
    throw new Error('Gagal membuat transaksi Tripay');
  }
}

// Fungsi: Cek status transaksi berdasarkan ref_id
async function checkTransactionStatus(ref_id) {
  try {
    const { data } = await axios.get(`${BASE_URL}/transaction/detail?reference=${ref_id}`, {
      headers: {
        Authorization: `Bearer ${TRIPAY_API_KEY}`
      }
    });
    return data.data;
  } catch (err) {
    console.error('Gagal cek status transaksi:', err.response?.data || err.message);
    throw new Error('Gagal cek status transaksi');
  }
}

module.exports = {
  getPaymentChannels,
  createTransaction,
  checkTransactionStatus
};
