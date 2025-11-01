if (!customElements.get('product-info')) {
  customElements.define('product-info', class ProductInfo extends HTMLElement {
      constructor() {
        super();
      this.initGallery();
      this.initSubscriptionOptions();
    }

    initGallery() {
      const thumbnails = this.querySelectorAll('.product-gallery__thumb');
      const mainItems = this.querySelectorAll('.product-gallery__item');

      thumbnails.forEach(thumb => {
        thumb.addEventListener('click', (e) => {
          e.preventDefault();
          const mediaId = thumb.getAttribute('data-media-id');
          
          // Remove active class from all thumbnails and main items
          thumbnails.forEach(t => t.classList.remove('active'));
          mainItems.forEach(item => item.classList.remove('active'));
          
          // Add active class to clicked thumbnail and corresponding main item
          thumb.classList.add('active');
          const targetItem = this.querySelector(`.product-gallery__item[data-media-id="${mediaId}"]`);
          if (targetItem) {
            targetItem.classList.add('active');
          }
        });
      });

      // Keyboard navigation for gallery
      thumbnails.forEach((thumb, index) => {
        thumb.setAttribute('tabindex', '0');
        thumb.setAttribute('role', 'button');
        thumb.setAttribute('aria-label', `View image ${index + 1}`);
        thumb.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            thumb.click();
          }
          if (e.key === 'ArrowRight' && index < thumbnails.length - 1) {
            thumbnails[index + 1].focus();
          }
          if (e.key === 'ArrowLeft' && index > 0) {
            thumbnails[index - 1].focus();
          }
        });
      });
    }

    initSubscriptionOptions() {
      const subscriptionOptions = this.querySelectorAll('.subscription-option');
      const cartPriceElement = this.querySelector('.btn-price');
      
      subscriptionOptions.forEach(option => {
        option.addEventListener('click', () => {
          // Remove selected class and aria-checked from all options
          subscriptionOptions.forEach(opt => {
            opt.classList.remove('selected');
            opt.setAttribute('aria-checked', 'false');
          });
          
          // Add selected class to clicked option
          option.classList.add('selected');
          option.setAttribute('aria-checked', 'true');
          
          // Get subscription data
          const subscriptionType = option.getAttribute('data-subscription');
          
          // Update cart price if needed
          this.updateCartPrice(subscriptionType, cartPriceElement);
          
          // Trigger custom event for subscription change
          this.dispatchEvent(new CustomEvent('subscription-changed', {
            detail: { subscriptionType },
            bubbles: true
          }));

          // Smooth scroll on mobile
          if (window.innerWidth < 750) {
            const buyButton = document.querySelector('.btn-add-to-cart');
            if (buyButton) {
              setTimeout(() => {
                buyButton.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }, 100);
            }
          }
        });

        // Keyboard support
        option.setAttribute('tabindex', '0');
        option.setAttribute('role', 'radio');
        option.setAttribute('aria-checked', 'false');
        option.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            option.click();
          }
        });
      });

      // Set first option as default selected
      if (subscriptionOptions.length > 0) {
        subscriptionOptions[0].classList.add('selected');
        subscriptionOptions[0].setAttribute('aria-checked', 'true');
      }
    }

    updateCartPrice(subscriptionType, priceElement) {
      if (!priceElement) return;

      // This is a placeholder for dynamic price updates
      // You would integrate with your subscription app here
      const basePrice = priceElement.getAttribute('data-base-price') || priceElement.textContent;
      
      // Example logic - adjust based on your needs
      if (subscriptionType === '2-month') {
        // Apply discount for 2-month subscription
        const discount = 0.10; // 10% discount
        // Update price display logic here
      }
            }
          });
        }

// Collapsible Tab Animation Enhancement
document.addEventListener('DOMContentLoaded', function() {
  const collapsibleTabs = document.querySelectorAll('.collapsible-tab details');
  
  collapsibleTabs.forEach(details => {
    const summary = details.querySelector('summary');
    
    // Add ARIA attributes
    summary.setAttribute('aria-expanded', details.hasAttribute('open'));
    
    // Smooth animation
    summary.addEventListener('click', (e) => {
      // Update ARIA
      const isOpen = !details.hasAttribute('open');
      summary.setAttribute('aria-expanded', isOpen);
      
      if (!details.hasAttribute('data-animating')) {
        details.setAttribute('data-animating', '');
        setTimeout(() => {
          details.removeAttribute('data-animating');
        }, 300);
      }
    });
  });
});
