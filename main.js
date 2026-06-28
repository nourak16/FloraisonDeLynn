import { initLoader } from './js/loader.js';
import { initNav } from './js/nav.js';
import { initHero } from './js/hero.js';
import { initCursor } from './js/cursor.js';
import { initProducts } from './js/products.js';
import { initBubbles } from './js/bubbles.js';

function runInit() {
  initLoader();
  initNav();
  initHero();
  initCursor();
  initProducts();
  initBubbles();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runInit);
} else {
  runInit();
}
