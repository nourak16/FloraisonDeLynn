import { products } from './productData.js';

export function initLoader() {
  const loader = document.getElementById('loader') || document.getElementById('pageLoader');
  if (!loader) return;

  let isDismissed = false;

  const hideLoader = () => {
    if (isDismissed) return;
    isDismissed = true;
    
    loader.classList.add('is-hidden');
    setTimeout(() => {
      loader.style.display = 'none';
    }, 800);
  };

  // Gather high-priority assets to preload
  const assetsToPreload = [];

  // 1. Preload logo image
  let logoUrl = 'images/logo.webp';
  if (typeof window.getAbsoluteAssetUrl === 'function') {
    logoUrl = window.getAbsoluteAssetUrl(logoUrl);
  }
  assetsToPreload.push(`${logoUrl}?v=transparent_logo_v2`);

  // 2. Preload first 12 product images to cover everything above-the-fold and nearby
  products.slice(0, 12).forEach(p => {
    if (p.image) {
      let cardImgUrl = p.image;
      if (typeof window.getAbsoluteAssetUrl === 'function') {
        cardImgUrl = window.getAbsoluteAssetUrl(cardImgUrl);
      }
      assetsToPreload.push(`${cardImgUrl}?v=1.0.1`);
    }
  });

  let loadedCount = 0;
  const totalAssets = assetsToPreload.length;

  const onAssetLoaded = () => {
    loadedCount++;
    if (loadedCount >= totalAssets) {
      // Small graceful delay for premium smooth reveal
      setTimeout(hideLoader, 250);
    }
  };

  if (totalAssets === 0) {
    if (document.readyState === 'complete') {
      setTimeout(hideLoader, 200);
    } else {
      window.addEventListener('load', hideLoader);
    }
  } else {
    // Begin high-speed parallel prefetching
    assetsToPreload.forEach(url => {
      const img = new Image();
      img.onload = onAssetLoaded;
      img.onerror = onAssetLoaded; // Proceed seamlessly even if an asset fails to resolve
      img.src = url;
    });
  }

  // Backup fallback in case of ultra-slow network or failed requests to guarantee responsive access
  setTimeout(hideLoader, 3500);
}

