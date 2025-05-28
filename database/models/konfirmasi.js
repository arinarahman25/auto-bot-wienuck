const mongoose = require("mongoose");

const konfirmasiSchema = new mongoose.Schema({
  user: String, // Nomor WA pengirim
  nominal: Number, // Nominal saldo yang diminta
  buktiUrl: String, // URL gambar bukti transfer
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Konfirmasi", konfirmasiSchema);
