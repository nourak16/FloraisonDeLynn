export function initNav() {
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const hambergerLines = mobileToggle ? mobileToggle.querySelectorAll('span') : [];

  // Parse URL search parameter ?mobile=1
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('mobile') === '1') {
    document.body.classList.add('is-mobile-forced');
  }

  if (mobileToggle && mobileMenu) {
    const toggleMenu = () => {
      const isActive = mobileMenu.classList.contains('active');
      if (isActive) {
        mobileMenu.classList.remove('active');
        mobileToggle.classList.remove('active');
        document.body.classList.remove('menu-open');
      } else {
        mobileMenu.classList.add('active');
        mobileToggle.classList.add('active');
        document.body.classList.add('menu-open');
      }
    };

    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    const mobileMenuClose = document.getElementById('mobileMenuClose');
    if (mobileMenuClose) {
      mobileMenuClose.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        mobileToggle.classList.remove('active');
        document.body.classList.remove('menu-open');
      });
    }

    const mobileMenuOverlayClose = document.getElementById('mobileMenuOverlayClose');
    if (mobileMenuOverlayClose) {
      mobileMenuOverlayClose.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        mobileToggle.classList.remove('active');
        document.body.classList.remove('menu-open');
      });
    }

    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    if (mobileMenuOverlay) {
      mobileMenuOverlay.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        mobileToggle.classList.remove('active');
        document.body.classList.remove('menu-open');
      });
    }

    const mobileLinks = mobileMenu.querySelectorAll('.mobile-menu-row');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        // Remove active state from all items to dynamically shift highlight
        mobileLinks.forEach(item => item.classList.remove('active'));
        link.classList.add('active');

        mobileMenu.classList.remove('active');
        mobileToggle.classList.remove('active');
        document.body.classList.remove('menu-open');
      });
    });
  }

  // Header background tint on scroll
  const header = document.querySelector('.header');
  if (header) {
    let scrolled = false;
    let ticking = false;

    const onScroll = () => {
      const isScrolled = window.scrollY > 30;
      if (isScrolled !== scrolled) {
        scrolled = isScrolled;
        if (scrolled) {
          header.classList.add('is-scrolled');
        } else {
          header.classList.remove('is-scrolled');
        }
      }
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    }, { passive: true });
  }
}
