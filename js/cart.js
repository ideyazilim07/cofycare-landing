/**
 * CofyCare E-Commerce Cart System
 * Full-featured shopping cart with localStorage persistence
 */

class Cart {
  constructor() {
    this.items = [];
    this.loadFromStorage();
    this.initCartDrawer();
  }

  // Load cart from localStorage
  loadFromStorage() {
    const saved = localStorage.getItem('coffytab_cart');
    if (saved) {
      this.items = JSON.parse(saved);
    }
  }

  // Save cart to localStorage
  saveToStorage() {
    localStorage.setItem('coffytab_cart', JSON.stringify(this.items));
  }

  // Add item to cart
  addItem(packageType, quantity = 1) {
    const packages = {
      1: { id: 'pkg-1', name: '1 Adet CoffyTab', price: 690, originalPrice: 690, savings: 0 },
      2: { id: 'pkg-2', name: '2 Adet CoffyTab', price: 1190, originalPrice: 1380, savings: 190 },
      3: { id: 'pkg-3', name: '3 Adet CoffyTab', price: 1690, originalPrice: 2070, savings: 380 }
    };

    const pkg = packages[packageType];
    if (!pkg) return;

    const existingItem = this.items.find(item => item.id === pkg.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        ...pkg,
        quantity: quantity,
        packageType: packageType
      });
    }

    this.saveToStorage();
    this.updateCartUI();
    this.openCartDrawer();
    
    // Show toast notification
    this.showToast(`${pkg.name} sepete eklendi!`);
  }

  // Remove item from cart
  removeItem(itemId) {
    this.items = this.items.filter(item => item.id !== itemId);
    this.saveToStorage();
    this.updateCartUI();
  }

  // Update item quantity
  updateQuantity(itemId, quantity) {
    const item = this.items.find(item => item.id === itemId);
    if (item) {
      if (quantity <= 0) {
        this.removeItem(itemId);
      } else {
        item.quantity = quantity;
        this.saveToStorage();
        this.updateCartUI();
      }
    }
  }

  // Get cart totals
  getTotals() {
    const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const originalTotal = this.items.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0);
    const totalSavings = originalTotal - subtotal;
    const shipping = subtotal >= 1000 ? 0 : 39.90;
    const total = subtotal + shipping;

    return {
      subtotal,
      originalTotal,
      totalSavings,
      shipping,
      total,
      itemCount: this.items.reduce((sum, item) => sum + item.quantity, 0)
    };
  }

  // Clear cart
  clear() {
    this.items = [];
    this.saveToStorage();
    this.updateCartUI();
  }

  // Initialize cart drawer
  initCartDrawer() {
    // Checkout sayfasında cart drawer oluşturma
    if (window.location.pathname.includes('checkout')) {
      return;
    }
    // Create cart drawer HTML if not exists
    if (!document.getElementById('cart-drawer')) {
      this.createCartDrawer();
    }
    this.updateCartUI();
  }

  // Create cart drawer HTML
  createCartDrawer() {
    const drawer = document.createElement('div');
    drawer.id = 'cart-drawer';
    drawer.className = 'cart-drawer';
    drawer.innerHTML = `
      <div class="cart-drawer-overlay" onclick="cart.closeCartDrawer()"></div>
      <div class="cart-drawer-content">
        <div class="cart-drawer-header">
          <h3>Sepetim</h3>
          <button class="cart-close" onclick="cart.closeCartDrawer()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="cart-drawer-body" id="cart-items">
          <!-- Cart items will be rendered here -->
        </div>
        <div class="cart-drawer-footer" id="cart-footer">
          <!-- Cart totals will be rendered here -->
        </div>
      </div>
    `;
    document.body.appendChild(drawer);
  }

  // Update cart UI
  updateCartUI() {
    const itemsContainer = document.getElementById('cart-items');
    const footerContainer = document.getElementById('cart-footer');
    const cartCountElements = document.querySelectorAll('.cart-count');
    
    const totals = this.getTotals();

    // Update cart count badges
    cartCountElements.forEach(el => {
      el.textContent = totals.itemCount;
      el.style.display = totals.itemCount > 0 ? 'flex' : 'none';
    });

    // Update sticky CTA price
    const stickyPrice = document.getElementById('sticky-cart-total');
    if (stickyPrice) {
      stickyPrice.textContent = `₺${totals.total.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }

    if (this.items.length === 0) {
      itemsContainer.innerHTML = `
        <div class="cart-empty">
          <i class="fas fa-shopping-cart"></i>
          <p>Sepetiniz boş</p>
          <button class="btn btn-primary" onclick="cart.closeCartDrawer(); scrollToPackages()">
            Alışverişe Başla
          </button>
        </div>
      `;
      footerContainer.innerHTML = '';
      return;
    }

    // Render cart items
    itemsContainer.innerHTML = this.items.map(item => `
      <div class="cart-item">
        <div class="cart-item-image">
          <img src="product-1.png" alt="${item.name}">
        </div>
        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <div class="cart-item-price">
            <span class="price">₺${item.price.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            ${item.savings > 0 ? `<span class="original-price">₺${item.originalPrice.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>` : ''}
          </div>
          <div class="cart-item-quantity">
            <button onclick="cart.updateQuantity('${item.id}', ${item.quantity - 1})" class="qty-btn">-</button>
            <span>${item.quantity}</span>
            <button onclick="cart.updateQuantity('${item.id}', ${item.quantity + 1})" class="qty-btn">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="cart.removeItem('${item.id}')">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `).join('');

    // Render cart footer
    footerContainer.innerHTML = `
      <div class="cart-totals">
        <div class="cart-total-row">
          <span>Ara Toplam</span>
          <span>₺${totals.subtotal.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
        </div>
        ${totals.totalSavings > 0 ? `
        <div class="cart-total-row savings">
          <span>Tasarruf</span>
          <span>-₺${totals.totalSavings.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
        </div>
        ` : ''}
        <div class="cart-total-row">
          <span>Kargo</span>
          <span>${totals.shipping === 0 ? 'Ücretsiz' : '₺' + totals.shipping.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
        </div>
        <div class="cart-total-row total">
          <span>Toplam</span>
          <span>₺${totals.total.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
        </div>
      </div>
      <a href="checkout.html" class="btn btn-primary btn-large btn-full" onclick="cart.closeCartDrawer()">
        Ödemeye Geç <i class="fas fa-arrow-right"></i>
      </a>
      <button class="btn btn-secondary btn-full" onclick="cart.closeCartDrawer(); scrollToPackages()">
        Alışverişe Devam Et
      </button>
    `;
  }

  // Open cart drawer
  openCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    if (drawer) {
      drawer.classList.add('open');
      // Checkout sayfasında body scroll kilitleme
      if (!window.location.pathname.includes('checkout')) {
        document.body.style.overflow = 'hidden';
      }
    }
  }

  // Close cart drawer
  closeCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    if (drawer) {
      drawer.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  // Show toast notification
  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 100);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Get cart data for checkout
  getCheckoutData() {
    return {
      items: this.items,
      totals: this.getTotals()
    };
  }
}

// Initialize cart
const cart = new Cart();

// Helper function to scroll to packages
function scrollToPackages() {
  const packagesSection = document.getElementById('paketler');
  if (packagesSection) {
    const headerHeight = document.getElementById('header')?.offsetHeight || 0;
    const targetPosition = packagesSection.offsetTop - headerHeight - 20;
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }
}

// Helper function to add to cart from package cards
function addPackageToCart(packageType) {
  cart.addItem(packageType, 1);
}

// Export for use in other modules
window.cart = cart;
window.addPackageToCart = addPackageToCart;
window.scrollToPackages = scrollToPackages;
