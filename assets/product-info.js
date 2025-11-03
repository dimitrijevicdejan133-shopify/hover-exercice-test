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
      const mainPrice = this.querySelector('[data-product-price]');
      if (mainPrice) {
        mainPrice.textContent = this.moveCurrencyToEnd(mainPrice.textContent, true);
      }

      const comparePrice = this.querySelector('.price-compare');
      if (comparePrice) {
        comparePrice.textContent = this.moveCurrencyToEnd(comparePrice.textContent, true);
      }

      const buttonPrice = this.querySelector('[data-cart-price]');
      if (buttonPrice) {
        buttonPrice.textContent = this.moveCurrencyToEnd(buttonPrice.textContent, false);
        const basePrice = buttonPrice.getAttribute('data-base-price');
        if (basePrice) {
          buttonPrice.setAttribute('data-base-price', this.moveCurrencyToEnd(basePrice, false));
        }
      }

      this.setupPriceObserver();
    }

    setupPriceObserver() {
      const priceElements = [
        this.querySelector('[data-product-price]'),
        this.querySelector('.price-compare'),
        this.querySelector('[data-cart-price]')
      ].filter(Boolean);

      priceElements.forEach(element => {
        let lastValue = element.textContent;
        
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList' || mutation.type === 'characterData') {
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
      
      const currencySymbols = ['€', '$', '£', '¥'];
      
      priceText = priceText.trim();
      
      let currencySymbol = '';
      let numberPart = '';
      let alreadyAtEnd = false;
      
      for (const symbol of currencySymbols) {
        if (priceText.startsWith(symbol)) {
          currencySymbol = symbol;
          numberPart = priceText.slice(symbol.length).trim();
          break;
        }
      }
      
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
      
      if (!currencySymbol) {
        const currencyMap = {
          'EUR': '€',
          'USD': '$',
          'GBP': '£',
          'JPY': '¥',
        };
        
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
      
      if (!currencySymbol) {
        if (priceText.includes('€') || priceText.includes('&euro;') || priceText.includes('&#8364;')) {
          currencySymbol = '€';
          numberPart = priceText.replace(/[€&euro;#8364;]/gi, '').trim();
        } else {
          currencySymbol = '€';
          numberPart = priceText;
        }
      }
      
      numberPart = numberPart.replace(/\s+/g, '').replace(/,/g, ',');
      
      if (!keepDecimals && numberPart) {
        numberPart = numberPart.replace(/[,\.]\d+$/, '');
      }
      
      const formattedPrice = numberPart ? `${numberPart}${currencySymbol}` : priceText;
      
      if (alreadyAtEnd) {
        const hasDecimals = /[,\.]\d+$/.test(numberPart);
        if (keepDecimals || !hasDecimals) {
          return priceText;
        }
      }
      
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
      const scrollbarTrack = this.querySelector('.product-gallery__scrollbar-track');
      
      if (!swiper) return;

      const mediaCount = parseInt(swiper.getAttribute('data-media-count')) || 1;
      
      if (scrollbarThumb && scrollbarTrack && mediaCount > 1) {
        const calculateThumbWidth = () => {
          const visibleRatio = swiper.clientWidth / swiper.scrollWidth;
          const thumbWidthPercent = Math.max(visibleRatio * 100, 10);
          scrollbarThumb.style.width = `${thumbWidthPercent}%`;
          return thumbWidthPercent;
        };

        let isScrolling = false;
        let scrollTimeout;
        
        const updateScrollbar = () => {
          const maxScroll = swiper.scrollWidth - swiper.clientWidth;
          if (maxScroll <= 0) {
            scrollbarThumb.style.transform = 'translateX(0px)';
            return;
          }
          
          if (!isScrolling) {
            isScrolling = true;
            scrollbarThumb.style.transition = 'none';
          }
          
          const scrollPercentage = swiper.scrollLeft / maxScroll;
          
          const trackWidth = scrollbarTrack.clientWidth;
          const thumbWidth = scrollbarThumb.clientWidth;
          
          const maxThumbTravel = trackWidth - thumbWidth;
          
          const translateXpx = scrollPercentage * maxThumbTravel;
          
          scrollbarThumb.style.transform = `translateX(${translateXpx}px)`;
          
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            isScrolling = false;
            scrollbarThumb.style.transition = 'transform 0.05s ease-out';
          }, 100);
        };

        calculateThumbWidth();
        
        swiper.addEventListener('scroll', updateScrollbar, { passive: true });
        
        let resizeTimeout;
        window.addEventListener('resize', () => {
          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => {
            calculateThumbWidth();
            updateScrollbar();
          }, 150);
        });

        setTimeout(() => {
          calculateThumbWidth();
          updateScrollbar();
        }, 100);
        
        setTimeout(() => {
          calculateThumbWidth();
          updateScrollbar();
        }, 500);
      }

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
      swiper.addEventListener('touchend', handleDragEnd, { passive: true });
      swiper.addEventListener('touchcancel', handleDragEnd, { passive: true });

      swiper.addEventListener('click', (e) => {
        if (hasMoved) {
          e.preventDefault();
          e.stopPropagation();
        }
      }, true);
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
      
      priceElement.textContent = this.moveCurrencyToEnd(basePrice, false);
    }

    initDeliveryDate() {
      const availabilityBlock = this.querySelector('.product-availability[data-delivery-days]');
      if (!availabilityBlock) return;

      const deliveryDays = parseInt(availabilityBlock.getAttribute('data-delivery-days')) || 0;
      const deliveryDateElement = availabilityBlock.querySelector('.delivery-date');
      
      if (!deliveryDateElement || deliveryDays === 0) return;

      const today = new Date();
      const deliveryDate = new Date(today);
      deliveryDate.setDate(today.getDate() + deliveryDays);

      const formattedDate = this.formatDateFrench(deliveryDate);
      
      if (formattedDate) {
        deliveryDateElement.textContent = ' ' + formattedDate;
      }

      const availabilityMessage = availabilityBlock.querySelector('.availability-message');
      if (availabilityMessage) {
        const messageText = availabilityMessage.textContent;
        
        if (messageText.toLowerCase().includes('livré le')) {
          const eachElems = messageText.split(" ");
          const words = eachElems.filter(each => each !== "")
          const replaceWords = " " + words[words.length - 4] + " " + words[words.length - 3] + " " + words[words.length - 2] + " " + words[words.length - 1];
          const newHTML = words.slice(0, words.length - 4).join(" ") + '<span style="font-weight: bold;">' + replaceWords + '</span>';
          availabilityMessage.innerHTML = newHTML;
        }
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
