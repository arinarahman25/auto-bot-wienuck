// helpers/saldo.js
const Balance = require("../database/models/balance");

async function getSaldo(user) {
  const data = await Balance.findOne({ user });
  return data?.saldo || 0;
}

async function tambahSaldo(user, jumlah) {
  const data = await Balance.findOneAndUpdate(
    { user },
    { $inc: { saldo: jumlah } },
    { upsert: true, new: true },
  );
  return data.saldo;
}

async function kurangiSaldo(user, jumlah) {
  const data = await Balance.findOneAndUpdate(
    { user },
    { $inc: { saldo: -jumlah } },
    { upsert: true, new: true },
  );
  return data.saldo;
}

module.exports = {
  getSaldo,
  tambahSaldo,
  kurangiSaldo,
};
