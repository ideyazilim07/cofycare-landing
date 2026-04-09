/**
 * CofyCare Landing Page JavaScript
 * Premium Coffee Machine Cleaning Tablet
 */

document.addEventListener('DOMContentLoaded', function() {
    // ============================================
    // Mobile Menu Toggle
    // ============================================
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });
        
        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
    
    // ============================================
    // Header Scroll Effect
    // ============================================
    const header = document.getElementById('header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    }, { passive: true });
    
    // ============================================
    // Sticky Mobile CTA
    // ============================================
    const stickyCta = document.getElementById('stickyCta');
    const heroSection = document.getElementById('hero');
    const productSection = document.getElementById('urun-detayi');
    
    if (stickyCta && heroSection && productSection) {
        const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
        const productTop = productSection.offsetTop;
        
        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;
            
            // Show sticky CTA after hero and before product section
            if (currentScroll > heroBottom && currentScroll < productTop - window.innerHeight + 200) {
                stickyCta.classList.add('visible');
            } else {
                stickyCta.classList.remove('visible');
            }
        }, { passive: true });
    }
    
    // ============================================
    // FAQ Accordion
    // ============================================
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            // Close all other items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
            });
            
            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
    
    // ============================================
    // Quantity Selector
    // ============================================
    const qtyMinus = document.getElementById('qtyMinus');
    const qtyPlus = document.getElementById('qtyPlus');
    const qtyInput = document.getElementById('qtyInput');
    
    if (qtyMinus && qtyPlus && qtyInput) {
        qtyMinus.addEventListener('click', function() {
            let value = parseInt(qtyInput.value);
            if (value > 1) {
                qtyInput.value = value - 1;
            }
        });
        
        qtyPlus.addEventListener('click', function() {
            let value = parseInt(qtyInput.value);
            if (value < 10) {
                qtyInput.value = value + 1;
            }
        });
    }
    
    // ============================================
    // Add to Cart Button
    // ============================================
    const addToCartBtn = document.getElementById('addToCart');
    const toast = document.getElementById('toast');
    
    if (addToCartBtn && toast) {
        addToCartBtn.addEventListener('click', function() {
            // Show toast
            toast.classList.add('show');
            
            // Hide toast after 3 seconds
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        });
    }
    
    // ============================================
    // Smooth Scroll for Anchor Links
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ============================================
    // Scroll Reveal Animation
    // ============================================
    const revealElements = document.querySelectorAll(
        '.problem-card, .advantage-card, .testimonial-card, .trust-card, ' +
        '.benefit-item, .usage-step, .faq-item, .section-header'
    );
    
    // Add reveal class to elements
    revealElements.forEach(el => {
        el.classList.add('reveal');
    });
    
    // Intersection Observer for reveal animation
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(el => {
        revealObserver.observe(el);
    });
    
    // ============================================
    // Gallery Thumbnail Click
    // ============================================
    const thumbs = document.querySelectorAll('.thumb');
    
    thumbs.forEach(thumb => {
        thumb.addEventListener('click', function() {
            thumbs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // ============================================
    // Parallax Effect for Hero
    // ============================================
    const heroVisual = document.querySelector('.hero-visual');
    
    if (heroVisual && !window.matchMedia('(pointer: coarse)').matches) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * 0.3;
            
            if (rate < 200) {
                heroVisual.style.transform = `translateY(${rate}px)`;
            }
        }, { passive: true });
    }
    
    // ============================================
    // Counter Animation for Stats (if added later)
    // ============================================
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        
        function updateCounter() {
            start += increment;
            if (start < target) {
                element.textContent = Math.floor(start);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        }
        
        updateCounter();
    }
    
    // ============================================
    // Form Validation Helper (for future forms)
    // ============================================
    window.validateEmail = function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };
    
    window.validatePhone = function(phone) {
        const re = /^[0-9]{10,11}$/;
        return re.test(phone.replace(/\s/g, ''));
    };
    
    // ============================================
    // Lazy Loading Images (if real images added)
    // ============================================
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    // ============================================
    // Performance: Preload Critical Resources
    // ============================================
    function preloadResource(href, as, type) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        link.as = as;
        if (type) link.type = type;
        document.head.appendChild(link);
    }
    
    // Preload fonts
    preloadResource('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap', 'style');
    
    // ============================================
    // Analytics Helper (placeholder)
    // ============================================
    window.trackEvent = function(eventName, eventData) {
        // Placeholder for analytics tracking
        console.log('Event tracked:', eventName, eventData);
        
        // Example: Google Analytics 4
        // if (typeof gtag !== 'undefined') {
        //     gtag('event', eventName, eventData);
        // }
        
        // Example: Facebook Pixel
        // if (typeof fbq !== 'undefined') {
        //     fbq('track', eventName, eventData);
        // }
    };
    
    // Track CTA clicks
    document.querySelectorAll('.btn-primary, .btn-cta').forEach(btn => {
        btn.addEventListener('click', function() {
            const btnText = this.textContent.trim();
            window.trackEvent('cta_click', {
                button_text: btnText,
                page_location: window.location.href
            });
        });
    });
    
    // ============================================
    // Console Welcome Message
    // ============================================
    console.log('%c☕ CofyCare', 'font-size: 24px; font-weight: bold; color: #5D4037;');
    console.log('%cKahve Makinesi Temizleme Tableti', 'font-size: 14px; color: #4A4A4A;');
    console.log('%cTemiz makine, daha iyi kahve deneyimi.', 'font-size: 12px; color: #7A7A7A;');
});

// ============================================
// Utility Functions
// ============================================

/**
 * Debounce function for performance optimization
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function for scroll events
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Check if element is in viewport
 */
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// ============================================
// Export for module usage (if needed)
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        debounce,
        throttle,
        isInViewport
    };
}
