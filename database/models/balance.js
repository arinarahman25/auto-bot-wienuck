// database/models/balance.js
const mongoose = require("mongoose");

const balanceSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    unique: true,
  },
  saldo: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Balance", balanceSchema);
