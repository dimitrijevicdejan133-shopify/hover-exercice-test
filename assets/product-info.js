if (!customElements.get('product-info')) {
  customElements.define('product-info', class ProductInfo extends HTMLElement {
      constructor() {
        super();
      this.initGallery();
      this.initMobileSwiper();
      this.initSubscriptionOptions();
      this.formatPrices();
      this.initDeliveryDate();
    }

    formatPrices() {
      // Format main product price (with decimals)
      const mainPrice = this.querySelector('[data-product-price]');
      if (mainPrice) {
        mainPrice.textContent = this.moveCurrencyToEnd(mainPrice.textContent, true);
      }

      // Format compare price (with decimals)
      const comparePrice = this.querySelector('.price-compare');
      if (comparePrice) {
        comparePrice.textContent = this.moveCurrencyToEnd(comparePrice.textContent, true);
      }

      // Format button price (without decimals)
      const buttonPrice = this.querySelector('[data-cart-price]');
      if (buttonPrice) {
        buttonPrice.textContent = this.moveCurrencyToEnd(buttonPrice.textContent, false);
        // Also update the data-base-price attribute for consistency
        const basePrice = buttonPrice.getAttribute('data-base-price');
        if (basePrice) {
          buttonPrice.setAttribute('data-base-price', this.moveCurrencyToEnd(basePrice, false));
        }
      }

      // Watch for dynamic price updates
      this.setupPriceObserver();
    }

    setupPriceObserver() {
      // Observe price elements for changes
      const priceElements = [
        this.querySelector('[data-product-price]'),
        this.querySelector('.price-compare'),
        this.querySelector('[data-cart-price]')
      ].filter(Boolean);

      priceElements.forEach(element => {
        // Store the last formatted value to prevent infinite loops
        let lastValue = element.textContent;
        
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList' || mutation.type === 'characterData') {
              // Reformat when content changes
              const target = mutation.target;
              let elementToUpdate = null;
              let keepDecimals = true;
              
              if (target.classList && target.classList.contains('btn-price')) {
                elementToUpdate = target;
                keepDecimals = false;
              } else if (target.classList && target.classList.contains('price-compare')) {
                elementToUpdate = target;
                keepDecimals = true;
              } else if (target.hasAttribute && target.hasAttribute('data-product-price')) {
                elementToUpdate = target;
                keepDecimals = true;
              } else if (target.parentElement) {
                const parent = target.parentElement;
                if (parent.hasAttribute && parent.hasAttribute('data-product-price')) {
                  elementToUpdate = parent;
                  keepDecimals = true;
                } else if (parent.classList && parent.classList.contains('price-compare')) {
                  elementToUpdate = parent;
                  keepDecimals = true;
                } else if (parent.classList && parent.classList.contains('btn-price')) {
                  elementToUpdate = parent;
                  keepDecimals = false;
                }
              }
              
              if (elementToUpdate) {
                const currentValue = elementToUpdate.textContent;
                const formattedValue = this.moveCurrencyToEnd(currentValue, keepDecimals);
                
                // Only update if the value actually changed to prevent infinite loop
                if (currentValue !== formattedValue && formattedValue !== lastValue) {
                  lastValue = formattedValue;
                  elementToUpdate.textContent = formattedValue;
                }
              }
            }
          });
        });

        observer.observe(element, {
          childList: true,
          subtree: true,
          characterData: true
        });
      });
    }

    moveCurrencyToEnd(priceText, keepDecimals = true) {
      if (!priceText) return priceText;
      
      // Common currency symbols
      const currencySymbols = ['€', '$', '£', '¥', '₹', '₽', '₩', '₪', '₨', '₦', '₡', '₵', '₫', '₭', '₮', '₯', '₰', '₱', '₲', '₳', '₴', '₵', '₶', '₷', '₸', '₺', '₻', '₼', '₽', '₾', '₿'];
      
      // Remove any whitespace
      priceText = priceText.trim();
      
      // Find and extract currency symbol (could be at start or end)
      let currencySymbol = '';
      let numberPart = '';
      let alreadyAtEnd = false;
      
      // Check if currency symbol is at the start
      for (const symbol of currencySymbols) {
        if (priceText.startsWith(symbol)) {
          currencySymbol = symbol;
          numberPart = priceText.slice(symbol.length).trim();
          break;
        }
      }
      
      // If no symbol at start, check if it's at the end (already correct format)
      if (!currencySymbol) {
        for (const symbol of currencySymbols) {
          if (priceText.endsWith(symbol)) {
            currencySymbol = symbol;
            numberPart = priceText.slice(0, -symbol.length).trim();
            alreadyAtEnd = true;
            break;
          }
        }
      }
      
      // If still no currency symbol, try to find currency codes
      if (!currencySymbol) {
        const currencyMap = {
          'EUR': '€',
          'USD': '$',
          'GBP': '£',
          'JPY': '¥',
          'CNY': '¥'
        };
        
        // Try patterns like "EUR 35,00" or "35,00 EUR"
        for (const [code, symbol] of Object.entries(currencyMap)) {
          const regexBefore = new RegExp(`^${code}\\s+(.+)`, 'i');
          const regexAfter = new RegExp(`^(.+)\\s+${code}$`, 'i');
          
          if (regexBefore.test(priceText)) {
            currencySymbol = symbol;
            numberPart = priceText.replace(regexBefore, '$1').trim();
            break;
          } else if (regexAfter.test(priceText)) {
            currencySymbol = symbol;
            numberPart = priceText.replace(regexAfter, '$1').trim();
            break;
          }
        }
      }
      
      // If still no currency symbol found, try to extract from HTML entities or assume Euro
      if (!currencySymbol) {
        // Check for HTML entities like &euro; or &euro;
        if (priceText.includes('€') || priceText.includes('&euro;') || priceText.includes('&#8364;')) {
          currencySymbol = '€';
          numberPart = priceText.replace(/[€&euro;#8364;]/gi, '').trim();
        } else {
          // Default to Euro for European locales
          currencySymbol = '€';
          numberPart = priceText;
        }
      }
      
      // Clean up number part: remove extra spaces, keep formatting (comma or dot as decimal separator)
      numberPart = numberPart.replace(/\s+/g, '').replace(/,/g, ',');
      
      // If no decimals should be kept and we have decimals, remove them
      if (!keepDecimals && numberPart) {
        // Remove decimal part (e.g., "35,00" -> "35" or "35.00" -> "35")
        numberPart = numberPart.replace(/[,\.]\d+$/, '');
      }
      
      // Build the final formatted price
      const formattedPrice = numberPart ? `${numberPart}${currencySymbol}` : priceText;
      
      // If the price is already in the correct format, return original to prevent unnecessary updates
      if (alreadyAtEnd) {
        // Check if we need to modify decimals
        const hasDecimals = /[,\.]\d+$/.test(numberPart);
        if (keepDecimals || !hasDecimals) {
          return priceText; // Already correctly formatted
        }
      }
      
      // Return formatted price with currency at the end
      return formattedPrice;
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
      
      // For now, just keep the same price (subscription discounts can be handled separately)
      // Format the price correctly when updating
      priceElement.textContent = this.moveCurrencyToEnd(basePrice, false);
    }

    initDeliveryDate() {
      const availabilityBlock = this.querySelector('.product-availability[data-delivery-days]');
      if (!availabilityBlock) return;

      const deliveryDays = parseInt(availabilityBlock.getAttribute('data-delivery-days')) || 0;
      const deliveryDateElement = availabilityBlock.querySelector('.delivery-date');
      
      if (!deliveryDateElement || deliveryDays === 0) return;

      // Calculate delivery date
      const today = new Date();
      const deliveryDate = new Date(today);
      deliveryDate.setDate(today.getDate() + deliveryDays);

      // Format date in French: "25 mars"
      const formattedDate = this.formatDateFrench(deliveryDate);
      
      if (formattedDate) {
        deliveryDateElement.textContent = ' ' + formattedDate;
      }
    }

    formatDateFrench(date) {
      const frenchMonths = [
        'janvier',
        'février',
        'mars',
        'avril',
        'mai',
        'juin',
        'juillet',
        'août',
        'septembre',
        'octobre',
        'novembre',
        'décembre'
      ];

      const day = date.getDate();
      const month = frenchMonths[date.getMonth()];

      return `${day} ${month}`;
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
