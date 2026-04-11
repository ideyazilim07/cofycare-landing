/**
 * PayTR Backend API - Node.js Express Örneği
 * Bu dosyayı backend sunucunuza kurmanız gerekiyor
 */

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// PayTR Merchant bilgileri - GERÇEK DEĞERLERLE DEĞİŞTİRİN
const MERCHANT_ID = 'YOUR_MERCHANT_ID';
const MERCHANT_KEY = 'YOUR_MERCHANT_KEY';
const MERCHANT_SALT = 'YOUR_MERCHANT_SALT';

/**
 * PayTR token oluşturma endpoint'i
 * Frontend'den gelen ödeme bilgilerini alıp PayTR'den token alır
 */
app.post('/api/paytr/token', async (req, res) => {
  try {
    const {
      merchant_oid,
      email,
      payment_amount,
      user_name,
      user_address,
      user_phone,
      merchant_ok_url,
      merchant_fail_url,
      user_basket,
      test_mode
    } = req.body;

    // IP adresini al
    const user_ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Sepet bilgisini JSON string'e çevir ve Base64 encode et
    const user_basket_str = JSON.stringify(user_basket || []);
    const user_basket_base64 = Buffer.from(user_basket_str).toString('base64');

    // PayTR hash oluştur
    const hash_str = `${MERCHANT_ID}${user_ip}${merchant_oid}${email}${payment_amount}${user_basket_base64}${test_mode}${merchant_ok_url}${merchant_fail_url}`;
    const paytr_token = crypto.createHmac('sha256', MERCHANT_KEY)
      .update(hash_str + MERCHANT_SALT)
      .digest('base64');

    // PayTR API'ye istek gönder
    const paytr_data = {
      merchant_id: MERCHANT_ID,
      user_ip,
      merchant_oid,
      email,
      payment_amount,
      paytr_token,
      user_basket: user_basket_base64,
      debug_on: test_mode === '1' ? 1 : 0,
      test_mode: test_mode === '1' ? 1 : 0,
      no_installment: 0,
      max_installment: 12,
      user_name,
      user_address,
      user_phone,
      merchant_ok_url,
      merchant_fail_url,
      timeout_limit: 30
    };

    const response = await axios.post('https://www.paytr.com/odeme/api/get-token', paytr_data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (response.data.status === 'success') {
      res.json({
        status: 'success',
        token: response.data.token
      });
    } else {
      console.error('PayTR hatası:', response.data);
      res.json({
        status: 'error',
        message: response.data.err_msg || 'PayTR token alınamadı'
      });
    }
  } catch (error) {
    console.error('PayTR API hatası:', error);
    res.status(500).json({
      status: 'error',
      message: 'Sunucu hatası'
    });
  }
});

/**
 * PayTR callback endpoint'i
 * Ödeme sonucu PayTR tarafından bu URL'e gönderilir
 */
app.post('/api/paytr/callback', async (req, res) => {
  try {
    const {
      merchant_oid,
      status,
      total_amount,
      hash
    } = req.body;

    // Hash doğrulama
    const hash_str = `${merchant_oid}${MERCHANT_SALT}${status}${total_amount}`;
    const expected_hash = crypto.createHmac('sha256', MERCHANT_KEY)
      .update(hash_str)
      .digest('base64');

    if (hash !== expected_hash) {
      console.error('PayTR hash doğrulama hatası');
      return res.send('Hash doğrulama hatası');
    }

    // Ödeme durumunu işle
    if (status === 'success') {
      // Başarılı ödeme - siparişi onayla
      console.log('Ödeme başarılı:', merchant_oid);
      // TODO: Siparişi veritabanında güncelle
    } else {
      // Başarısız ödeme
      console.log('Ödeme başarısız:', merchant_oid);
    }

    res.send('OK');
  } catch (error) {
    console.error('Callback hatası:', error);
    res.status(500).send('Hata');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`PayTR API sunucusu ${PORT} portunda çalışıyor`);
});

module.exports = app;