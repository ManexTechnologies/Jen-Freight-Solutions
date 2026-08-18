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

    // Close the mobile nav when clicking outside of it
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) {
        navLinks.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        navLinks.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      }
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

    // The admin page has its own Supabase scripts and auth initialization.
    if (href.split('#')[0].split('/').pop() === 'admin.html') return;

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

// ---------- Admin vehicle management ----------
const ADMIN_STORAGE_KEY = 'jen-freight-vehicle-catalogue';
const SUPABASE_URL = window.__SUPABASE_URL__ || '';
const SUPABASE_ANON_KEY = window.__SUPABASE_ANON_KEY__ || '';
const supabaseClient = window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
const USE_SUPABASE = Boolean(
  window.supabase &&
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    SUPABASE_URL.startsWith('https://')
);

function setAuthMessage(message, isError = false) {
  const authMessage = document.getElementById('auth-message');
  if (!authMessage) return;

  authMessage.textContent = message || '';
  authMessage.classList.toggle('error', isError);
}

function setAdminAccess(isAuthenticated) {
  const authScreen = document.getElementById('admin-auth-screen');
  const dashboard = document.getElementById('admin-dashboard');

  if (authScreen) {
    authScreen.classList.toggle('hidden', isAuthenticated);
  }

  if (dashboard) {
    dashboard.classList.toggle('hidden', !isAuthenticated);
  }
}

async function handleAdminLogin(event) {
  event.preventDefault();

  const emailInput = document.getElementById('admin-email');
  const passwordInput = document.getElementById('admin-password');
  const submitButton = document.getElementById('login-submit');

  if (!emailInput || !passwordInput || !supabaseClient) {
    setAuthMessage('Supabase is not configured yet. Add your URL and anon key.', true);
    return;
  }

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    setAuthMessage('Please enter both email and password.', true);
    return;
  }

  submitButton.disabled = true;
  setAuthMessage('Signing in...');

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) {
    setAuthMessage(error.message || 'Sign in failed.', true);
    submitButton.disabled = false;
    return;
  }

  if (data?.session) {
    setAuthMessage('Signed in successfully.');
    setAdminAccess(true);
    submitButton.disabled = false;
    document.getElementById('admin-password').value = '';
    await renderVehicleList();
  }
}

async function handleAdminSignOut() {
  if (!supabaseClient) return;

  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    setAuthMessage(error.message || 'Unable to sign out.', true);
    return;
  }

  setAdminAccess(false);
  setAuthMessage('You have been signed out.');
  document.getElementById('admin-password')?.focus();
}

async function initializeAdminAuth() {
  if (!supabaseClient) {
    setAdminAccess(false);
    setAuthMessage('Supabase is not configured. Add your project URL and anon key.', true);
    return;
  }

  const { data: { session } } = await supabaseClient.auth.getSession();
  setAdminAccess(Boolean(session));

  if (!session) {
    setAuthMessage('Use your Supabase admin account to continue.');
  }

  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      setAdminAccess(true);
      setAuthMessage('Signed in successfully.');
      renderVehicleList();
    }

    if (event === 'SIGNED_OUT') {
      setAdminAccess(false);
      setAuthMessage('Use your Supabase admin account to continue.');
    }
  });
}

