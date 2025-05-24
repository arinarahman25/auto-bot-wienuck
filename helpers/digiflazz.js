const crypto = require('crypto');
const axios = require('axios');

const username = process.env.DIGIFLAZZ_USERNAME;
const apiKey = process.env.DIGIFLAZZ_API_KEY;
const BASE_URL = 'https://api.digiflazz.com/v1';

function sign(data) {
  return crypto.createHash('md5').update(username + apiKey + data).digest('hex');
}

async function cekSaldo() {
  const signData = sign('depo');
  const payload = {
    cmd: 'deposit',
    username,
    sign: signData
  };

  const { data } = await axios.post(`${BASE_URL}/cek-saldo`, payload);
  return data;
}

async function getProduk() {
  const payload = {
    cmd: 'prepaid',
    username,
    sign: sign('pricelist')
  };

  const { data } = await axios.post(`${BASE_URL}/price-list`, payload);
  return data.data;
}

async function topup({ buyer_sku_code, customer_no, ref_id }) {
  const signData = sign(ref_id);
  const payload = {
    username,
    buyer_sku_code,
    customer_no,
    ref_id,
    sign: signData
  };

  const { data } = await axios.post(`${BASE_URL}/topup`, payload);
  return data;
}

async function cekStatus(ref_id) {
  const payload = {
    cmd: 'status',
    username,
    ref_id,
    sign: sign(ref_id)
  };

  const { data } = await axios.post(`${BASE_URL}/cek-status`, payload);
  return data;
}

module.exports = {
  cekSaldo,
  getProduk,
  topup,
  cekStatus
};
