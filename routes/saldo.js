const mongoose = require("mongoose");

const saldoSchema = new mongoose.Schema({
  nomor: { type: String, required: true, unique: true },
  saldo: { type: Number, required: true, default: 0 },
});

module.exports = mongoose.model("Saldo", saldoSchema);
