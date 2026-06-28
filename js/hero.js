export function initHero() {
  const logoImg = document.getElementById('heroBrandLogo');
  const bgBlurImg = document.getElementById('heroBgBlur');
  const fallback = document.getElementById('heroBrandLogoFallback');

  if (logoImg && fallback) {
    const path = window.location.pathname;
    const lastSlash = path.lastIndexOf('/');
    const baseDir = lastSlash !== -1 ? path.substring(0, lastSlash + 1) : '/';

    // Elegant system to automatically detect and render their logo image whichever extension they upload
    const formats = [
      baseDir + 'images/logo.webp?v=transparent_logo_v2',
      './images/logo.webp?v=transparent_logo_v2',
      baseDir + 'images/logo.png?v=transparent_logo_v2',
      './images/logo.png?v=transparent_logo_v2',
      baseDir + 'logo.webp',
      baseDir + 'logo.png',
      baseDir + 'logo.jpg',
      baseDir + 'logo.jpeg',
      baseDir + 'logo.svg',
      baseDir + 'logo.gif',
      './images/logo.jpg',
      './images/logo.png',
      './images/logo.gif'
    ];
    let formatIndex = 0;

    const handleLoadSuccess = () => {
      const srcLower = (logoImg.src || '').toLowerCase();
      const isOriginalNativelyTransparent = srcLower.includes('logo.webp') || srcLower.includes('.webp') || srcLower.includes('.png') || srcLower.includes('.svg');

      if (!isOriginalNativelyTransparent) {
        // Apply clean real-time transparent background processing only for formats that don't support native alpha transparency
        try {
          makeLogoTransparent(logoImg);
        } catch (err) {
          console.warn("Could not process logo transparency:", err);
        }
      }

      logoImg.style.display = 'block';
      if (bgBlurImg) {
        if (!isOriginalNativelyTransparent) {
          try {
            makeLogoTransparent(bgBlurImg);
          } catch (err) {
            console.warn("Could not process bg blur transparency:", err);
          }
        }
        bgBlurImg.style.display = 'block';
      }
      fallback.style.display = 'none';
    };

    const tryNextLogo = () => {
      if (formatIndex < formats.length) {
        const nextSrc = formats[formatIndex];
        formatIndex++;

        // Append cache buster to force a fresh image request and guarantee load/error event dispatch
        const cb = `cb=${Date.now()}`;
        const separator = nextSrc.includes('?') ? '&' : '?';
        const finalSrc = nextSrc + separator + cb;

        logoImg.src = finalSrc;
        if (bgBlurImg) {
          bgBlurImg.src = finalSrc;
        }
      } else {
        // If no custom logo has been uploaded to the workspace yet, show the high-contrast golden butterfly fallback
        logoImg.style.display = 'none';
        if (bgBlurImg) {
          bgBlurImg.style.display = 'none';
        }
        fallback.style.display = 'flex';
      }
    };

    logoImg.addEventListener('error', tryNextLogo);
    logoImg.addEventListener('load', handleLoadSuccess);

    // If the image tag already succeeded in loading before this script ran, run the success handler immediately
    if (logoImg.complete && logoImg.naturalWidth > 0) {
      handleLoadSuccess();
    } else {
      tryNextLogo();
    }
  }
}

/**
 * Client-side ultra-fast chroma-keying background remover.
 * Automatically samples corner pixels of the image to dynamically detect background color,
 * then maps it to transparent with alpha blending to avoid jagged edges.
 */
function makeLogoTransparent(imgElement) {
  if (!imgElement || imgElement.src.startsWith('data:')) return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  canvas.width = imgElement.naturalWidth || imgElement.width;
  canvas.height = imgElement.naturalHeight || imgElement.height;
  
  if (canvas.width === 0 || canvas.height === 0) return;

  ctx.drawImage(imgElement, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  // Sample 5 edge pixels to detect exact background tone
  const samples = [
    { x: 5, y: 5 },
    { x: canvas.width - 5, y: 5 },
    { x: 5, y: canvas.height - 5 },
    { x: canvas.width - 5, y: canvas.height - 5 },
    { x: Math.floor(canvas.width / 2), y: 5 }
  ];

  let sumR = 0, sumG = 0, sumB = 0, validSamples = 0;
  for (const s of samples) {
    if (s.x >= 0 && s.x < canvas.width && s.y >= 0 && s.y < canvas.height) {
      const idx = (s.x + s.y * canvas.width) * 4;
      sumR += data[idx];
      sumG += data[idx + 1];
      sumB += data[idx + 2];
      validSamples++;
    }
  }

  const bgR = validSamples > 0 ? sumR / validSamples : 246;
  const bgG = validSamples > 0 ? sumG / validSamples : 237;
  const bgB = validSamples > 0 ? sumB / validSamples : 230;

  // Custom key settings: sensitivity threshold and smooth antialiasing window
  const threshold = 40;
  const blendWindow = 12;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const dist = Math.sqrt(
      Math.pow(r - bgR, 2) +
      Math.pow(g - bgG, 2) +
      Math.pow(b - bgB, 2)
    );

    if (dist < threshold) {
      data[i + 3] = 0; // Translucent fully
    } else if (dist < threshold + blendWindow) {
      const factor = (dist - threshold) / blendWindow;
      data[i + 3] = Math.round(data[i + 3] * factor);
    }
  }

  ctx.putImageData(imgData, 0, 0);
  imgElement.src = canvas.toDataURL('image/png');
}
