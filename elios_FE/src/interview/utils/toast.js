class ToastManager {
  constructor() {
    this.container = null;
    this.toasts = [];
  }

  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  }

  show(message, type = 'info', duration = 3000) {
    this.init();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    // Create icon element safely
    const iconSpan = document.createElement('span');
    iconSpan.className = 'toast-icon material-icons';
    iconSpan.textContent = this.getIcon(type);

    // Create message element safely (prevents XSS)
    const msgSpan = document.createElement('span');
    msgSpan.className = 'toast-message';
    msgSpan.textContent = message;

    toast.appendChild(iconSpan);
    toast.appendChild(msgSpan);

    this.container.appendChild(toast);
    this.toasts.push(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('toast-show'), 10);

    // Auto-dismiss
    setTimeout(() => {
      this.dismiss(toast);
    }, duration);

    return toast;
  }

  getIcon(type) {
    const icons = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info',
    };
    return icons[type] || icons.info;
  }

  dismiss(toast) {
    toast.classList.remove('toast-show');
    toast.classList.add('toast-hide');

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      this.toasts = this.toasts.filter(t => t !== toast);
    }, 300);
  }

  error(message) {
    return this.show(message, 'error', 5000);
  }

  success(message) {
    return this.show(message, 'success', 3000);
  }

  warning(message) {
    return this.show(message, 'warning', 4000);
  }

  info(message) {
    return this.show(message, 'info', 3000);
  }
}

const toast = new ToastManager();
export default toast;
