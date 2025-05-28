const express = require("express");
const router = express.Router();

// Route untuk menerima webhook dari Tripay
router.post("/tripay", async (req, res) => {
  const data = req.body;

  // Log webhook yang masuk
  console.log("📥 Webhook diterima:", data);

  // Cek status PAID
  if (data.status !== "PAID") {
    return res.status(200).json({ message: "Bukan status PAID, diabaikan." });
  }

  try {
    const noWa = data.merchant_ref; // No WA user (misalnya 628xxxxxx)
    const amount = Number(data.amount_received); // Nominal yang dibayar

    // Cari user berdasarkan nomor WA
    let user = await Saldo.findOne({ nomor: noWa });

    if (user) {
      // Tambah saldo user
      user.saldo += amount;
      await user.save();
    } else {
      // Jika belum terdaftar, buat data baru
      user = new Saldo({ nomor: noWa, saldo: amount });
      await user.save();
    }

    console.log(`✅ Saldo untuk ${noWa} telah ditambah Rp${amount}`);

    return res.status(200).json({ message: "Saldo berhasil ditambahkan." });
  } catch (error) {
    console.error("❌ Gagal update saldo:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
