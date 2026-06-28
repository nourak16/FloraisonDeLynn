import { products, filters } from './productData.js';

// Access gsap and ScrollTrigger globally (loaded via CDN for full zero-dependency resilience)
const gsap = window.gsap || (typeof globalThis !== 'undefined' ? globalThis.gsap : null);
const ScrollTrigger = window.ScrollTrigger || (typeof globalThis !== 'undefined' ? globalThis.ScrollTrigger : null);

if (gsap && ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
}

export function initProducts() {
  // --- Cart State ---
  let cartItems = [];

  // --- UI Selectors ---
  const gridContainer = document.getElementById('productsGrid');
  const filtersContainer = document.getElementById('productsFilters');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartItemsContainer = document.getElementById('cartItemsContainer');
  const cartCountLabel = document.getElementById('cartCount');
  const cartToggle = document.getElementById('cartToggle');
  const cartClose = document.getElementById('cartClose');
  const cartOverlay = document.getElementById('cartOverlay');
  const notificationContainer = document.getElementById('notificationContainer');

  // Modal elements
  const modal = document.getElementById('productModal');
  const modalImage = document.getElementById('modalImage');
  const modalTitle = document.getElementById('modalTitle');
  const modalCategory = document.getElementById('modalCategory');
  const modalPrice = document.getElementById('modalPrice');
  const modalClose = document.getElementById('modalClose');
  const modalOverlay = document.getElementById('modalOverlay');

  // Delivery details modal elements
  const deliveryModal = document.getElementById('deliveryModal');
  const deliveryClose = document.getElementById('deliveryClose');
  const deliveryOverlay = document.getElementById('deliveryOverlay');
  const deliveryForm = document.getElementById('deliveryForm');
  const deliveryName = document.getElementById('deliveryName');
  const deliveryPhone = document.getElementById('deliveryPhone');
  const deliveryLocation = document.getElementById('deliveryLocation');
  const checkoutSubtotal = document.getElementById('checkoutSubtotal');
  const checkoutTotal = document.getElementById('checkoutTotal');

  // --- Gallery Zoom elements ---
  const galleryContainer = document.getElementById('galleryContainer');
  const galleryZoomWrapper = document.getElementById('galleryZoomWrapper');
  const btnZoomIn = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');
  const btnZoomReset = document.getElementById('btnZoomReset');
  const btnFullscreen = document.getElementById('btnFullscreen');
  const zoomLevelIndicator = document.getElementById('zoomLevelIndicator');
  const galleryTip = document.getElementById('galleryTip');

  // --- Lightbox elements ---
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxOverlay = document.getElementById('lightboxOverlay');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxZoomWrapper = document.getElementById('lightboxZoomWrapper');
  const lightboxZoomIn = document.getElementById('lightboxZoomIn');
  const lightboxZoomOut = document.getElementById('lightboxZoomOut');
  const lightboxReset = document.getElementById('lightboxReset');
  const lightboxZoomIndicator = document.getElementById('lightboxZoomIndicator');
  const lightboxTip = document.getElementById('lightboxTip');

  // --- Zoom / Pan states ---
  let galleryScale = 1;
  let galleryTx = 0;
  let galleryTy = 0;
  let isGalleryDragging = false;
  let galleryStartX = 0;
  let galleryStartY = 0;
  let currentProductGallery = [];
  let currentGalleryImageIndex = 0;

  let lightboxScale = 1;
  let lightboxTx = 0;
  let lightboxTy = 0;
  let isLightboxDragging = false;
  let lightboxStartX = 0;
  let lightboxStartY = 0;

  function init() {
    if (gridContainer) {
      renderFilters();
      renderProducts();
    }
    setupEventListeners();
  }

  function renderFilters() {
    if (!filtersContainer) return;
    const allBtn = `<button class="products__filter is-active" data-filter="all">All</button>`;
    const otherBtns = filters.map(f => `<button class="products__filter" data-filter="${f.toLowerCase()}">${f}</button>`).join('');
    filtersContainer.innerHTML = allBtn + otherBtns;

    document.querySelectorAll('.products__filter').forEach(btn => {
      btn.addEventListener('click', handleFilterClick);
    });
  }

  function renderProducts() {
    if (!gridContainer) return;

    gridContainer.innerHTML = products.map((p, i) => {
      // Generate available color dots or sizes for display on card
      let customOptionsHtml = '';
      if (p.sizes && p.sizes[0] && p.sizes[0].colors) {
        // Collect all unique colors across all configurations
        const allColors = [];
        const seenColors = new Set();
        p.sizes.forEach(sz => {
          if (sz.colors) {
            sz.colors.forEach(col => {
              if (!seenColors.has(col.name)) {
                seenColors.add(col.name);
                allColors.push(col);
              }
            });
          }
        });
        customOptionsHtml = allColors.slice(0, 5).map(col => {
          return `<span class="card-color-dot" style="background-color: ${col.hex}" title="${col.name}"></span>`;
        }).join('') + (allColors.length > 5 ? `<span style="font-size: 11px; margin-left: 4px; color: var(--color-text-muted);">+${allColors.length - 5}</span>` : '');
      } else if (p.isDarkRomance) {
        customOptionsHtml = `<span style="font-size: 11.5px; color: var(--color-primary); text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; display: inline-flex; align-items: center; gap: 4px;">Black/White Wings • Custom Flowers</span>`;
      } else if (p.colors && p.colors.length > 0) {
        customOptionsHtml = p.colors.map(col => {
          return `<span class="card-color-dot" style="background-color: ${col.hex}" title="${col.name}"></span>`;
        }).join('');
      } else if (p.sizes && p.sizes.length > 0) {
        const displaySizes = p.sizes.filter(s => s.name.toLowerCase() !== 'bag');
        customOptionsHtml = `<span style="font-size: 11.5px; color: var(--color-text-muted); text-transform: uppercase; font-weight: 500; letter-spacing: 0.5px;">Sizes: ${displaySizes.map(s => s.name).join(', ')}</span>`;
      } else if (p.hasColorNote) {
        customOptionsHtml = `<span style="font-size: 11.5px; color: var(--color-primary); text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; display: inline-flex; align-items: center; gap: 4px;">Real Flowers • Custom Color Note</span>`;
      }

      const isBestSeller = ["Lynnies Bouquet", "Crystal Bloom", "Bloomelle", "Golden Memories", "Butterfly Kiss"].includes(p.name);
      const isBestSellerBadge = isBestSeller ? `<span class="products__best-seller-badge">Best Seller</span>` : '';

      return `
        <div class="products__card" data-category="${p.category}" data-id="${i}" id="product-card-${i}">
          <div class="products__card-image-wrapper">
            ${isBestSellerBadge}
            <img src="${p.image}" alt="${p.name}" class="products__card-image" loading="lazy" decoding="async">
          </div>
          <div class="products__card-info">
            <span class="products__card-category">${p.category}</span>
            <h4 class="products__card-name">${p.name}</h4>
            <div class="products__card-actions">
              <button class="products__btn products__btn--primary details-btn" id="details-btn-card-${i}" data-id="${i}" style="width: 100%;">DETAILS</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    setupCardAnimations();
    setupCardListeners();
  }

  // --- Cart and Addition ---
  function addToCart(index, customConfig = null, customPrice = null) {
    const product = products[index];
    const itemPrice = customPrice || product.price;

    const existingItem = cartItems.find(item => {
      return item.id === index && 
             JSON.stringify(item.config || null) === JSON.stringify(customConfig || null) &&
             item.price === itemPrice;
    });

    if (existingItem) {
      existingItem.count++;
    } else {
      cartItems.push({ ...product, id: index, count: 1, config: customConfig, price: itemPrice });
    }

    updateCartUI();
  }

  function updateCartUI() {
    const totalCount = cartItems.reduce((acc, item) => acc + item.count, 0);
    const totalPrice = cartItems.reduce((acc, item) => {
      const priceVal = parseFloat(item.price.replace('$', ''));
      return acc + (priceVal * item.count);
    }, 0);

    if (cartCountLabel) cartCountLabel.textContent = totalCount;

    if (!cartItemsContainer) return;

    if (cartItems.length === 0) {
      cartItemsContainer.innerHTML = `<div class="cart-drawer__empty"><p>Your cart is empty.</p></div>`;
    } else {
      const itemsHtml = cartItems.map((item, listIndex) => {
        let configHtml = '';
        if (item.config) {
          if (item.config.wingsColor && item.config.flowerType) {
            configHtml = `<span>Wings: ${item.config.wingsColor} | Flowers: ${item.config.flowerType}<br>Note: ${item.config.flowerColorsNote}</span>`;
          } else if (item.config.flowerCount && item.config.color) {
            if (item.config.secondColor) {
              configHtml = `<span>Colors: ${item.config.color} & ${item.config.secondColor} | Flowers: ${item.config.flowerCount}</span>`;
            } else {
              configHtml = `<span>Color: ${item.config.color} | Flowers: ${item.config.flowerCount}</span>`;
            }
          } else if (item.config.colorNote) {
            configHtml = `<span>Colors note: ${item.config.colorNote} (Real Flower)</span>`;
          } else if (item.config.color && item.config.size) {
            configHtml = `<span>Color: ${item.config.color} | Size: ${item.config.size}</span>`;
          } else if (item.config.color) {
            configHtml = `<span>Color: ${item.config.color}</span>`;
          } else if (item.config.size) {
            configHtml = `<span>Size: ${item.config.size}</span>`;
          }
        }
        const configString = configHtml ? `
          <div class="cart-item__config" style="font-size: 11px; color: var(--color-text-muted); opacity: 0.85; margin: 2px 0; line-height: 1.3">
            ${configHtml}
          </div>
        ` : '';

        return `
          <div class="cart-item" id="cart-item-${listIndex}">
            <div class="cart-item__image">
              <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item__info">
              <div class="cart-item__header">
                <span class="cart-item__name">${item.name}</span>
                <button class="cart-item__remove rem-btn" id="cart-remove-btn-${listIndex}" data-list-index="${listIndex}">&times;</button>
              </div>
              ${configString}
              <div class="cart-item__price">${item.price}</div>
              <div class="cart-item__qty-control">
                <button class="cart-item__qty-btn dec-btn" data-list-index="${listIndex}">-</button>
                <span class="cart-item__qty-val">${item.count}</span>
                <button class="cart-item__qty-btn inc-btn" data-list-index="${listIndex}">+</button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      cartItemsContainer.innerHTML = `
        <div class="cart-drawer__items">${itemsHtml}</div>
        <div class="cart-drawer__footer">
          <div class="cart-drawer__total">
            <span>Subtotal:</span>
            <span>$${totalPrice.toFixed(2)}</span>
          </div>
          <button class="cart-drawer__checkout" id="cartDrawerCheckoutBtn">CHECKOUT</button>
        </div>
      `;

      // Assign click handlers
      cartItemsContainer.querySelectorAll('.rem-btn').forEach(btn => {
        btn.onclick = () => {
          const idx = parseInt(btn.getAttribute('data-list-index'));
          cartItems.splice(idx, 1);
          updateCartUI();
        };
      });

      cartItemsContainer.querySelectorAll('.inc-btn').forEach(btn => {
        btn.onclick = () => {
          const idx = parseInt(btn.getAttribute('data-list-index'));
          cartItems[idx].count++;
          updateCartUI();
        };
      });

      cartItemsContainer.querySelectorAll('.dec-btn').forEach(btn => {
        btn.onclick = () => {
          const idx = parseInt(btn.getAttribute('data-list-index'));
          cartItems[idx].count--;
          if (cartItems[idx].count <= 0) {
            cartItems.splice(idx, 1);
          }
          updateCartUI();
        };
      });

      const checkoutBtn = cartItemsContainer.querySelector('#cartDrawerCheckoutBtn');
      if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
      }
    }
  }

  // --- Modal Configurator Gallery Navigation ---
  function updateModalGalleryImage(step = 0) {
    if (!currentProductGallery || currentProductGallery.length === 0) return;
    
    currentGalleryImageIndex = (currentGalleryImageIndex + step + currentProductGallery.length) % currentProductGallery.length;
    const currentImgUrl = currentProductGallery[currentGalleryImageIndex];
    if (modalImage) {
      modalImage.src = currentImgUrl;
    }
    resetGalleryZoom();
    updateGalleryControls();
  }

  function updateGalleryControls() {
    if (!galleryContainer) return;
    let btnLeft = galleryContainer.querySelector('.gallery-nav-btn--left');
    let btnRight = galleryContainer.querySelector('.gallery-nav-btn--right');
    let dotsContainer = galleryContainer.querySelector('.gallery-dots-container');

    // Remove arrow buttons if they exist
    if (btnLeft) btnLeft.remove();
    if (btnRight) btnRight.remove();

    if (currentProductGallery.length <= 1) {
      if (dotsContainer) dotsContainer.remove();
      return;
    }

    if (!dotsContainer) {
      dotsContainer = document.createElement('div');
      dotsContainer.className = 'gallery-dots-container';
      dotsContainer.style.cssText = `
        position: absolute;
        bottom: 16px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 8px;
        z-index: 20;
        background: rgba(0, 0, 0, 0.35);
        padding: 6px 12px;
        border-radius: 100px;
        backdrop-filter: blur(4px);
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(255, 255, 255, 0.15);
      `;
      galleryContainer.appendChild(dotsContainer);
    }

    dotsContainer.innerHTML = '';
    currentProductGallery.forEach((_, idx) => {
      const dot = document.createElement('span');
      dot.className = `gallery-dot ${idx === currentGalleryImageIndex ? 'is-active' : ''}`;
      dot.style.cssText = `
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: ${idx === currentGalleryImageIndex ? '#ffffff' : 'rgba(255, 255, 255, 0.45)'};
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        transform: ${idx === currentGalleryImageIndex ? 'scale(1.2)' : 'scale(1)'};
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
      `;
      dot.onclick = (e) => {
        e.stopPropagation();
        currentGalleryImageIndex = idx;
        const currentImgUrl = currentProductGallery[currentGalleryImageIndex];
        if (modalImage) modalImage.src = currentImgUrl;
        resetGalleryZoom();
        updateGalleryControls();
      };
      dotsContainer.appendChild(dot);
    });
  }

  // --- Modal Configurator Opening ---
  function openModal(index) {
    const p = products[index];
    currentProductGallery = p.gallery || [p.image];
    currentGalleryImageIndex = 0;
    if (modalImage) modalImage.src = p.image;
    resetGalleryZoom();
    updateGalleryControls();
    if (modalTitle) modalTitle.textContent = p.name;
    if (modalCategory) modalCategory.textContent = p.category;
    if (modalPrice) modalPrice.textContent = p.price;

    const modalDesc = document.getElementById('modalDescription');
    if (modalDesc && p.description) modalDesc.textContent = p.description;

    const colorsField = document.getElementById('colorsConfigField');
    const secondColorsField = document.getElementById('secondColorsConfigField');
    const sizesField = document.getElementById('sizesConfigField');
    const flowerQtyField = document.getElementById('flowerQtyConfigField');
    const colorNoteField = document.getElementById('customNoteConfigField');
    const colorNoteInput = document.getElementById('modalCustomNote');
    const colorNoteLabel = document.getElementById('customNoteLabel');

    if (p.hasColorNote) {
      if (colorNoteField) {
        colorNoteField.style.display = 'block';
        if (colorNoteLabel) {
          colorNoteLabel.textContent = "Desired Colors Note";
        }
        if (colorNoteInput) {
          colorNoteInput.placeholder = "Write your desired flower colors here...";
          colorNoteInput.value = '';
        }
      }
    } else {
      if (colorNoteField) colorNoteField.style.display = 'none';
    }

    const colorsLabel = colorsField ? colorsField.querySelector('.config-label') : null;
    if (colorsLabel) {
      colorsLabel.textContent = p.isDarkRomance ? "Select Wings Color" : "Available colors";
    }

    const sizesLabel = sizesField ? sizesField.querySelector('.config-label') : null;
    if (sizesLabel) {
      if (p.name === "Bloom Box") {
        sizesLabel.textContent = "Glitter Option";
      } else if (p.name === "Dark Romance") {
        sizesLabel.textContent = "Flower Type";
      } else {
        sizesLabel.textContent = "Available sizes";
      }
    }

    function populateColors(colorsList) {
      const productColorsContainer = document.getElementById('modalProductColors');
      if (productColorsContainer && colorsList && colorsList.length > 0) {
        if (colorsField) colorsField.style.display = 'block';
        productColorsContainer.innerHTML = colorsList.map((col, idx) => {
          return `
            <label class="color-opt" title="${col.name}">
              <input type="radio" name="productColor" value="${col.name}" ${idx === 0 ? 'checked' : ''}>
              <span class="color-dot" style="background: ${col.hex};"></span>
            </label>
          `;
        }).join('');
        
        // Bind real-time change triggers for Product Colors
        document.querySelectorAll('input[name="productColor"]').forEach(radio => {
          radio.onchange = updateReviewSummary;
        });
      } else {
        if (colorsField) colorsField.style.display = 'none';
      }
    }

    function populateSecondColors(colorsList) {
      const productSecondColorsContainer = document.getElementById('modalSecondProductColors');
      if (productSecondColorsContainer && colorsList && colorsList.length > 0 && p.name === "Bloomelle") {
        if (secondColorsField) secondColorsField.style.display = 'block';
        productSecondColorsContainer.innerHTML = `
          <label class="color-opt" title="None">
            <input type="radio" name="secondProductColor" value="None" checked>
            <span class="color-dot" style="background: transparent; border: 1.5px dashed var(--color-primary); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; color: var(--color-primary); line-height: 1;">✕</span>
          </label>
        ` + colorsList.map((col, idx) => {
          return `
            <label class="color-opt" title="${col.name}">
              <input type="radio" name="secondProductColor" value="${col.name}">
              <span class="color-dot" style="background: ${col.hex};"></span>
            </label>
          `;
        }).join('');
        
        // Bind real-time change triggers for Second Product Colors
        document.querySelectorAll('input[name="secondProductColor"]').forEach(radio => {
          radio.onchange = updateReviewSummary;
        });
      } else {
        if (secondColorsField) secondColorsField.style.display = 'none';
      }
    }

     const nonBagSizes = p.sizes ? p.sizes.filter(sz => sz.name.toLowerCase() !== 'bag') : [];
    const hasBagOption = p.sizes ? p.sizes.some(sz => sz.name.toLowerCase() === 'bag') : false;

    // Handle Bag Packaging Option visibility and state
    const bagOptionField = document.getElementById('bagOptionConfigField');
    const bOptionCheckbox = document.getElementById('modalBagCheckbox');
    if (bagOptionField && bOptionCheckbox) {
      if (hasBagOption) {
        bagOptionField.style.display = 'block';
        bOptionCheckbox.checked = false; // Optional, default is unchecked
      } else {
        bagOptionField.style.display = 'none';
        bOptionCheckbox.checked = false;
      }
      bOptionCheckbox.onchange = updateReviewSummary;
    }

    if (nonBagSizes.length > 0) {
      if (sizesField) sizesField.style.display = 'block';
      // Populate dynamic sizes
      const productSizesContainer = document.getElementById('modalProductSizes');
      if (productSizesContainer) {
        productSizesContainer.innerHTML = nonBagSizes.map((sz, idx) => {
          return `
            <label class="size-opt" title="${sz.name}">
              <input type="radio" name="productSize" value="${sz.name}" ${idx === 0 ? 'checked' : ''}>
              <span class="size-pill">${sz.name}</span>
            </label>
          `;
        }).join('');
      }

      // If the default selected size has dedicated colors, populate them
      if (nonBagSizes[0] && nonBagSizes[0].colors) {
        populateColors(nonBagSizes[0].colors);
      } else if (p.colors && p.colors.length > 0) {
        populateColors(p.colors);
      } else {
        populateColors([]);
      }
    } else {
      if (sizesField) sizesField.style.display = 'none';
      if (p.colors && p.colors.length > 0) {
        populateColors(p.colors);
      } else {
        populateColors([]);
      }
    }

    if (p.name === "Bloomelle" && p.colors && p.colors.length > 0) {
      populateSecondColors(p.colors);
    } else {
      populateSecondColors([]);
    }

    if (p.isPerFlower) {
      if (flowerQtyField) flowerQtyField.style.display = 'block';
      const flowerQtyInput = document.getElementById('modalFlowerQty');
      if (flowerQtyInput) {
        flowerQtyInput.value = 1;
      }
      const flourTotalSpan = document.getElementById('flowerQtyTotal');
      if (flourTotalSpan) {
        flourTotalSpan.textContent = "Total: $1.50";
      }
    } else {
      if (flowerQtyField) flowerQtyField.style.display = 'none';
    }

    function updateReviewSummary() {
      const reviewBox = document.getElementById('configReviewBox');
      if (!reviewBox) return;

      if (p.isPerFlower) {
        const activeProdColorInput = document.querySelector('input[name="productColor"]:checked');
        const productColor = activeProdColorInput ? activeProdColorInput.value : (p.colors && p.colors[0] ? p.colors[0].name : 'Default');
        
        const activeSecondColorInput = document.querySelector('input[name="secondProductColor"]:checked');
        const secondColor = activeSecondColorInput ? activeSecondColorInput.value : 'None';

        const flowerQtyInput = document.getElementById('modalFlowerQty');
        const qty = flowerQtyInput ? parseInt(flowerQtyInput.value) || 1 : 1;
        
        const colorText = (secondColor && secondColor !== 'None' && secondColor !== productColor) 
          ? `${productColor} & ${secondColor}` 
          : productColor;

        reviewBox.innerHTML = `<strong>Selected:</strong> ${qty} x ${colorText} Rose${qty > 1 ? 's' : ''}`;
      } else if (p.isDarkRomance) {
        const activeProdColorInput = document.querySelector('input[name="productColor"]:checked');
        const productColor = activeProdColorInput ? activeProdColorInput.value : 'Default Wings';
        
        const activeProdSizeInput = document.querySelector('input[name="productSize"]:checked');
        const productSize = activeProdSizeInput ? activeProdSizeInput.value : (nonBagSizes.length > 0 ? nonBagSizes[0].name : 'Default');
        
        reviewBox.innerHTML = `<strong>Selected:</strong> ${productSize} / ${productColor}`;
      } else if (p.hasColorNote) {
        const noteVal = colorNoteInput ? colorNoteInput.value.trim() : '';
        const displayNote = noteVal ? `"${noteVal}"` : '(Please enter color options below)';
        reviewBox.innerHTML = `<strong>Selected:</strong> Real Flower Arrangement | <strong>Desired Colors:</strong> ${displayNote}`;
      } else if (p.sizes && p.sizes.length > 0) {
        // Hybrid handling for sizes + colors
        const activeProdColorInput = document.querySelector('input[name="productColor"]:checked');
        const productColor = activeProdColorInput ? activeProdColorInput.value : 'Default';
        
        const activeProdSizeInput = document.querySelector('input[name="productSize"]:checked');
        const productSize = activeProdSizeInput ? activeProdSizeInput.value : (nonBagSizes.length > 0 ? nonBagSizes[0].name : 'Default');
        
        if (nonBagSizes[0] && nonBagSizes[0].colors) {
          reviewBox.innerHTML = `<strong>Selected:</strong> ${productSize} / Color ${productColor}`;
        } else if (p.colors && p.colors.length > 0) {
          reviewBox.innerHTML = `<strong>Selected:</strong> Size ${productSize} / Color ${productColor}`;
        } else {
          reviewBox.innerHTML = `<strong>Selected:</strong> Size ${productSize}`;
        }
      } else if (p.colors && p.colors.length > 0) {
        const activeProdColorInput = document.querySelector('input[name="productColor"]:checked');
        const productColor = activeProdColorInput ? activeProdColorInput.value : (p.colors && p.colors[0] ? p.colors[0].name : 'Default');
        reviewBox.innerHTML = `<strong>Selected Color:</strong> ${productColor}`;
      } else {
        reviewBox.innerHTML = `<strong>Standard Edition</strong>`;
      }

      // Add Bag option if checked
      if (bOptionCheckbox && bOptionCheckbox.checked && hasBagOption) {
        reviewBox.innerHTML += ` | <strong>Packaging Bag:</strong> Included`;
      }

      // Dynamic WhatsApp inquiry link update based on real-time configuration details
      const whatsappBtn = document.getElementById('modalWhatsappBtn');
      if (whatsappBtn) {
        let selectedSummary = reviewBox.textContent.replace(/\s+/g, ' ').replace('Selected Color:', 'Color:').replace('Selected:', '').trim();
        const absoluteImageUrl = `${window.location.origin}/${p.image}`;
        const textMessage = `Hello FLORAISON DE LYNN! I would like to inquire about "${p.name}" (${p.category}) from your website.\n\nProduct Image:\n${absoluteImageUrl}\n\nChosen Details:\n• ${selectedSummary}\n\nCould you please provide more info? Thank you!`;
        const whatsappNumber = '96181769307';
        whatsappBtn.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(textMessage)}`;
      }
    }

    // Bind real-time change triggers for Product Sizes
    document.querySelectorAll('input[name="productSize"]').forEach(radio => {
      radio.onchange = () => {
        const selectedSizeName = radio.value;
        const matchingSizeObj = p.sizes ? p.sizes.find(sz => sz.name === selectedSizeName) : null;
        if (matchingSizeObj && matchingSizeObj.colors) {
          populateColors(matchingSizeObj.colors);
        }
        updateReviewSummary();
      };
    });

    // Bind real-time change triggers for Flower Quantity input
    const flowerQtyInput = document.getElementById('modalFlowerQty');
    if (flowerQtyInput) {
      flowerQtyInput.oninput = updateReviewSummary;
      flowerQtyInput.onchange = updateReviewSummary;
    }

    if (colorNoteInput) {
      colorNoteInput.oninput = updateReviewSummary;
    }

    updateReviewSummary();
  
    if (modal) {
      modal.classList.add('active');
    }
    document.body.style.overflow = 'hidden';
  
    const modalShopBtn = document.getElementById('modalShopBtn');
    if (modalShopBtn) {
      modalShopBtn.onclick = () => {
        closeModal();
      };
    }
  }

  // ==================== IMAGE PREVIEWER ZOOM & PAN CONTROLS ====================
  function applyGalleryTransform(isInteractiveZoom = false) {
    if (galleryZoomWrapper) {
      if (isInteractiveZoom) {
        galleryZoomWrapper.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      } else {
        galleryZoomWrapper.style.transition = 'none';
      }
      galleryZoomWrapper.style.transform = `translate(${galleryTx}px, ${galleryTy}px) scale(${galleryScale})`;
    }
    if (zoomLevelIndicator) {
      zoomLevelIndicator.textContent = `${Math.round(galleryScale * 100)}%`;
    }
    if (galleryTip) {
      if (galleryScale > 1) {
        galleryTip.style.opacity = '1';
        galleryTip.style.visibility = 'visible';
      } else {
        galleryTip.style.opacity = '0';
        galleryTip.style.visibility = 'hidden';
      }
    }
    if (galleryContainer) {
      galleryContainer.style.cursor = galleryScale > 1 ? 'grab' : 'grab';
    }
  }

  function resetGalleryZoom() {
    galleryScale = 1;
    galleryTx = 0;
    galleryTy = 0;
    applyGalleryTransform(true);
  }

  function handleGalleryZoomIn() {
    galleryScale = Math.min(4, galleryScale + 0.4);
    applyGalleryTransform(true);
  }

  function handleGalleryZoomOut() {
    galleryScale = Math.max(1, galleryScale - 0.4);
    if (galleryScale === 1) {
      galleryTx = 0;
      galleryTy = 0;
    }
    applyGalleryTransform(true);
  }

  function initGalleryDrag() {
    if (!galleryContainer) return;

    let lastTap = 0;
    
    // Swipe/Scroll state variables
    let swipeStartX = 0;
    let swipeStartY = 0;
    let lastClientX = 0;
    let isSwipeActive = false;

    // Track click start positions to differentiate clicks from drags/scrolls
    let clickStartX = 0;
    let clickStartY = 0;

    const startDrag = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      clickStartX = clientX;
      clickStartY = clientY;

      if (e.touches) {
        const now = Date.now();
        const timesince = now - lastTap;
        lastTap = now;
        if (timesince < 300 && timesince > 0) {
          // Double Tap on Mobile
          e.preventDefault();
          if (galleryScale > 1) {
            resetGalleryZoom();
          } else {
            galleryScale = 2.0;
            applyGalleryTransform(true);
          }
          return;
        }
      }

      if (galleryScale <= 1) {
        if (currentProductGallery && currentProductGallery.length > 1) {
          swipeStartX = clientX;
          swipeStartY = clientY;
          lastClientX = clientX;
          isSwipeActive = true;
        }
        return;
      }
      
      isGalleryDragging = true;
      if (galleryContainer) galleryContainer.style.cursor = 'grabbing';
      
      galleryStartX = clientX - galleryTx;
      galleryStartY = clientY - galleryTy;
    };

    const doDrag = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      if (galleryScale <= 1) {
        if (isSwipeActive) {
          lastClientX = clientX;
          const diffX = clientX - swipeStartX;
          if (galleryZoomWrapper) {
            galleryZoomWrapper.style.transition = 'none';
            galleryZoomWrapper.style.transform = `translate3d(${diffX * 0.4}px, 0, 0) scale(1)`;
          }
        }
        return;
      }

      if (!isGalleryDragging) return;
      
      let rawTx = clientX - galleryStartX;
      let rawTy = clientY - galleryStartY;

      const box = galleryContainer.getBoundingClientRect();
      const maxTx = box.width * (galleryScale - 1) / 2;
      const maxTy = box.height * (galleryScale - 1) / 2;
      
      galleryTx = Math.max(-maxTx, Math.min(maxTx, rawTx));
      galleryTy = Math.max(-maxTy, Math.min(maxTy, rawTy));

      applyGalleryTransform(false);
    };

    const stopDrag = () => {
      if (galleryScale <= 1) {
        if (isSwipeActive) {
          isSwipeActive = false;
          const diffX = lastClientX - swipeStartX;
          const threshold = 50; // pixels to trigger swipe
          
          if (galleryZoomWrapper) {
            galleryZoomWrapper.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
            galleryZoomWrapper.style.transform = `translate3d(0, 0, 0) scale(1)`;
          }

          if (Math.abs(diffX) > threshold) {
            if (diffX > 0) {
              // Swipe Right -> View previous image
              updateModalGalleryImage(-1);
            } else {
              // Swipe Left -> View next image
              updateModalGalleryImage(1);
            }
          }
        }
        return;
      }

      isGalleryDragging = false;
      if (galleryContainer) {
        galleryContainer.style.cursor = galleryScale > 1 ? 'grab' : 'grab';
      }
    };

    galleryContainer.addEventListener('mousedown', startDrag);
    galleryContainer.addEventListener('mousemove', doDrag);
    window.addEventListener('mouseup', stopDrag);

    galleryContainer.addEventListener('touchstart', startDrag, { passive: false });
    galleryContainer.addEventListener('touchmove', doDrag, { passive: true });
    galleryContainer.addEventListener('touchend', stopDrag);

    // Support opening the fullscreen high-res lightbox preview on simple click/tap
    galleryContainer.addEventListener('click', (e) => {
      // If clicked on dot or navigation controls, do not open lightbox
      if (e.target.closest('.gallery-dots-container') || e.target.closest('.gallery-dot')) {
        return;
      }

      const clientX = e.clientX;
      const clientY = e.clientY;
      const dist = Math.hypot(clientX - clickStartX, clientY - clickStartY);

      // If the movement was negligible, it was a simple click/tap (not a drag or swipe)
      if (dist < 8) {
        openLightbox();
      }
    });

    galleryContainer.addEventListener('dblclick', () => {
      if (galleryScale > 1) {
        resetGalleryZoom();
      } else {
        galleryScale = 2.0;
        applyGalleryTransform(true);
      }
    });
  }

  // --- Lightbox Functional Suite ---
  function applyLightboxTransform(isInteractiveZoom = false) {
    if (lightboxZoomWrapper) {
      if (isInteractiveZoom) {
        lightboxZoomWrapper.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      } else {
        lightboxZoomWrapper.style.transition = 'none';
      }
      lightboxZoomWrapper.style.transform = `translate(${lightboxTx}px, ${lightboxTy}px) scale(${lightboxScale})`;
    }
    if (lightboxZoomIndicator) {
      lightboxZoomIndicator.textContent = `${Math.round(lightboxScale * 100)}%`;
    }
    if (lightboxTip) {
      if (lightboxScale > 1) {
        lightboxTip.style.opacity = '1';
        lightboxTip.style.visibility = 'visible';
      } else {
        lightboxTip.style.opacity = '0.6';
        lightboxTip.style.visibility = 'visible';
      }
    }
    if (lightboxContent) {
      lightboxContent.style.cursor = lightboxScale > 1 ? 'grab' : 'crosshair';
    }
  }

  function resetLightboxZoom() {
    lightboxScale = 1;
    lightboxTx = 0;
    lightboxTy = 0;
    applyLightboxTransform(true);
  }

  function handleLightboxZoomIn() {
    lightboxScale = Math.min(5, lightboxScale + 0.5);
    applyLightboxTransform(true);
  }

  function handleLightboxZoomOut() {
    lightboxScale = Math.max(1, lightboxScale - 0.5);
    if (lightboxScale === 1) {
      lightboxTx = 0;
      lightboxTy = 0;
    }
    applyLightboxTransform(true);
  }

  function openLightbox() {
    if (lightboxModal && lightboxImage && modalImage) {
      lightboxImage.src = modalImage.src;
      lightboxModal.style.opacity = '1';
      lightboxModal.style.visibility = 'visible';
      resetLightboxZoom();
      document.body.style.overflow = 'hidden';
    }
  }

  function closeLightbox() {
    if (lightboxModal) {
      lightboxModal.style.opacity = '0';
      lightboxModal.style.visibility = 'hidden';
      if (!modal || !modal.classList.contains('active')) {
        document.body.style.overflow = '';
      }
    }
  }

  function initLightboxDrag() {
    if (!lightboxContent) return;

    let lastTap = 0;

    const startDrag = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      if (e.touches) {
        const now = Date.now();
        const timesince = now - lastTap;
        lastTap = now;
        if (timesince < 300 && timesince > 0) {
          // Double Tap inside Lightbox
          e.preventDefault();
          if (lightboxScale > 1) {
            resetLightboxZoom();
          } else {
            lightboxScale = 2.5;
            applyLightboxTransform(true);
          }
          return;
        }
      }

      if (lightboxScale <= 1) return;
      isLightboxDragging = true;
      if (lightboxContent) lightboxContent.style.cursor = 'grabbing';
      
      lightboxStartX = clientX - lightboxTx;
      lightboxStartY = clientY - lightboxTy;
    };

    const doDrag = (e) => {
      if (!isLightboxDragging) return;
      
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      
      let rawTx = clientX - lightboxStartX;
      let rawTy = clientY - lightboxStartY;

      const box = lightboxContent.getBoundingClientRect();
      const maxTx = box.width * (lightboxScale - 1) / 2;
      const maxTy = box.height * (lightboxScale - 1) / 2;
      
      lightboxTx = Math.max(-maxTx, Math.min(maxTx, rawTx));
      lightboxTy = Math.max(-maxTy, Math.min(maxTy, rawTy));

      applyLightboxTransform(false);
    };

    const stopDrag = () => {
      isLightboxDragging = false;
      if (lightboxContent) {
        lightboxContent.style.cursor = lightboxScale > 1 ? 'grab' : 'crosshair';
      }
    };

    lightboxContent.addEventListener('mousedown', startDrag);
    lightboxContent.addEventListener('mousemove', doDrag);
    window.addEventListener('mouseup', stopDrag);

    lightboxContent.addEventListener('touchstart', startDrag, { passive: false });
    lightboxContent.addEventListener('touchmove', doDrag, { passive: true });
    lightboxContent.addEventListener('touchend', stopDrag);

    lightboxContent.addEventListener('dblclick', () => {
      if (lightboxScale > 1) {
        resetLightboxZoom();
      } else {
        lightboxScale = 2.5;
        applyLightboxTransform(true);
      }
    });
  }

  function closeModal() {
    if (modal) modal.classList.remove('active');
    if (!cartDrawer || !cartDrawer.classList.contains('active')) {
      document.body.style.overflow = '';
    }
    const modalContainer = document.querySelector('#productModal .product-modal__container');
    if (modalContainer) {
      setTimeout(() => {
        modalContainer.style.transform = '';
        modalContainer.style.transition = '';
      }, 500);
    }
  }

  function initModalSwipeClose() {
    const modalContainer = document.querySelector('#productModal .product-modal__container');
    if (!modalContainer) return;

    let startY = 0;
    let currentY = 0;
    let isSwiping = false;
    let isAtTop = false;

    modalContainer.addEventListener('touchstart', (e) => {
      if (window.innerWidth > 768) return;
      startY = e.touches[0].clientY;
      isAtTop = modalContainer.scrollTop <= 0;
      isSwiping = false;
    }, { passive: true });

    modalContainer.addEventListener('touchmove', (e) => {
      if (window.innerWidth > 768) return;

      currentY = e.touches[0].clientY;
      const diffY = currentY - startY;

      if (isAtTop && diffY > 0) {
        if (!isSwiping && diffY > 8) {
          isSwiping = true;
        }

        if (isSwiping) {
          if (e.cancelable) e.preventDefault();
          modalContainer.style.transition = 'none';
          modalContainer.style.transform = `translateY(${diffY}px)`;
        }
      }
    }, { passive: false });

    modalContainer.addEventListener('touchend', (e) => {
      if (window.innerWidth > 768) return;

      if (isSwiping) {
        isSwiping = false;
        const diffY = currentY - startY;
        const threshold = 120; // swipe over 120px to dismiss

        if (diffY > threshold) {
          // Slide all the way out of screen smoothly
          modalContainer.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
          modalContainer.style.transform = 'translateY(100vh)';
          
          setTimeout(() => {
            closeModal();
            modalContainer.style.transform = '';
            modalContainer.style.transition = '';
          }, 400);
        } else {
          // Snap back up smoothly
          modalContainer.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
          modalContainer.style.transform = 'translateY(0)';
          setTimeout(() => {
            modalContainer.style.transition = '';
          }, 400);
        }
      }
    });
  }

  function openCart() {
    if (cartDrawer) {
      cartDrawer.classList.add('active');
    }
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    if (cartDrawer) {
      cartDrawer.classList.remove('active');
    }
    document.body.style.overflow = '';
  }

  function handleCheckout() {
    if (cartItems.length === 0) {
      showNotification('Your cart is empty!');
      return;
    }

    const subtotal = cartItems.reduce((acc, item) => {
      const priceVal = parseFloat(item.price.replace('$', ''));
      return acc + (priceVal * item.count);
    }, 0);

    openDeliveryModal(subtotal);
  }

  function openDeliveryModal(subtotal) {
    closeCart();
    if (deliveryModal) {
      deliveryModal.classList.add('active');
    }
    if (checkoutSubtotal) {
      checkoutSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    }
    if (checkoutTotal) {
      checkoutTotal.textContent = `$${(subtotal + 4.00).toFixed(2)}`;
    }
    document.body.style.overflow = 'hidden';
  }

  function closeDeliveryModal() {
    if (deliveryModal) {
      deliveryModal.classList.remove('active');
    }
    if (!cartDrawer || !cartDrawer.classList.contains('active')) {
      document.body.style.overflow = '';
    }
  }

  function handleDeliverySubmit(e) {
    e.preventDefault();

    const name = deliveryName ? deliveryName.value.trim() : '';
    const phone = deliveryPhone ? deliveryPhone.value.trim() : '';
    const location = deliveryLocation ? deliveryLocation.value.trim() : '';

    const paymentMethodEl = document.querySelector('input[name="paymentMethod"]:checked');
    const paymentMethod = paymentMethodEl ? paymentMethodEl.value : 'Cash on Delivery';

    if (!name || !phone || !location) {
      alert("Please fill in all details.");
      return;
    }

    const whatsappNumber = '+96181769307';
    let message = '*New Order from FLORAISON DE LYNN*\n\n';
    message += 'I would like to order the following bespoke creations:\n\n';

    cartItems.forEach(item => {
      message += `• *${item.name}* (x${item.count}) - ${item.price}\n`;
      if (item.config) {
        if (item.config.wingsColor && item.config.flowerType) {
          message += `  - Wings Color: ${item.config.wingsColor}\n`;
          message += `  - Flower Type: ${item.config.flowerType}\n`;
          message += `  - Desired Flower Colors: ${item.config.flowerColorsNote}\n`;
        } else if (item.config.color && item.config.flowerCount) {
          if (item.config.secondColor) {
            message += `  - Colors: ${item.config.color} & ${item.config.secondColor} (${item.config.flowerCount} Flowers)\n`;
          } else {
            message += `  - Color: ${item.config.color} (${item.config.flowerCount} Flowers)\n`;
          }
        } else if (item.config.colorNote) {
          message += `  - Desired Colors (Real Flowers Note): ${item.config.colorNote}\n`;
        } else {
          if (item.config.color) {
            message += `  - Color: ${item.config.color}\n`;
          }
          if (item.config.size) {
            message += `  - Size: ${item.config.size}\n`;
          }
        }
      }
    });

    const subtotal = cartItems.reduce((acc, item) => {
      const priceVal = parseFloat(item.price.replace('$', ''));
      return acc + (priceVal * item.count);
    }, 0);

    const deliveryFee = 4.00;
    const finalTotal = subtotal + deliveryFee;

    message += `\n*Delivery Details:*\n`;
    message += `_Name:_ ${name}\n`;
    message += `_Phone:_ ${phone}\n`;
    message += `_Location:_ ${location} (Lebanon)\n`;
    message += `_Payment Method:_ ${paymentMethod}\n\n`;

    message += `Subtotal: $${subtotal.toFixed(2)}\n`;
    message += `Delivery Fee: $${deliveryFee.toFixed(2)}\n`;
    message += `Total Amount: $${finalTotal.toFixed(2)}\n\n`;
    message += 'Thank you!';

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');

    // Reset checkout forms & clear cart elegantly
    cartItems = [];
    updateCartUI();
    if (deliveryForm) deliveryForm.reset();
    closeDeliveryModal();
  }

  function showNotification(message) {
    if (!notificationContainer) return;
    const toast = document.createElement('div');
    toast.className = 'notification';
    toast.innerHTML = `<div class="notification-icon">✓</div><div class="notification-message">${message}</div>`;
    notificationContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  }

  // --- Filter Logic ---
  function applyFiltering(shouldAnimate = true) {
    const activeBtn = document.querySelector('.products__filter.is-active');
    const filter = activeBtn ? activeBtn.dataset.filter.toLowerCase() : 'all';

    const searchInput = document.getElementById('headerSearchInput');
    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();

    document.querySelectorAll('.products__card').forEach(card => {
      const category = card.dataset.category.toLowerCase();
      const idVal = card.dataset.id;
      const product = products[idVal];
      
      const nameMatch = product ? product.name.toLowerCase().includes(query) : false;
      const categoryTextMatch = product ? product.category.toLowerCase().includes(query) : false;
      const descriptionMatch = (product && product.description) ? product.description.toLowerCase().includes(query) : false;
      
      const textMatches = !query || nameMatch || categoryTextMatch || descriptionMatch;
      const categoryMatches = (filter === 'all' || category === filter);

      if (categoryMatches && textMatches) {
        if (card.style.display !== 'flex') {
          card.style.display = 'flex';
          if (shouldAnimate && gsap) {
            gsap.fromTo(card, { opacity: 0, scale: 0.93 }, { opacity: 1, scale: 1, duration: 0.35 });
          } else {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }
        }
      } else {
        card.style.display = 'none';
      }
    });

    if (typeof ScrollTrigger !== 'undefined' && ScrollTrigger.refresh) {
      ScrollTrigger.refresh();
    }
  }

  function handleFilterClick(e) {
    document.querySelectorAll('.products__filter').forEach(b => b.classList.remove('is-active'));
    e.currentTarget.classList.add('is-active');
    applyFiltering(true);

    const productsSection = document.querySelector('.products-section');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // --- Card Interactive Mechanics ---
  function setupCardListeners() {
    document.querySelectorAll('.products__card').forEach((card, i) => {
      const shopBtn = card.querySelector('.shop-btn');
      const detailsBtn = card.querySelector('.details-btn');

      if (shopBtn) {
        shopBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const p = products[i];
          if (p.isPerFlower || p.hasColorNote || p.isDarkRomance || (p.colors && p.colors.length > 0 && p.sizes && p.sizes.length > 0)) {
            openModal(i);
          } else if (p.colors && p.colors.length > 0) {
            const defaultColor = p.colors[0].name;
            const defaultConfig = {
              color: defaultColor
            };
            addToCart(i, defaultConfig);
          } else if (p.sizes && p.sizes.length > 0) {
            const defaultSize = p.sizes[0].name;
            const defaultPrice = p.sizes[0].price;
            const defaultConfig = {
              size: defaultSize
            };
            addToCart(i, defaultConfig, defaultPrice);
          } else {
            addToCart(i);
          }
        });
      }

      if (detailsBtn) {
        detailsBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openModal(i);
        });
      }

      card.addEventListener('click', () => openModal(i));
    });
  }

  function setupCardAnimations() {
    const cards = document.querySelectorAll('.products__card');

    if (ScrollTrigger && gsap) {
      ScrollTrigger.batch(cards, {
        start: 'top 95%',
        onEnter: batch => gsap.fromTo(batch, 
          { opacity: 0, y: 35 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.75, 
            stagger: 0.08, 
            ease: 'power3.out',
            overwrite: true
          }
        ),
        once: true
      });
    } else {
      cards.forEach(card => {
        card.style.opacity = '1';
        card.style.transform = 'none';
      });
    }

    cards.forEach(card => {
      const image = card.querySelector('.products__card-image');

      if (window.innerWidth > 768) {
        let rect = null;

        card.addEventListener('mouseenter', () => {
          rect = card.getBoundingClientRect();
        });

        window.addEventListener('resize', () => {
          if (rect) rect = card.getBoundingClientRect();
        }, { passive: true });

        card.addEventListener('mousemove', (e) => {
          if (!rect) {
            rect = card.getBoundingClientRect();
          }
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          card.style.setProperty('--glow-x', `${x}px`);
          card.style.setProperty('--glow-y', `${y}px`);

          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          const rotateX = (y - centerY) / 38;
          const rotateY = (centerX - x) / 38;

          if (gsap) {
            gsap.to(card, { rotateX, rotateY, duration: 0.8, ease: 'power3.out' });
            if (image) gsap.to(image, { scale: 1.05, duration: 0.8, ease: 'power2.out' });
          }
        }, { passive: true });

        card.addEventListener('mouseleave', () => {
          rect = null;
          if (gsap) {
            gsap.to(card, { rotateX: 0, rotateY: 0, duration: 1.1, ease: 'elastic.out(1, 0.65)' });
            if (image) gsap.to(image, { scale: 1, duration: 1.1, ease: 'power2.inOut' });
          }
        });
      }
    });
  }

  function setupEventListeners() {
    if (cartToggle) cartToggle.addEventListener('click', openCart);
    if (cartClose) cartClose.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

    // Delivery details listeners
    if (deliveryClose) deliveryClose.addEventListener('click', closeDeliveryModal);
    if (deliveryOverlay) deliveryOverlay.addEventListener('click', closeDeliveryModal);
    if (deliveryForm) deliveryForm.addEventListener('submit', handleDeliverySubmit);

    // Gallery Zoom listeners
    if (btnZoomIn) btnZoomIn.addEventListener('click', handleGalleryZoomIn);
    if (btnZoomOut) btnZoomOut.addEventListener('click', handleGalleryZoomOut);
    if (btnZoomReset) btnZoomReset.addEventListener('click', resetGalleryZoom);
    if (btnFullscreen) btnFullscreen.addEventListener('click', openLightbox);
    initGalleryDrag();

    // Lightbox Zoom listeners
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxOverlay) lightboxOverlay.addEventListener('click', closeLightbox);
    if (lightboxZoomIn) lightboxZoomIn.addEventListener('click', handleLightboxZoomIn);
    if (lightboxZoomOut) lightboxZoomOut.addEventListener('click', handleLightboxZoomOut);
    if (lightboxReset) lightboxReset.addEventListener('click', resetLightboxZoom);
    initLightboxDrag();
    initModalSwipeClose();

    // Reveal system for the products section & footer
    const productsSection = document.querySelector('.products-section');
    const footerElement = document.querySelector('.footer');
    let hasAutoRevealed = false;

    function revealProductsSection(andScroll = true) {
      if (!productsSection) return;
      const isFirstReveal = !productsSection.classList.contains('is-revealed');

      if (isFirstReveal) {
        productsSection.classList.add('is-revealed');
        if (footerElement) {
          footerElement.classList.add('is-revealed');
        }
        
        // Refresh ScrollTrigger so that any lazy animations know correct heights
        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 500);
      }
      
      if (andScroll) {
        if (isFirstReveal) {
          // Because productsSection transitions from max-height: 0 to content height,
          // the scrollable document size expands dynamically. We repeatedly adjust the scroll
          // position over the course of the first 600ms of the transition to ensure a continuous,
          // uninterrupted smooth scroll directly to the top edge of the expanded section.
          let count = 0;
          const intervalId = setInterval(() => {
            productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            count++;
            if (count >= 6) {
              clearInterval(intervalId);
            }
          }, 100);
        } else {
          productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }

    // Bind event for the Hero "Explore Collection" button
    const heroExploreBtn = document.getElementById('heroExploreBtn');
    if (heroExploreBtn) {
      heroExploreBtn.addEventListener('click', () => {
        revealProductsSection(true);
      });
    }

    // Bind event for all href="#collection" anchors
    document.querySelectorAll('a[href="#collection"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        revealProductsSection(true);
      });
    });

    // Footer filter link redirection matching Option 1
    document.querySelectorAll('.footer-filter-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const filterVal = e.currentTarget.dataset.filter;
        const filterBtn = document.querySelector(`.products__filter[data-filter="${filterVal}"]`);
        if (filterBtn) {
          filterBtn.click();
        }
        revealProductsSection(true);
      });
    });

    // Premium Header Search Listeners
    const searchInput = document.getElementById('headerSearchInput');
    const searchClear = document.getElementById('headerSearchClear');
    const searchToggle = document.getElementById('headerSearchToggle');
    const searchWrapper = document.getElementById('headerSearchWrapper');
    const searchBackdrop = document.getElementById('searchBackdrop');

    function openMobileSearch() {
      if (searchWrapper && !searchWrapper.classList.contains('expanded')) {
        searchWrapper.classList.add('expanded');
        if (searchBackdrop) {
          searchBackdrop.classList.add('active');
        }
        setTimeout(() => {
          if (searchInput) searchInput.focus();
        }, 120);
      }
    }

    function closeMobileSearch() {
      if (searchWrapper && searchWrapper.classList.contains('expanded')) {
        searchWrapper.classList.remove('expanded');
        if (searchBackdrop) {
          searchBackdrop.classList.remove('active');
        }
      }
    }

    let searchDebounceTimeout;
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        if (searchClear) {
          if (window.innerWidth <= 600) {
            searchClear.style.display = 'flex';
          } else {
            searchClear.style.display = searchInput.value ? 'flex' : 'none';
          }
        }

        // Auto-reveal the products section silently when user starts typing!
        if (searchInput.value.trim().length > 0) {
          revealProductsSection(false);
        }

        // Debounce target filtering by 180ms to avoid DOM repaint lag
        clearTimeout(searchDebounceTimeout);
        searchDebounceTimeout = setTimeout(() => {
          applyFiltering(true);
        }, 180);
      });

      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          revealProductsSection(true);
          searchInput.blur();
          closeMobileSearch();
        }
      });
    }

    if (searchClear) {
      searchClear.addEventListener('click', (e) => {
        e.stopPropagation();
        if (searchInput.value === '') {
          closeMobileSearch();
        } else {
          searchInput.value = '';
          if (window.innerWidth > 600) {
            searchClear.style.display = 'none';
          }
          applyFiltering(true);
          searchInput.focus();
        }
      });
    }

    if (searchToggle) {
      searchToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        openMobileSearch();
      });
    }

    if (searchBackdrop) {
      searchBackdrop.addEventListener('click', () => {
        closeMobileSearch();
      });
    }

    // Close expanded mobile search on clicking outside of the search wrapper
    document.addEventListener('click', (e) => {
      if (searchWrapper && searchWrapper.classList.contains('expanded') && !searchWrapper.contains(e.target)) {
        closeMobileSearch();
      }
    });

    updateCartUI();
  }

  init();
}
