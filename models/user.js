const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nomor: {
    type: String,
    required: true,
    unique: true,
  },
  saldo: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
