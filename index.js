(async () => {
  const { webcrypto } = await import("node:crypto");
  globalThis.crypto = webcrypto;

  require("./main"); // Pisahkan logika utama ke file main.js
})();
