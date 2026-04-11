/**
 * CofyCare Checkout System
 * Handles customer info, validation, and PayTR integration
 */

class Checkout {
  constructor() {
    this.cart = window.cart;
    this.init();
  }

  init() {
    this.renderCheckoutItems();
    this.setupFormValidation();
    this.loadCities();
  }

  // Render checkout items
  renderCheckoutItems() {
    const itemsContainer = document.getElementById('checkout-items');
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const totalEl = document.getElementById('total');
    const checkoutTotalEl = document.getElementById('checkout-total');

    if (!itemsContainer) return;

    const cartData = this.cart.getCheckoutData();

    if (cartData.items.length === 0) {
      window.location.href = 'index.html#paketler';
      return;
    }

    // Render items
    itemsContainer.innerHTML = cartData.items.map(item => `
      <div class="checkout-item">
        <img src="product-1.png" alt="${item.name}" class="checkout-item-img">
        <div class="checkout-item-info">
          <h4>${item.name}</h4>
          <p>Adet: ${item.quantity}</p>
        </div>
        <div class="checkout-item-price">
          <span>₺${(item.price * item.quantity).toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
        </div>
      </div>
    `).join('');

    // Update totals
    const totals = cartData.totals;
    if (subtotalEl) subtotalEl.textContent = `₺${totals.subtotal.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    if (shippingEl) shippingEl.textContent = totals.shipping === 0 ? 'Ücretsiz' : `₺${totals.shipping.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    if (totalEl) totalEl.textContent = `₺${totals.total.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    if (checkoutTotalEl) checkoutTotalEl.textContent = totals.total.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  }

  // Setup form validation
  setupFormValidation() {
    const form = document.getElementById('checkout-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (this.validateForm()) {
        this.processOrder();
      }
    });

    // Phone number formatting
    const phoneInput = form.querySelector('input[name="phone"]');
    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        
        // Format: 5XX XXX XX XX
        if (value.length >= 7) {
          value = value.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4');
        } else if (value.length >= 4) {
          value = value.replace(/(\d{3})(\d+)/, '$1 $2');
        }
        
        e.target.value = value;
      });
    }

    // City change - load districts
    const citySelect = form.querySelector('select[name="city"]');
    if (citySelect) {
      citySelect.addEventListener('change', (e) => {
        this.loadDistricts(e.target.value);
      });
    }
  }

  // Validate form
  validateForm() {
    const form = document.getElementById('checkout-form');
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        isValid = false;
        field.classList.add('error');
        
        // Show error message
        let errorMsg = field.parentElement.querySelector('.error-message');
        if (!errorMsg) {
          errorMsg = document.createElement('span');
          errorMsg.className = 'error-message';
          field.parentElement.appendChild(errorMsg);
        }
        errorMsg.textContent = 'Bu alan zorunludur';
      } else {
        field.classList.remove('error');
        const errorMsg = field.parentElement.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();
      }
    });

    // Email validation
    const emailField = form.querySelector('input[name="email"]');
    if (emailField && emailField.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailField.value)) {
        isValid = false;
        emailField.classList.add('error');
      }
    }

    // Phone validation - 10 veya 11 hane kabul et
    const phoneField = form.querySelector('input[name="phone"]');
    if (phoneField && phoneField.value) {
      const phoneDigits = phoneField.value.replace(/\D/g, '');
      if (phoneDigits.length !== 10 && phoneDigits.length !== 11) {
        isValid = false;
        phoneField.classList.add('error');
        alert('Telefon numarası 10 veya 11 haneli olmalıdır (örn: 533 218 30 33 veya 0533 218 30 33)');
      }
    }

    return isValid;
  }

  // Load cities
  loadCities() {
    const cities = [
      'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin',
      'Aydın', 'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa',
      'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan',
      'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Isparta',
      'Mersin', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir',
      'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla',
      'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt',
      'Sinop', 'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak',
      'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman', 'Kırıkkale', 'Batman',
      'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'
    ];

    const citySelect = document.querySelector('select[name="city"]');
    if (citySelect) {
      citySelect.innerHTML = '<option value="">İl Seçin</option>' +
        cities.map(city => `<option value="${city}">${city}</option>
        `).join('');
    }
  }

  // Load districts (from districts.js)
  loadDistricts(city) {
    const districtSelect = document.querySelector('select[name="district"]');
    if (districtSelect && typeof districtsData !== 'undefined') {
      const cityDistricts = districtsData[city] || ['Merkez'];
      districtSelect.innerHTML = '<option value="">İlçe Seçin</option>' +
        cityDistricts.map(district => `<option value="${district}">${district}</option>`).join('');
    }
  }

  // Process order
  async processOrder() {
    const form = document.getElementById('checkout-form');
    const formData = new FormData(form);
    
    // Telefon numarasını düzenle - 10 haneliyse başına 0 ekle
    let phoneDigits = formData.get('phone').replace(/\D/g, '');
    if (phoneDigits.length === 10) {
      phoneDigits = '0' + phoneDigits;
    }
    
    const orderData = {
      orderId: this.generateOrderId(),
      name: formData.get('name'),
      surname: formData.get('surname'),
      email: formData.get('email'),
      phone: phoneDigits,
      address: formData.get('address'),
      city: formData.get('city'),
      district: formData.get('district'),
      items: this.cart.items,
      totals: this.cart.getTotals(),
      date: new Date().toISOString()
    };

    // Save order to localStorage (in production, this would go to a database)
    this.saveOrder(orderData);

    // Update stock
    this.cart.items.forEach(item => {
      this.cart.updateStock(item.id, item.quantity);
    });

    // Send notifications
    this.sendNotifications(orderData);

    // Redirect to PayTR or success page
    this.redirectToPayment(orderData);
  }

  // Generate unique order ID
  generateOrderId() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `CFY${timestamp}${random}`;
  }

  // Save order
  saveOrder(orderData) {
    const orders = JSON.parse(localStorage.getItem('coffytab_orders') || '[]');
    orders.push(orderData);
    localStorage.setItem('coffytab_orders', JSON.stringify(orders));
    
    // Also save current order for success page
    localStorage.setItem('coffytab_current_order', JSON.stringify(orderData));
  }

  // Send notifications
  sendNotifications(orderData) {
    // Email notification (using EmailJS or similar)
    this.sendEmailNotification(orderData);
    
    // WhatsApp notification
    this.sendWhatsAppNotification(orderData);
  }

  // Email notification
  async sendEmailNotification(orderData) {
    try {
      // Müşteriye sipariş onay e-postası gönder
      await fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderData: orderData,
          type: 'customer'
        })
      });

      // Admin'e yeni sipariş bildirimi gönder
      await fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderData: orderData,
          type: 'admin'
        })
      });

      console.log('Email notifications sent for order:', orderData.orderId);
    } catch (error) {
      console.error('Email notification error:', error);
    }
  }

  // WhatsApp notification
  async sendWhatsAppNotification(orderData) {
    try {
      await fetch('/.netlify/functions/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderData })
      });
      console.log('WhatsApp notification sent for order:', orderData.orderId);
    } catch (error) {
      console.error('WhatsApp notification error:', error);
    }
  }

  // Redirect to payment
  redirectToPayment(orderData) {
    // PayTR iframe entegrasyonu
    const paytr = new PayTRPayment();
    paytr.initiatePayment(orderData);
  }
}

// Initialize checkout when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('checkout-form')) {
    window.checkout = new Checkout();
  }
});

// Export
window.Checkout = Checkout;
