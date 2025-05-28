const mongoose = require("mongoose");

const saldoHistorySchema = new mongoose.Schema(
  {
    nomor: { type: String, required: true },
    jumlah: { type: Number, required: true },
    admin: { type: String, required: true },
    waktu: { type: Date, default: Date.now },
  },
  { timestamps: true }, // ⬅️ aktifkan createdAt & updatedAt
);

module.exports = mongoose.model("SaldoHistory", saldoHistorySchema);
