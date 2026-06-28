export function initLoader() {
  const loader = document.getElementById('loader') || document.getElementById('pageLoader');
  if (!loader) return;

  const hideLoader = () => {
    if (loader.classList.contains('is-hidden')) return;
    loader.classList.add('is-hidden');
    setTimeout(() => {
      loader.style.display = 'none';
    }, 800);
  };

  // Dismiss loader on window load, with an immediate fallback to guarantee responsive execution
  if (document.readyState === 'complete') {
    setTimeout(hideLoader, 200);
  } else {
    window.addEventListener('load', hideLoader);
  }

  // Backup fallback in case network elements or assets load sluggishly or fail
  setTimeout(hideLoader, 5000);
}