const defaultVehicleInventory = [
  {
    id: 'vehicle-1',
    name: 'Mercedes-Benz C200',
    category: 'Luxury Sedan',
    year: 2015,
    price: '$18,500',
    fuel: 'Petrol',
    transmission: 'Automatic',
    image: 'benz c200.jpeg',
    status: 'Available',
    summary: 'Executive luxury sedan with a refined cabin and smooth turbo power.'
  },
  {
    id: 'vehicle-2',
    name: 'Mercedes-Benz GLA',
    category: 'SUV',
    year: 2016,
    price: '$21,900',
    fuel: 'Petrol',
    transmission: 'Automatic',
    image: 'gla benz.jpeg',
    status: 'Available',
    summary: 'Premium compact SUV blending agile handling with luxury comfort.'
  },
  {
    id: 'vehicle-3',
    name: 'Toyota HiAce Super GL',
    category: 'Van / MPV',
    year: 2015,
    price: '$16,800',
    fuel: 'Petrol',
    transmission: 'Automatic',
    image: 'hiace super gl.jpeg',
    status: 'Pending',
    summary: 'Spacious people carrier built for reliable passenger and business transport.'
  },
  {
    id: 'vehicle-4',
    name: 'BMW 320i',
    category: 'Sedan',
    year: 2015,
    price: '$17,200',
    fuel: 'Petrol',
    transmission: 'Automatic',
    image: 'bmw.jpeg',
    status: 'Available',
    summary: 'Sporty executive sedan with sharp handling and a premium interior.'
  },
  {
    id: 'vehicle-5',
    name: 'Nissan NV350',
    category: 'Van / MPV',
    year: 2014,
    price: '$14,600',
    fuel: 'Petrol',
    transmission: 'Automatic',
    image: 'nissan nv350.jpeg',
    status: 'Sold',
    summary: 'Roomy, dependable van ideal for cargo and passenger use.'
  }
];

function safeLocalStorageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    return false;
  }
}

async function fetchVehiclesFromSupabase() {
  if (!USE_SUPABASE || !supabaseClient) return null;

  const { data, error } = await supabaseClient.from('vehicles').select('*').order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase fetch error:', error);
    return null;
  }

  return data || [];
}

function normalizeVehicle(vehicle) {
  return {
    id: vehicle.id,
    name: vehicle.name,
    category: vehicle.category || 'Luxury Sedan',
    year: Number(vehicle.year) || 2020,
    price: vehicle.price || '$0',
    fuel: vehicle.fuel || 'Petrol',
    transmission: vehicle.transmission || 'Automatic',
    image: vehicle.image || 'benz c200.jpeg',
    status: vehicle.status || 'Available',
    summary: vehicle.summary || ''
  };
}

async function getVehicleInventory() {
  if (USE_SUPABASE && supabaseClient) {
    const data = await fetchVehiclesFromSupabase();
    if (Array.isArray(data) && data.length) {
      return data.map(normalizeVehicle);
    }
  }

  const stored = localStorage.getItem(ADMIN_STORAGE_KEY);

  if (!stored) {
    safeLocalStorageSet(ADMIN_STORAGE_KEY, defaultVehicleInventory);
    return [...defaultVehicleInventory];
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length ? parsed : [...defaultVehicleInventory];
  } catch (err) {
    return [...defaultVehicleInventory];
  }
}

async function saveVehicleInventory(items) {
  if (USE_SUPABASE && supabaseClient) {
    const rows = items.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      year: item.year,
      price: item.price,
      fuel: item.fuel,
      transmission: item.transmission,
      image: item.image,
      status: item.status,
      summary: item.summary,
      created_at: new Date().toISOString()
    }));

    const { error } = await supabaseClient.from('vehicles').upsert(rows, { onConflict: 'id' });
    if (error) {
      console.error('Supabase save error:', error);
    }
    return;
  }

  safeLocalStorageSet(ADMIN_STORAGE_KEY, items);
}

function fillDefaultVehicleForm() {
  const form = document.getElementById('vehicle-form');
  if (!form) return;

  form.reset();
  document.getElementById('vehicle-id').value = '';
  document.getElementById('vehicle-year').value = '2020';
  document.getElementById('vehicle-price').value = '$18,500';
  document.getElementById('vehicle-status').value = 'Available';
  document.getElementById('vehicle-category').value = 'Luxury Sedan';
  document.getElementById('vehicle-fuel').value = 'Petrol';
  document.getElementById('vehicle-transmission').value = 'Automatic';
  document.getElementById('vehicle-image').value = 'benz c200.jpeg';
  document.getElementById('form-title').textContent = 'Add new vehicle';
}

