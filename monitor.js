
const cron = require('node-cron');

// Monitor bot setiap 5 menit
cron.schedule('*/5 * * * *', () => {
  console.log('🔍 Health check:', new Date().toISOString());
  console.log('💾 Memory usage:', process.memoryUsage());
  console.log('⏱️ Uptime:', Math.floor(process.uptime()), 'seconds');
});

// Monitor koneksi database setiap jam
cron.schedule('0 * * * *', async () => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      console.log('✅ Database connection: Healthy');
    } else {
      console.log('⚠️ Database connection: Issues detected');
    }
  } catch (error) {
    console.error('❌ Database monitor error:', error);
  }
});

module.exports = { cron };
