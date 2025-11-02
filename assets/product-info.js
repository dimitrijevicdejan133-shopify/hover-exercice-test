if (!customElements.get('product-info')) {
  customElements.define('product-info', class ProductInfo extends HTMLElement {
      constructor() {
        super();
      this.initGallery();
      this.initMobileSwiper();
      this.initSubscriptionOptions();
    }

    initGallery() {
      const thumbnails = this.querySelectorAll('.product-gallery__thumb');
      const mainItems = this.querySelectorAll('.product-gallery__item');

      thumbnails.forEach(thumb => {
        thumb.addEventListener('click', (e) => {
          e.preventDefault();
          const mediaId = thumb.getAttribute('data-media-id');
          
          thumbnails.forEach(t => t.classList.remove('active'));
          mainItems.forEach(item => item.classList.remove('active'));
          
          thumb.classList.add('active');
          const targetItem = this.querySelector(`.product-gallery__item[data-media-id="${mediaId}"]`);
          if (targetItem) {
            targetItem.classList.add('active');
          }
        });
      });

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

    initMobileSwiper() {
      const swiper = this.querySelector('.product-gallery__swiper');
      const scrollbarThumb = this.querySelector('.product-gallery__scrollbar-thumb');
      
      if (!swiper || !scrollbarThumb) return;

      const mediaCount = parseInt(swiper.getAttribute('data-media-count')) || 1;
      
      const thumbWidth = (100 / mediaCount);
      scrollbarThumb.style.width = `${thumbWidth}%`;

      const updateScrollbar = () => {
        const maxScroll = swiper.scrollWidth - swiper.clientWidth;
        if (maxScroll <= 0) return;
        
        const scrollPercentage = swiper.scrollLeft / maxScroll;
        const maxTranslate = 100 - thumbWidth;
        const translateX = scrollPercentage * maxTranslate;
        scrollbarThumb.style.transform = `translateX(${translateX}%)`;
      };

      swiper.addEventListener('scroll', updateScrollbar, { passive: true });

      let isDragging = false;
      let startX = 0;
      let startY = 0;
      let scrollLeft = 0;
      let hasMoved = false;

      const handleDragStart = (e) => {
        isDragging = true;
        hasMoved = false;
        swiper.classList.add('is-dragging');
        
        const touch = e.type.includes('mouse') ? e : e.touches[0];
        startX = touch.pageX;
        startY = touch.pageY;
        scrollLeft = swiper.scrollLeft;
      };

      const handleDragEnd = () => {
        if (isDragging) {
          isDragging = false;
          swiper.classList.remove('is-dragging');
        }
      };

      const handleDragMove = (e) => {
        if (!isDragging) return;
        
        const touch = e.type.includes('mouse') ? e : e.touches[0];
        const x = touch.pageX;
        const y = touch.pageY;
        
        const deltaX = Math.abs(x - startX);
        const deltaY = Math.abs(y - startY);
        
        if (!hasMoved && deltaY > deltaX) {
          isDragging = false;
          swiper.classList.remove('is-dragging');
          return;
        }
        
        if (deltaX > 3) {
          e.preventDefault();
          hasMoved = true;
        }
        
        const dragDistance = x - startX;
        swiper.scrollLeft = scrollLeft - dragDistance;
      };

      swiper.addEventListener('mousedown', handleDragStart);
      swiper.addEventListener('mousemove', handleDragMove);
      swiper.addEventListener('mouseup', handleDragEnd);
      swiper.addEventListener('mouseleave', handleDragEnd);

      swiper.addEventListener('touchstart', handleDragStart, { passive: true });
      swiper.addEventListener('touchmove', handleDragMove, { passive: false });
      swiper.addEventListener('touchend', handleDragEnd);
      swiper.addEventListener('touchcancel', handleDragEnd);

      swiper.addEventListener('click', (e) => {
        if (hasMoved) {
          e.preventDefault();
          e.stopPropagation();
        }
      }, true);

      updateScrollbar();
    }

    initSubscriptionOptions() {
      const subscriptionOptions = this.querySelectorAll('.subscription-option');
      const cartPriceElement = this.querySelector('.btn-price');
      
      subscriptionOptions.forEach(option => {
        option.addEventListener('click', () => {
          subscriptionOptions.forEach(opt => {
            opt.classList.remove('selected');
            opt.setAttribute('aria-checked', 'false');
          });
          
          option.classList.add('selected');
          option.setAttribute('aria-checked', 'true');
          
          const subscriptionType = option.getAttribute('data-subscription');
          
          this.updateCartPrice(subscriptionType, cartPriceElement);
          
          this.dispatchEvent(new CustomEvent('subscription-changed', {
            detail: { subscriptionType },
            bubbles: true
          }));

          if (window.innerWidth < 750) {
            const buyButton = document.querySelector('.btn-add-to-cart');
            if (buyButton) {
              setTimeout(() => {
                buyButton.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }, 100);
            }
          }
        });

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

      if (subscriptionOptions.length > 0) {
        subscriptionOptions[0].classList.add('selected');
        subscriptionOptions[0].setAttribute('aria-checked', 'true');
      }
    }

    updateCartPrice(subscriptionType, priceElement) {
      if (!priceElement) return;

      const basePrice = priceElement.getAttribute('data-base-price') || priceElement.textContent;
      
      if (subscriptionType === '2-month') {
        const discount = 0.10;
      }
            }
          });
        }

document.addEventListener('DOMContentLoaded', function() {
  const collapsibleTabs = document.querySelectorAll('.collapsible-tab details');
  
  collapsibleTabs.forEach(details => {
    const summary = details.querySelector('summary');
    
    summary.setAttribute('aria-expanded', details.hasAttribute('open'));
    
    summary.addEventListener('click', (e) => {
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