function updateVehicleStats(items) {
  const total = items.length;
  const available = items.filter((item) => item.status === 'Available').length;
  const sold = items.filter((item) => item.status === 'Sold').length;

  const totalEl = document.getElementById('total-vehicles');
  const availableEl = document.getElementById('available-vehicles');
  const soldEl = document.getElementById('sold-vehicles');
  const liveEl = document.getElementById('live-listings');

  if (totalEl) totalEl.textContent = total;
  if (availableEl) availableEl.textContent = available;
  if (soldEl) soldEl.textContent = sold;
  if (liveEl) liveEl.textContent = available + Math.max(0, total - available - sold);
}

async function renderVehicleList() {
  const listEl = document.getElementById('vehicle-list');
  if (!listEl) return;

  const inventory = await getVehicleInventory();
  const searchValue = (document.getElementById('vehicle-search')?.value || '').trim().toLowerCase();
  const statusFilter = document.getElementById('status-filter')?.value || 'all';
  const items = inventory.filter((vehicle) => {
    const matchesSearch =
      !searchValue ||
      vehicle.name.toLowerCase().includes(searchValue) ||
      vehicle.category.toLowerCase().includes(searchValue);
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!items.length) {
    listEl.innerHTML = '<div class="empty-state">No vehicles match your current filters.</div>';
    updateVehicleStats(inventory);
    return;
  }

  listEl.innerHTML = items
    .map(
      (vehicle) => `
        <article class="vehicle-list-item" data-id="${vehicle.id}">
          <div class="vehicle-thumb">
            <img src="${vehicle.image}" alt="${vehicle.name}" loading="lazy" />
          </div>
          <div class="vehicle-item-main">
            <div class="vehicle-item-top">
              <h3>${vehicle.name}</h3>
              <span class="status-badge" data-status="${vehicle.status}">${vehicle.status}</span>
            </div>
            <div class="vehicle-item-meta">
              <span>${vehicle.category}</span>
              <span>${vehicle.year}</span>
              <span>${vehicle.price}</span>
              <span>${vehicle.transmission}</span>
            </div>
          </div>
          <div class="vehicle-item-actions">
            <button class="action-link" type="button" data-action="edit" data-id="${vehicle.id}">Edit</button>
            <button class="action-btn" type="button" data-action="delete" data-id="${vehicle.id}">Delete</button>
          </div>
        </article>
      `
    )
    .join('');

  updateVehicleStats(inventory);
}

async function populateVehicleForm(vehicleId) {
  const inventory = await getVehicleInventory();
  const vehicle = inventory.find((item) => item.id === vehicleId);
  if (!vehicle) return;

  document.getElementById('vehicle-id').value = vehicle.id;
  document.getElementById('vehicle-name').value = vehicle.name;
  document.getElementById('vehicle-category').value = vehicle.category;
  document.getElementById('vehicle-year').value = vehicle.year;
  document.getElementById('vehicle-price').value = vehicle.price;
  document.getElementById('vehicle-fuel').value = vehicle.fuel;
  document.getElementById('vehicle-transmission').value = vehicle.transmission;
  document.getElementById('vehicle-image').value = vehicle.image;
  updateImagePreview(vehicle.image);
  document.getElementById('vehicle-status').value = vehicle.status;
  document.getElementById('vehicle-summary').value = vehicle.summary;
  document.getElementById('form-title').textContent = 'Edit vehicle';

  const formPanel = document.querySelector('.admin-panel');
  if (formPanel) {
    formPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function compressImage(file, maxWidth = 1200, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
        canvas.width = Math.max(1, Math.round(img.width * ratio));
        canvas.height = Math.max(1, Math.round(img.height * ratio));

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function updateImagePreview(imageSrc) {
  const previewEl = document.getElementById('vehicle-image-preview');
  if (!previewEl) return;

  if (!imageSrc) {
    previewEl.classList.add('empty');
    previewEl.innerHTML = '<span>No image selected</span>';
    return;
  }

  previewEl.classList.remove('empty');
  previewEl.innerHTML = `<img src="${imageSrc}" alt="Vehicle preview" />`;
}

function handleLocalImageUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  compressImage(file)
    .then((compressedDataUrl) => {
      const imageField = document.getElementById('vehicle-image');
      if (imageField) {
        imageField.value = compressedDataUrl;
      }
      updateImagePreview(compressedDataUrl);
    })
    .catch(() => {
      const imageField = document.getElementById('vehicle-image');
      if (imageField) {
        imageField.value = '';
      }
      updateImagePreview('');
    });
}

async function handleVehicleSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const id = document.getElementById('vehicle-id').value;
  const imageValue = document.getElementById('vehicle-image').value.trim();
  const data = {
    id: id || `vehicle-${Date.now()}`,
    name: document.getElementById('vehicle-name').value.trim(),
    category: document.getElementById('vehicle-category').value,
    year: Number(document.getElementById('vehicle-year').value) || 2020,
    price: document.getElementById('vehicle-price').value.trim(),
    fuel: document.getElementById('vehicle-fuel').value,
    transmission: document.getElementById('vehicle-transmission').value,
    image: imageValue || 'benz c200.jpeg',
    status: document.getElementById('vehicle-status').value,
    summary: document.getElementById('vehicle-summary').value.trim()
  };

  if (!data.name || !data.price || !data.summary) return;

  const inventory = await getVehicleInventory();
  const existingIndex = inventory.findIndex((item) => item.id === data.id);

  if (existingIndex >= 0) {
    inventory[existingIndex] = data;
  } else {
    inventory.unshift(data);
  }

  await saveVehicleInventory(inventory);
  fillDefaultVehicleForm();
  await renderVehicleList();
  form.reset();
}

async function handleVehicleListClick(event) {
  const actionButton = event.target.closest('[data-action]');
  if (!actionButton) return;

  const { action, id } = actionButton.dataset;
  const inventory = await getVehicleInventory();

  if (action === 'edit') {
    await populateVehicleForm(id);
    return;
  }

  if (action === 'delete') {
    const nextInventory = inventory.filter((item) => item.id !== id);
    await saveVehicleInventory(nextInventory);
    await renderVehicleList();

    if (document.getElementById('vehicle-id').value === id) {
      fillDefaultVehicleForm();
    }
  }
}

function initVehicleAdmin() {
  const form = document.getElementById('vehicle-form');
  const searchInput = document.getElementById('vehicle-search');
  const statusFilter = document.getElementById('status-filter');
  const addButton = document.getElementById('add-new-vehicle');
  const resetButton = document.getElementById('reset-form');
  const cancelButton = document.getElementById('cancel-edit');
  const signOutButton = document.getElementById('admin-signout');
  const imageUploadInput = document.getElementById('vehicle-image-file');
  const list = document.getElementById('vehicle-list');

  if (!form || !list) return;

  if (!document.getElementById('vehicle-id').value) {
    fillDefaultVehicleForm();
  }

  const initialImage = document.getElementById('vehicle-image')?.value || '';
  updateImagePreview(initialImage);

  form.addEventListener('submit', handleVehicleSubmit);
  list.addEventListener('click', handleVehicleListClick);

  if (signOutButton) {
    signOutButton.addEventListener('click', handleAdminSignOut);
  }

  if (imageUploadInput) {
    imageUploadInput.addEventListener('change', handleLocalImageUpload);
  }

  if (searchInput) {
    searchInput.addEventListener('input', renderVehicleList);
  }

  if (statusFilter) {
    statusFilter.addEventListener('change', renderVehicleList);
  }

  if (addButton) {
    addButton.addEventListener('click', () => {
      fillDefaultVehicleForm();
      document.getElementById('vehicle-name')?.focus();
    });
  }

  if (resetButton) {
    resetButton.addEventListener('click', () => {
      fillDefaultVehicleForm();
    });
  }

  if (cancelButton) {
    cancelButton.addEventListener('click', () => {
      fillDefaultVehicleForm();
    });
  }

  renderVehicleList();
}

// ---------- Initial load ----------
// Set active nav + header behaviors once on first paint
initPageHeader();
document.addEventListener('DOMContentLoaded', () => {
  setActiveNav(window.location.pathname);

  const loginForm = document.getElementById('admin-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleAdminLogin);
  }

  initializeAdminAuth();
  initVehicleAdmin();
  runPageInitializers(window.location.hash.slice(1));
});
