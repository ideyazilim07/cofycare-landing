// Netlify Function - E-posta Bildirimleri
const axios = require('axios');

// SendGrid API Key - Environment variables'dan alınacak
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'info@cofycare.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@cofycare.com';

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { orderData, type } = JSON.parse(event.body);
    
    if (!SENDGRID_API_KEY) {
      console.error('SendGrid API key not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Email service not configured' })
      };
    }

    let result;
    
    if (type === 'customer') {
      // Müşteriye sipariş onay e-postası
      result = await sendCustomerEmail(orderData);
    } else if (type === 'admin') {
      // Admin'e yeni sipariş bildirimi
      result = await sendAdminEmail(orderData);
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid email type' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Email sent successfully' })
    };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to send email' })
    };
  }
};

// Müşteriye sipariş onay e-postası
async function sendCustomerEmail(orderData) {
  const { name, email, orderId, items, totals } = orderData;
  
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₺${item.price.toLocaleString('tr-TR')}</td>
    </tr>
  `).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4a90e2; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .order-details { background: white; padding: 15px; margin: 20px 0; border-radius: 5px; }
        table { width: 100%; border-collapse: collapse; }
        .total { font-weight: bold; font-size: 18px; color: #4a90e2; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Siparişiniz Alındı!</h1>
        </div>
        <div class="content">
          <p>Merhaba ${name},</p>
          <p>Siparişiniz başarıyla alındı. Sipariş detaylarınız aşağıdadır:</p>
          
          <div class="order-details">
            <h3>Sipariş No: ${orderId}</h3>
            <table>
              <thead>
                <tr style="background: #f0f0f0;">
                  <th style="padding: 10px; text-align: left;">Ürün</th>
                  <th style="padding: 10px; text-align: center;">Adet</th>
                  <th style="padding: 10px; text-align: right;">Fiyat</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            <p class="total" style="text-align: right; margin-top: 20px;">
              Toplam: ₺${totals.total.toLocaleString('tr-TR')}
            </p>
          </div>
          
          <p>Siparişiniz kargoya verildiğinde size bilgi vereceğiz.</p>
          <p>Sorularınız için bize <a href="mailto:info@cofycare.com">info@cofycare.com</a> adresinden ulaşabilirsiniz.</p>
        </div>
        <div class="footer">
          <p>CofyCare - Kahve Makinesi Temizlik Tabletleri</p>
          <p>© 2026 Tüm hakları saklıdır.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const emailData = {
    personalizations: [{
      to: [{ email: email }]
    }],
    from: { email: FROM_EMAIL, name: 'CofyCare' },
    subject: `Sipariş Onayı - ${orderId}`,
    content: [{
      type: 'text/html',
      value: htmlContent
    }]
  };

  return await sendEmailViaSendGrid(emailData);
}

// Admin'e yeni sipariş bildirimi
async function sendAdminEmail(orderData) {
  const { name, surname, email, phone, orderId, items, totals, address, city, district } = orderData;
  
  const itemsText = items.map(item => 
    `- ${item.name} x${item.quantity} = ₺${(item.price * item.quantity).toLocaleString('tr-TR')}`
  ).join('\n');

  const textContent = `
YENİ SİPARİŞ ALINDI!

Sipariş No: ${orderId}
Tarih: ${new Date().toLocaleString('tr-TR')}

MÜŞTERİ BİLGİLERİ:
Ad Soyad: ${name} ${surname}
E-posta: ${email}
Telefon: ${phone}
Adres: ${address}, ${district}/${city}

SİPARİŞ DETAYLARI:
${itemsText}

TOPLAM: ₺${totals.total.toLocaleString('tr-TR')}

Siparişi yönetmek için admin paneline giriş yapın.
  `;

  const emailData = {
    personalizations: [{
      to: [{ email: ADMIN_EMAIL }]
    }],
    from: { email: FROM_EMAIL, name: 'CofyCare Sipariş Sistemi' },
    subject: `🔔 Yeni Sipariş - ${orderId}`,
    content: [{
      type: 'text/plain',
      value: textContent
    }]
  };

  return await sendEmailViaSendGrid(emailData);
}

// SendGrid API ile e-posta gönder
async function sendEmailViaSendGrid(emailData) {
  const response = await axios.post('https://api.sendgrid.com/v3/mail/send', emailData, {
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.data;
}