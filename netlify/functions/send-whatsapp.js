// Netlify Function - WhatsApp Bildirimleri (Twilio WhatsApp Business API)
const axios = require('axios');

// Twilio credentials - Environment variables'dan alınacak
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER; // Örn: whatsapp:+14155238886
const ADMIN_WHATSAPP_NUMBER = process.env.ADMIN_WHATSAPP_NUMBER; // Örn: whatsapp:+905332182394

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
    const { orderData } = JSON.parse(event.body);
    
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      console.error('Twilio credentials not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'WhatsApp service not configured' })
      };
    }

    // WhatsApp mesajı oluştur
    const message = createWhatsAppMessage(orderData);
    
    // Twilio API ile mesaj gönder
    const result = await sendWhatsAppMessage(message);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'WhatsApp notification sent' })
    };
  } catch (error) {
    console.error('WhatsApp sending error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to send WhatsApp message' })
    };
  }
};

// WhatsApp mesajı oluştur
function createWhatsAppMessage(orderData) {
  const { name, surname, phone, orderId, items, totals, address, city, district } = orderData;
  
  const itemsList = items.map(item => 
    `• ${item.name} x${item.quantity} = ₺${(item.price * item.quantity).toLocaleString('tr-TR')}`
  ).join('\n');

  return `🛒 *YENİ SİPARİŞ ALINDI!*

📋 *Sipariş No:* ${orderId}
👤 *Müşteri:* ${name} ${surname}
📞 *Telefon:* ${phone}
📍 *Adres:* ${address}, ${district}/${city}

📦 *Sipariş Detayları:*
${itemsList}

💰 *Toplam Tutar:* ₺${totals.total.toLocaleString('tr-TR')}

🚚 Kargoya verildiğinde müşteriye bilgi verilecektir.`;
}

// Twilio API ile WhatsApp mesajı gönder
async function sendWhatsAppMessage(message) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  
  const data = new URLSearchParams({
    From: TWILIO_WHATSAPP_NUMBER,
    To: ADMIN_WHATSAPP_NUMBER,
    Body: message
  });

  const response = await axios.post(url, data.toString(), {
    auth: {
      username: TWILIO_ACCOUNT_SID,
      password: TWILIO_AUTH_TOKEN
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  return response.data;
}