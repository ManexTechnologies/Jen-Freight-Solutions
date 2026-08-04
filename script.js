// ---------- Hero Slider ----------
const slides = Array.from(document.querySelectorAll('.hero-slide'));
const dots = Array.from(document.querySelectorAll('.dot'));
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

let currentSlide = 0;
let slideTimer;

function showSlide(index) {
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

// ---------- Mobile Navigation ----------
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

// ---------- Vehicle Filtering ----------
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

// ---------- Scroll Reveal ----------
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
  // Fallback: show everything immediately
  revealElements.forEach((el) => el.classList.add('visible'));
}

// ---------- Animated Counters ----------
const counters = Array.from(document.querySelectorAll('[data-counter]'));

function animateCounter(el) {
  const target = Number(el.dataset.counter) || 0;
  const suffix = el.dataset.suffix || '';
  const duration = 1600;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    // Ease-out cubic
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

