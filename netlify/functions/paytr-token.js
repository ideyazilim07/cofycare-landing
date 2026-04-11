// Netlify Function - PayTR Token Oluşturma
const crypto = require('crypto');
const axios = require('axios');

// PayTR Merchant bilgileri - Environment variables'dan alınacak
const MERCHANT_ID = process.env.PAYTR_MERCHANT_ID;
const MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY;
const MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT;

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // OPTIONS request (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Sadece POST izin ver
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Environment variables kontrolü
    if (!MERCHANT_ID || !MERCHANT_KEY || !MERCHANT_SALT) {
      console.error('Missing environment variables:', {
        hasMerchantId: !!MERCHANT_ID,
        hasMerchantKey: !!MERCHANT_KEY,
        hasMerchantSalt: !!MERCHANT_SALT
      });
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          status: 'error',
          message: 'Merchant configuration missing'
        })
      };
    }
    const body = JSON.parse(event.body);
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
    } = body;

    // IP adresini al
    const user_ip = event.headers['x-forwarded-for'] || event.headers['client-ip'] || '0.0.0.0';

    // Sepet bilgisini JSON string'e çevir ve Base64 encode et
    const user_basket_str = JSON.stringify(user_basket || []);
    const user_basket_base64 = Buffer.from(user_basket_str).toString('base64');

    // PayTR hash oluştur (doğru formül)
    // hash_str = merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode
    const no_installment = '0';
    const max_installment = '12';
    const currency = 'TL';
    
    const hash_str = `${MERCHANT_ID}${user_ip}${merchant_oid}${email}${payment_amount}${user_basket_base64}${no_installment}${max_installment}${currency}${test_mode}`;
    const paytr_token = crypto.createHmac('sha256', MERCHANT_KEY)
      .update(hash_str + MERCHANT_SALT)
      .digest('base64');

    // PayTR API'ye istek gönder
    const paytr_data = new URLSearchParams({
      merchant_id: MERCHANT_ID,
      user_ip,
      merchant_oid,
      email,
      payment_amount,
      paytr_token,
      user_basket: user_basket_base64,
      debug_on: test_mode === '1' ? '1' : '0',
      test_mode: test_mode === '1' ? '1' : '0',
      no_installment: '0',
      max_installment: '12',
      user_name,
      user_address,
      user_phone,
      merchant_ok_url,
      merchant_fail_url,
      timeout_limit: '30'
    });

    const response = await axios.post('https://www.paytr.com/odeme/api/get-token', paytr_data.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (response.data.status === 'success') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'success',
          token: response.data.token
        })
      };
    } else {
      console.error('PayTR hatası:', response.data);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          status: 'error',
          message: response.data.err_msg || 'PayTR token alınamadı'
        })
      };
    }
  } catch (error) {
    console.error('PayTR API hatası:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        status: 'error',
        message: 'Sunucu hatası'
      })
    };
  }
};