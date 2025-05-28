const axios = require("axios");
require("dotenv").config();

const tripayQris = async ({
  method,
  amount,
  customer_name,
  customer_email,
  customer_phone,
}) => {
  const apiKey = process.env.TRIPAY_API_KEY;
  const privateKey = process.env.TRIPAY_PRIVATE_KEY;
  const merchantCode = process.env.TRIPAY_MERCHANT_CODE;

  const orderId = "ORDER-" + Date.now();
  const callbackUrl = "https://your-webhook-url.com/webhook/tripay"; // nanti diganti saat bikin webhook

  try {
    const { data } = await axios.post(
      "https://tripay.co.id/api/transaction/create",
      {
        method,
        merchant_ref: orderId,
        amount,
        customer_name,
        customer_email,
        customer_phone,
        order_items: [
          {
            sku: "SALDO",
            name: "Isi Saldo",
            price: amount,
            quantity: 1,
            product_url: "https://maxigamesstore.com",
            image_url: "https://maxigamesstore.com/logo.png",
          },
        ],
        callback_url: callbackUrl,
        return_url: "https://maxigamesstore.com",
        expired_time: Math.floor(Date.now() / 1000) + 3600,
        signature: require("crypto")
          .createHmac("sha256", privateKey)
          .update(merchantCode + orderId + amount)
          .digest("hex"),
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    return data;
  } catch (error) {
    console.error(
      "❌ Gagal membuat transaksi Tripay:",
      error?.response?.data || error.message,
    );
    return null;
  }
};

module.exports = tripayQris;
