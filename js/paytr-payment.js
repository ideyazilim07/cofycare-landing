/**
 * PayTR Payment Integration
 * iframe tabanlı ödeme sistemi
 */

class PayTRPayment {
  constructor() {
    this.config = window.PayTRConfig || {};
    this.apiUrl = window.API_BASE_URL || '';
  }

  /**
   * PayTR iframe token oluştur ve ödeme sayfasını aç
   */
  async initiatePayment(orderData) {
    try {
      // Sipariş bilgilerini hazırla
      const paymentData = this.preparePaymentData(orderData);
      
      // Backend API'ye istek atarak PayTR token al
      const token = await this.getPayTRToken(paymentData);
      
      if (token) {
        // PayTR iframe'i göster
        this.showPayTRIframe(token);
      } else {
        throw new Error('PayTR token alınamadı');
      }
    } catch (error) {
      console.error('PayTR ödeme hatası:', error);
      alert('Ödeme başlatılırken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  }

  /**
   * PayTR için ödeme verilerini hazırla
   */
  preparePaymentData(orderData) {
    const userIp = '0.0.0.0'; // Gerçek IP backend'den alınacak
    const merchantOid = orderData.orderId;
    
    // Sepet ürünlerini PayTR formatına çevir
    const userBasket = orderData.items.map(item => ({
      name: item.name,
      price: item.price.toFixed(2),
      currency: 'TL'
    }));

    return {
      merchant_id: this.config.merchantId,
      user_ip: userIp,
      merchant_oid: merchantOid,
      email: orderData.email,
      payment_amount: (orderData.totals.total * 100).toString(), // Kuruş cinsinden
      currency: 'TL',
      test_mode: this.config.testMode ? '1' : '0',
      no_installment: '0',
      max_installment: '12',
      user_name: `${orderData.name} ${orderData.surname}`,
      user_address: `${orderData.address}, ${orderData.district}/${orderData.city}`,
      user_phone: orderData.phone,
      merchant_ok_url: this.config.successUrl,
      merchant_fail_url: this.config.failUrl,
      timeout_limit: '30',
      debug_on: '1'
    };
  }

  /**
   * Backend API'den PayTR token al
   * Not: Hash oluşturma sunucu tarafında yapılmalıdır
   */
  async getPayTRToken(paymentData) {
    try {
      // Backend API endpoint
      const response = await fetch(`${this.apiUrl}/api/paytr/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();
      
      if (result.status === 'success' && result.token) {
        return result.token;
      } else {
        console.error('PayTR token hatası:', result);
        return null;
      }
    } catch (error) {
      console.error('Token alma hatası:', error);
      return null;
    }
  }

  /**
   * PayTR iframe'i göster
   */
  showPayTRIframe(token) {
    // PayTR iframe container'ı oluştur
    const iframeContainer = document.createElement('div');
    iframeContainer.id = 'paytr-iframe-container';
    iframeContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // iframe'i oluştur
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.paytr.com/odeme/guvenli/${token}`;
    iframe.style.cssText = `
      width: 100%;
      max-width: 800px;
      height: 90%;
      border: none;
      border-radius: 8px;
      background: white;
    `;

    // Kapatma butonu
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    closeBtn.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      background: white;
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    closeBtn.onclick = () => {
      if (confirm('Ödeme işlemini iptal etmek istediğinize emin misiniz?')) {
        iframeContainer.remove();
      }
    };

    iframeContainer.appendChild(iframe);
    iframeContainer.appendChild(closeBtn);
    document.body.appendChild(iframeContainer);

    // ESC tuşu ile kapatma
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        if (confirm('Ödeme işlemini iptal etmek istediğinize emin misiniz?')) {
          iframeContainer.remove();
          document.removeEventListener('keydown', escHandler);
        }
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  /**
   * Ödeme sonucunu işle (callback URL'lerden gelen)
   */
  handlePaymentResult(result) {
    const { status, orderId, message } = result;
    
    if (status === 'success') {
      // Başarılı ödeme
      localStorage.setItem('payment_status', 'success');
      localStorage.setItem('payment_order_id', orderId);
      window.location.href = this.config.successUrl;
    } else {
      // Başarısız ödeme
      localStorage.setItem('payment_status', 'failed');
      localStorage.setItem('payment_error', message || 'Ödeme işlemi başarısız');
      window.location.href = this.config.failUrl;
    }
  }
}

// Export
window.PayTRPayment = PayTRPayment;