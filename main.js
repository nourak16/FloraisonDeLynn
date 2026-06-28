import './css/style.css';
import { initLoader } from './js/loader.js';
import { initNav } from './js/nav.js';
import { initHero } from './js/hero.js';
import { initCursor } from './js/cursor.js';
import { initProducts } from './js/products.js';
import { initBubbles } from './js/bubbles.js';

document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initNav();
  initHero();
  initCursor();
  initProducts();
  initBubbles();
});
