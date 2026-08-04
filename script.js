// ============================================================
// Jen Freight Solutions — SPA (no-refresh navigation via AJAX)
// ============================================================

// ---------- Reusable page initializers ----------
// Each function is safe to run after a content swap because it
// re-queries the DOM every time.

function initSlider() {
  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.dot'));
  let currentSlide = 0;
  let slideTimer;

  function showSlide(index) {
    if (!slides.length) return;
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === currentSlide));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
  }

  function startSlider() {
    clearInterval(slideTimer);
    slideTimer = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 6000);
  }

  if (slides.length) {
    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        showSlide(Number(dot.dataset.slide));
        startSlider();
      });
    });
    startSlider();
  }
}

function initPageHeader() {
  // Mobile navigation
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('active');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Social media dropdown
  const socialsToggle = document.querySelector('.socials-toggle');
  const navSocials = document.querySelector('.nav-socials');

  if (socialsToggle && navSocials) {
    socialsToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navSocials.classList.toggle('open');
      socialsToggle.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', (e) => {
      if (!navSocials.contains(e.target)) {
        navSocials.classList.remove('open');
        socialsToggle.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        navSocials.classList.remove('open');
        socialsToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

function setActiveNav(href) {
  const current = href.split('#')[0].split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links > a').forEach((link) => {
    const linkHref = (link.getAttribute('href') || '').split('#')[0].split('/').pop();
    link.classList.toggle('active', linkHref === current);
  });
}

function initVehicleFilters() {
  const filterButtons = Array.from(document.querySelectorAll('.filter-chip'));
  const vehicleCards = Array.from(document.querySelectorAll('.vehicle-card'));

  if (filterButtons.length && vehicleCards.length) {
    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const filter = button.dataset.filter;

        filterButtons.forEach((chip) => chip.classList.toggle('active', chip === button));

        vehicleCards.forEach((card) => {
          const categories = (card.dataset.category || '').split(' ').map((c) => c.trim());
          const matches = filter === 'all' || categories.includes(filter);
          card.style.display = matches ? 'block' : 'none';
        });
      });
    });
  }
}

function initReveal() {
  const revealElements = Array.from(document.querySelectorAll('.reveal'));

  if (revealElements.length && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('visible'));
  }
}

function initCounters() {
  const counters = Array.from(document.querySelectorAll('[data-counter]'));

  function animateCounter(el) {
    const target = Number(el.dataset.counter) || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = value + suffix;
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  if (counters.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((el) => counterObserver.observe(el));
  } else {
    counters.forEach((el) => {
      el.textContent = (Number(el.dataset.counter) || 0) + (el.dataset.suffix || '');
    });
  }
}

// Run all content initializers (called after every page load / swap)
function runPageInitializers(hash) {
  initSlider();
  initVehicleFilters();
  initReveal();
  initCounters();

  // Scroll to top, or to a hash anchor if present
  if (hash) {
    const target = document.getElementById(hash);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  } else {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
}

// ---------- SPA router ----------
const mainEl = document.querySelector('main');
const appRoot = document.body;

// Loading indicator element
const loader = document.createElement('div');
loader.className = 'page-loader';
loader.setAttribute('aria-hidden', 'true');
document.body.appendChild(loader);

// Simple fade helper
function fadeOut() {
  return new Promise((resolve) => {
    mainEl.classList.add('page-fade-out');
    setTimeout(resolve, 180);
  });
}

function fadeIn() {
  mainEl.classList.remove('page-fade-out');
  mainEl.classList.add('page-fade-in');
  setTimeout(() => mainEl.classList.remove('page-fade-in'), 400);
}

function showLoader() {
  loader.classList.add('show');
}

function hideLoader() {
  loader.classList.remove('show');
}

// Apply a page's body class (e.g. cars-page) and clean up others
function applyBodyClass(className) {
  document.body.classList.remove('cars-page');
  if (className) {
    document.body.classList.add(className);
  }
}

// Extract the <main> inner HTML and required metadata from a fetched page
function extractPageData(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const main = doc.querySelector('main');
  const bodyClass = doc.body.className || '';
  return {
    content: main ? main.innerHTML : '',
    title: doc.title || '',
    bodyClass: bodyClass,
  };
}

// Loads a page without a full refresh
async function loadPage(url, pushState = true) {
  // Normalize URL
  const normalized = url.split('/').pop() || 'index.html';
  const filePath = normalized.split('#')[0];
  const hash = normalized.includes('#') ? normalized.split('#')[1] : null;
  const fullUrl = filePath + (hash ? '#' + hash : '');

  showLoader();
  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const html = await response.text();
    const data = extractPageData(html);

    await fadeOut();
    mainEl.innerHTML = data.content;
    document.title = data.title;
    applyBodyClass(data.bodyClass);
    setActiveNav(filePath);
    hideLoader();
    fadeIn();

    if (pushState) {
      history.pushState({ path: fullUrl }, '', fullUrl);
    }

    runPageInitializers(hash);
  } catch (err) {
    // Fallback: full page navigation (e.g. file:// protocol or fetch error)
    hideLoader();
    mainEl.classList.remove('page-fade-out');
    window.location.href = url;
  }
}

// Intercept clicks on internal links
function handleLinkClick(e) {
  const link = e.target.closest('a');
  if (!link) return;

  const href = link.getAttribute('href');
  if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return; // external / special links behave normally
  }
  if (href.startsWith('#')) {
    // In-page anchor: smooth scroll without reload
    const target = document.getElementById(href.slice(1));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    return;
  }

  // Internal .html page link
  if (href.endsWith('.html')) {
    // Skip if "download" or target="_blank"
    if (link.hasAttribute('download') || link.target === '_blank') return;
    e.preventDefault();
    e.stopPropagation();
    loadPage(href);
  }
}

document.addEventListener('click', handleLinkClick);

// Handle browser back/forward
window.addEventListener('popstate', (e) => {
  const state = e.state;
  if (state && state.path) {
    const filePath = state.path.split('#')[0] || 'index.html';
    const hash = state.path.includes('#') ? state.path.split('#')[1] : null;
    loadPage(filePath, false).then(() => {
      if (hash) {
        const target = document.getElementById(hash);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
});

// ---------- Initial load ----------
// Set active nav + header behaviors once on first paint
initPageHeader();
document.addEventListener('DOMContentLoaded', () => {
  setActiveNav(window.location.pathname);
  runPageInitializers(window.location.hash.slice(1));
});
