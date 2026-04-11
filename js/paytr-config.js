/**
 * PayTR Configuration
 * Bu bilgileri PayTR panelinden alarak güncelleyin
 */

const PayTRConfig = {
  // PayTR Merchant bilgileri - GERÇEK DEĞERLERLE DEĞİŞTİRİN
  merchantId: 'YOUR_MERCHANT_ID',      // Örn: 123456
  merchantKey: 'YOUR_MERCHANT_KEY',    // Örn: a1b2c3d4e5f6...
  merchantSalt: 'YOUR_MERCHANT_SALT',  // Örn: x9y8z7...
  
  // PayTR API endpoint
  apiUrl: 'https://www.paytr.com/odeme/api/get-token',
  
  // Ödeme sonrası yönlendirme URL'leri
  successUrl: 'https://cofycare.com/order-success.html',
  failUrl: 'https://cofycare.com/order-failed.html',
  
  // Test modu (gerçek ödeme almadan test için true yapın)
  testMode: true
};

// Backend API URL (PayTR token oluşturma için)
// Netlify Functions kullanıyorsuz - otomatik olarak /.netlify/functions/paytr-token
const API_BASE_URL = window.location.origin;

// Export
window.PayTRConfig = PayTRConfig;
window.API_BASE_URL = API_BASE_URL;