/**
 * CofyCare Campaign Countdown Timer
 * Creates urgency with real-time countdown
 */

class CampaignTimer {
  constructor() {
    this.endTime = this.getEndOfDay();
    this.init();
  }

  getEndOfDay() {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return end;
  }

  init() {
    this.renderTimer();
    this.startCountdown();
  }

  renderTimer() {
    const timerContainers = document.querySelectorAll('.countdown-timer');
    
    timerContainers.forEach(container => {
      container.innerHTML = `
        <div class="countdown-item">
          <span class="countdown-number" data-hours>00</span>
          <span class="countdown-label">Saat</span>
        </div>
        <div class="countdown-separator">:</div>
        <div class="countdown-item">
          <span class="countdown-number" data-minutes>00</span>
          <span class="countdown-label">Dakika</span>
        </div>
        <div class="countdown-separator">:</div>
        <div class="countdown-item">
          <span class="countdown-number" data-seconds>00</span>
          <span class="countdown-label">Saniye</span>
        </div>
      `;
    });
  }

  startCountdown() {
    this.updateDisplay();
    
    setInterval(() => {
      this.updateDisplay();
    }, 1000);
  }

  updateDisplay() {
    const now = new Date();
    const diff = this.endTime - now;

    if (diff <= 0) {
      // Reset for next day
      this.endTime = this.getEndOfDay();
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    // Update all timer instances
    document.querySelectorAll('[data-hours]').forEach(el => {
      el.textContent = hours.toString().padStart(2, '0');
    });
    
    document.querySelectorAll('[data-minutes]').forEach(el => {
      el.textContent = minutes.toString().padStart(2, '0');
    });
    
    document.querySelectorAll('[data-seconds]').forEach(el => {
      el.textContent = seconds.toString().padStart(2, '0');
    });
  }

  // Get formatted time remaining
  getTimeRemaining() {
    const now = new Date();
    const diff = this.endTime - now;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds };
  }
}

// Initialize countdown when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.campaignTimer = new CampaignTimer();
});

// Export
window.CampaignTimer = CampaignTimer;
