const { createCanvas, loadImage } = require("@napi-rs/canvas");

async function generateStruk({ nama, nomor, jumlah, metode, tanggal }) {
  const width = 600;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#121212";
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px sans-serif";
  ctx.fillText("🧾 STRUK ISI SALDO", 180, 50);

  // Isi Data
  ctx.font = "20px sans-serif";
  const entries = [
    ["Nama", nama],
    ["Nomor", nomor],
    ["Jumlah", `Rp ${jumlah.toLocaleString("id-ID")}`],
    ["Metode", metode],
    ["Tanggal", tanggal],
  ];

  let y = 100;
  for (const [label, value] of entries) {
    ctx.fillStyle = "#cccccc";
    ctx.fillText(`${label}:`, 80, y);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(value, 220, y);
    y += 40;
  }

  return canvas.toBuffer("image/png");
}

module.exports = generateStruk;
