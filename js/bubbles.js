/**
 * Floraison de Lynn
 * Dynamic Floating Glassmorphic Bubbles & Butterflies Background Effect
 */

export function initBubbles() {
  const container = document.createElement('div');
  container.className = 'floating-bubbles-container';
  container.id = 'floatingBubblesContainer';
  container.setAttribute('aria-hidden', 'true');
  document.body.appendChild(container);

  // SVGs for the interior designs: (1) Bouquet of flowers, (2) Butterfly
  const bouquetSvg = `
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.8" class="bubble-inner-svg">
      <!-- Outer/back foliage -->
      <path d="M22 26 C16 18 20 12 32 16" stroke-dasharray="2 2" opacity="0.6" stroke-linecap="round" class="foliage-back-l"/>
      <path d="M42 26 C48 18 44 12 32 16" stroke-dasharray="2 2" opacity="0.6" stroke-linecap="round" class="foliage-back-r"/>
      
      <!-- Stems -->
      <path d="M32 28 L32 54" stroke-linecap="round" class="bouquet-stem"/>
      <path d="M24 32 C28 38 30 46 32 49" stroke-linecap="round" class="bouquet-stem"/>
      <path d="M40 32 C36 38 34 46 32 49" stroke-linecap="round" class="bouquet-stem"/>
      
      <!-- Foliage / Leaves -->
      <path d="M22 36 C14 36 18 44 32 44" fill="currentColor" fill-opacity="0.05" stroke-linecap="round" stroke-linejoin="round" class="bouquet-leaf leaf-l"/>
      <path d="M42 36 C50 36 46 44 32 44" fill="currentColor" fill-opacity="0.05" stroke-linecap="round" stroke-linejoin="round" class="bouquet-leaf leaf-r"/>
      
      <!-- Main Blossoms / Roses -->
      <!-- Center Main Rose -->
      <g transform="translate(32, 22)" class="rose-bloom bloom-center">
        <circle cx="0" cy="0" r="7" fill="currentColor" fill-opacity="0.1"/>
        <path d="M-5 -2 C-3 -6 3 -6 5 -2 C7 2 3 6 -5 -2" stroke-linecap="round"/>
        <path d="M-3 -4 C0 -1 2 -5 3 -2" stroke-linecap="round"/>
        <path d="M-1 0 C1 2 2 -2 0 -3" stroke-linecap="round"/>
      </g>
      
      <!-- Left Rose -->
      <g transform="translate(20, 27)" class="rose-bloom bloom-left">
        <circle cx="0" cy="0" r="5" fill="currentColor" fill-opacity="0.1"/>
        <path d="M-3 -1 C-2 -4 2 -4 3 -1 C5 2 2 4 -3 -1" stroke-linecap="round"/>
        <path d="M-1 -2 C0 0 1 -3 2 -1" stroke-linecap="round"/>
      </g>
      
      <!-- Right Rose -->
      <g transform="translate(44, 27)" class="rose-bloom bloom-right">
        <circle cx="0" cy="0" r="5" fill="currentColor" fill-opacity="0.1"/>
        <path d="M-3 -1 C-2 -4 2 -4 3 -1 C5 2 2 4 -3 -1" stroke-linecap="round"/>
        <path d="M-1 -2 C0 0 1 -3 2 -1" stroke-linecap="round"/>
      </g>
      
      <!-- Ribbon bow tied around the stems -->
      <g transform="translate(32, 42)" class="ribbon-bow">
        <path d="M-6 -2 C-12 -8 -8 -10 0 0 C8 -10 12 -8 6 -2" fill="currentColor" fill-opacity="0.15" stroke-linecap="round"/>
        <path d="M-1 -1 L-6 10" stroke-linecap="round"/>
        <path d="M1 -1 L6 10" stroke-linecap="round"/>
        <circle cx="0" cy="-1" r="2.5" fill="currentColor"/>
      </g>
    </svg>
  `;

  const butterflySvg = `
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.8" class="bubble-inner-svg">
      <!-- Upper Left Wing -->
      <path d="M32 30 C20 12 6 8 8 24 C10 36 24 38 32 42" class="butterfly-wing wing-ul" fill="currentColor" fill-opacity="0.08" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 20 C18 18 22 24 24 28" class="butterfly-wing wing-ul-accent" opacity="0.5" stroke-linecap="round"/>
      
      <!-- Upper Right Wing -->
      <path d="M32 30 C44 12 58 8 56 24 C54 36 40 38 32 42" class="butterfly-wing wing-ur" fill="currentColor" fill-opacity="0.08" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M50 20 C46 18 42 24 40 28" class="butterfly-wing wing-ur-accent" opacity="0.5" stroke-linecap="round"/>
      
      <!-- Lower Left Wing -->
      <path d="M32 42 C20 44 14 54 18 60 C22 64 28 52 32 46" class="butterfly-wing wing-ll" fill="currentColor" fill-opacity="0.08" stroke-linecap="round" stroke-linejoin="round"/>
      
      <!-- Lower Right Wing -->
      <path d="M32 42 C44 44 50 54 46 60 C42 64 36 52 32 46" class="butterfly-wing wing-lr" fill="currentColor" fill-opacity="0.08" stroke-linecap="round" stroke-linejoin="round"/>
      
      <!-- Antennae -->
      <path d="M32 20 C29 12 24 10 23 12" class="butterfly-body-part" stroke-linecap="round"/>
      <path d="M32 20 C35 12 40 10 41 12" class="butterfly-body-part" stroke-linecap="round"/>
      <circle cx="23" cy="12" r="1.5" class="butterfly-body-part" fill="currentColor"/>
      <circle cx="41" cy="12" r="1.5" class="butterfly-body-part" fill="currentColor"/>
      
      <!-- Butterfly Center Body -->
      <rect x="30.5" y="20" width="3" height="24" rx="1.5" class="butterfly-body-body" fill="currentColor"/>
    </svg>
  `;

  // Determine density based on screen sizing (optimization)
  const isMobile = window.innerWidth <= 768;
  const maxBubbles = isMobile ? 6 : 14; // Adaptive count
  const bubbles = [];

  // Bubble generator helper
  function createBubble(isInitial = false) {
    const bubbleEl = document.createElement('div');
    bubbleEl.className = 'floating-bubble';
    
    // Only use butterflies as requested by the user
    const type = 'butterfly';
    bubbleEl.classList.add(`type-${type}`);
    
    // Clean frame with only the butterfly or bouquet content
    bubbleEl.innerHTML = `
      <div class="bubble-content-wrap">
        ${type === 'bouquet' ? bouquetSvg : butterflySvg}
      </div>
    `;

    // Size variations (bouquets are larger and detailed, butterflies are smaller and delicate)
    let minSize, maxSize;
    if (type === 'butterfly') {
      minSize = isMobile ? 35 : 40;
      maxSize = isMobile ? 55 : 65;
    } else {
      minSize = isMobile ? 55 : 65;
      maxSize = isMobile ? 90 : 120;
    }
    const size = Math.floor(Math.random() * (maxSize - minSize)) + minSize;
    bubbleEl.style.width = `${size}px`;
    bubbleEl.style.height = `${size}px`;

    // Custom transparency/lighting (extremely delicate low opacity for soft aesthetic)
    const baseOpacity = Math.random() * 0.10 + 0.14; 
    bubbleEl.style.opacity = '0'; // Will fade in smoothly

    // Position variables
    const startX = Math.random() * 100; // Left offset %
    const startY = isInitial 
      ? Math.random() * 110 - 5  // Scatter across screen initially
      : 105;                     // Start below viewport normally

    bubbleEl.style.left = `${startX}%`;
    bubbleEl.style.top = `${startY}%`;

    container.appendChild(bubbleEl);

    // Physics parameters (Varying speeds and paths)
    const speed = Math.random() * 0.35 + 0.15; // Slow, immersive float speeds
    const swayAmplitude = Math.random() * 40 + 20; // Varied wavy path widths in px
    const swayFrequency = Math.random() * 0.0025 + 0.0008; // Diverse wave cycle speeds
    const driftX = (Math.random() * 0.08 - 0.04); // Gentle diagonal drift pathway (varying paths!)
    const rotationSpeed = (Math.random() * 0.25 - 0.125); // Rotating drift
    
    const bubbleObj = {
      element: bubbleEl,
      size,
      x: startX,
      y: startY,
      targetOpacity: baseOpacity,
      currentOpacity: 0,
      speed,
      swayAmplitude,
      swayFrequency,
      driftX,
      rotationSpeed,
      angle: Math.random() * 360,
      birthTime: Date.now() + Math.random() * 1000,
      swayOffset: Math.random() * 1000,
      fadingIn: true
    };

    bubbles.push(bubbleObj);
  }

  // Populate initial bubbles
  for (let i = 0; i < maxBubbles; i++) {
    createBubble(true);
  }

  // Animation cycle
  let lastTime = Date.now();
  let animationFrameId;

  function updateBubbles() {
    const now = Date.now();
    const dt = (now - lastTime) / 16; // Normalization factoring
    lastTime = now;

    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      
      // Vertical Ascent
      b.y -= b.speed * dt;
      
      // Horizontal Drift (diagonal path drift)
      b.x += b.driftX * dt;
      
      // Boundary check for X coordinate to wrap nicely
      if (b.x < -15) b.x = 115;
      if (b.x > 115) b.x = -15;

      // Horizontal wave movement (Sway Sinusoidal math)
      const relativeTime = now + b.swayOffset;
      const sway = Math.sin(relativeTime * b.swayFrequency) * b.swayAmplitude;
      
      // Dynamic gradual rotation
      b.angle += b.rotationSpeed * dt;

      // Smooth Fade-in at start & fade-out near top
      if (b.fadingIn) {
        b.currentOpacity += 0.01 * dt;
        if (b.currentOpacity >= b.targetOpacity) {
          b.currentOpacity = b.targetOpacity;
          b.fadingIn = false;
        }
      }

      // Check boundary coordinates to trigger seamless deletion/recycling
      // If the bubble drifts above the screen viewport
      const offsetHeightPercentage = ((b.size + 20) / window.innerHeight) * 100;
      const verticalExitPoint = -offsetHeightPercentage;

      // Start fading out when approaching top 15%
      if (b.y < 20 && !b.fadingIn) {
        const fadeRatio = Math.max(0, b.y - verticalExitPoint) / (20 - verticalExitPoint);
        b.element.style.opacity = b.targetOpacity * fadeRatio;
      } else {
        b.element.style.opacity = b.currentOpacity;
      }

      // Complete recycle when off-screen
      if (b.y < verticalExitPoint) {
        // Remove from DOM
        if (b.element.parentNode) {
          b.element.parentNode.removeChild(b.element);
        }
        // Remove from tracking array
        bubbles.splice(i, 1);
        // Spawn a fresh new one from below
        createBubble(false);
        continue;
      }

      // Apply coordinates through accelerated CSS 3D transforms
      b.element.style.transform = `translate3d(${sway}px, 0, 0) rotate(${b.angle}deg)`;
      b.element.style.left = `${b.x}%`;
      b.element.style.top = `${b.y}%`;
    }

    animationFrameId = requestAnimationFrame(updateBubbles);
  }

  // Bind first sequence
  updateBubbles();

  // Listen to window resizes to scale bubble densities dynamically
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const activeMobileState = window.innerWidth <= 768;
      const targetMax = activeMobileState ? 6 : 14;
      
      // Trim if over density
      while (bubbles.length > targetMax) {
        const popped = bubbles.pop();
        if (popped && popped.element.parentNode) {
          popped.element.parentNode.removeChild(popped.element);
        }
      }
      
      // Feed if sparse
      while (bubbles.length < targetMax) {
        createBubble(false);
      }
    }, 400);
  });
}
