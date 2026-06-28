'use strict';

/* =====================================================================
   1. CONSTANTS, STATE & DOM REFERENCES
   ===================================================================== */
const STORAGE_KEYS = {
  favorites: 'kiu_favorites',
  applications: 'kiu_applications',
  visits: 'kiu_visit_count',
  lastFilter: 'kiu_last_filter',
  theme: 'kiu_theme',
};

// Real external services — no API key required.
const WEATHER_API =
  'https://api.open-meteo.com/v1/forecast?latitude=42.2679&longitude=42.6946&current_weather=true&timezone=Asia%2FTbilisi';
// Curated education & science quotes — no external dependency needed.
const EDUCATION_QUOTES = [
  { quote: 'The purpose of education is to replace an empty mind with an open one.', author: 'Malcolm Forbes' },
  { quote: 'Education is the most powerful weapon which you can use to change the world.', author: 'Nelson Mandela' },
  { quote: 'The more that you read, the more things you will know. The more that you learn, the more places you\'ll go.', author: 'Dr. Seuss' },
  { quote: 'An investment in knowledge pays the best interest.', author: 'Benjamin Franklin' },
  { quote: 'The beautiful thing about learning is that nobody can take it away from you.', author: 'B.B. King' },
  { quote: 'Education is not the filling of a pail, but the lighting of a fire.', author: 'W.B. Yeats' },
  { quote: 'Live as if you were to die tomorrow. Learn as if you were to live forever.', author: 'Mahatma Gandhi' },
  { quote: 'The mind is not a vessel to be filled, but a fire to be ignited.', author: 'Plutarch' },
  { quote: 'Science is not only a disciple of reason but, also, one of romance and passion.', author: 'Stephen Hawking' },
  { quote: 'Equipped with his five senses, man explores the universe around him and calls the adventure Science.', author: 'Edwin Hubble' },
  { quote: 'Research is to see what everybody else has seen, and to think what nobody else has thought.', author: 'Albert Szent-Györgyi' },
  { quote: 'The roots of education are bitter, but the fruit is sweet.', author: 'Aristotle' },
  { quote: 'Somewhere, something incredible is waiting to be known.', author: 'Carl Sagan' },
  { quote: 'Intelligence plus character — that is the goal of true education.', author: 'Martin Luther King Jr.' },
  { quote: 'Hic Scientia Futūrum Creat — where knowledge creates the future.', author: 'KIU Motto' },
];
const PROGRAMS_JSON_PATH = 'programs.json';

const CAMPUS_FACTS = [
  "KIU's campus spreads across 150 hectares of forest near Kutaisi, with a river running through it.",
  'KIU is co-developed with the Technical University of Munich (TUM) — academic model and all.',
  "TUM's former president, Prof. Dr. Wolfgang A. Herrmann, serves as KIU's honorary president.",
  'The campus sits about 25 km from Kutaisi International Airport, 3 hours from Tbilisi by road.',
  'KIU is a Legal Entity of Public Law — a Georgian state university, opened in 2020.',
  "The Cartu Foundation backs KIU's campus and long-term development.",
];

// Bundled fallback so the program grid still works if data/programs.json
// cannot be fetched (e.g. opening this file directly without a local server).
const FALLBACK_PROGRAMS = [
  { id: 'cs', name: 'Computer Science', school: 'Engineering & Natural Sciences', degree: 'Bachelor of Science', duration: '4 years', language: 'English', tagline: 'Software systems, algorithms and the foundations of AI.' },
  { id: 'math', name: 'Mathematics & Applications', school: 'Engineering & Natural Sciences', degree: 'Bachelor of Science', duration: '4 years', language: 'English', tagline: 'AI foundations, scientific computing and financial mathematics.' },
  { id: 'ecs', name: 'Embedded Computing Systems', school: 'Engineering & Natural Sciences', degree: 'Master of Science', duration: '2 years', language: 'English', tagline: 'Hardware-software co-design for real-time and IoT systems.' },
  { id: 'mgmt', name: 'Management', school: 'Business & Economics', degree: 'Bachelor of Science', duration: '4 years', language: 'English', tagline: 'Leadership, strategy and operations for global organizations.' },
  { id: 'fim', name: 'Finance & Information Management', school: 'Business & Economics', degree: 'Master of Science', duration: '2 years', language: 'English', tagline: 'Where financial decision-making meets data and information systems.' },
  { id: 'design', name: 'Design', school: 'Design', degree: 'Bachelor of Design', duration: '4 years', language: 'English / Georgian', tagline: 'Product, visual and spatial design grounded in research.' },
  { id: 'law', name: 'Law', school: 'Law & Social Sciences', degree: 'Bachelor of Law', duration: '4 years', language: 'English / Georgian', tagline: 'Georgian and international legal systems in practice.' },
  { id: 'psych', name: 'Psychology', school: 'Law & Social Sciences', degree: "Bachelor's Degree", duration: '4 years', language: 'English / Georgian', tagline: 'Human behaviour, cognition and applied research methods.' },
  { id: 'ipie', name: 'Intellectual Property, Innovation & Entrepreneurship', school: 'Law & Social Sciences', degree: "Master's Degree", duration: '2 years', language: 'English', tagline: 'Turning research and ideas into protected, fundable ventures.' },
  { id: 'med', name: 'Medicine', school: 'Medicine', degree: 'Single-Cycle Program', duration: '6 years', language: 'English / Georgian', tagline: "A clinical and research track supported by KIU's hadron-therapy centre." },
];


const WEATHER_CODES = {
  0: 'Clear sky', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Icy fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 71: 'Light snow', 73: 'Snow',
  75: 'Heavy snow', 80: 'Rain showers', 81: 'Squally showers', 95: 'Thunderstorm',
};

// --- DOM selection helpers ---
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

// All elements gathered once, then destructured wherever they're needed.
const elements = {
  header: $('#siteHeader'),
  navToggle: $('#navToggle'),
  navLinks: $('#navLinks'),
  favCount: $('#favCount'),
  themeToggle: $('#themeToggle'),

  pulseClock: $('#pulseClock'),
  pulseWeather: $('#pulseWeather'),
  pulseVisits: $('#pulseVisits'),
  pulseFact: $('#pulseFact'),
  pulseDot: $('#pulseDot'),

  statsBand: $('#statsBand'),

  programSearch: $('#programSearch'),
  filterChips: $('#filterChips'),
  programsGrid: $('#programsGrid'),
  programsEmpty: $('#programsEmpty'),
  programSelect: $('#programSelect'),

  admissionForm: $('#admissionForm'),
  submitBtn: $('#submitBtn'),
  submitBtnText: $('#submitBtnText'),
  formStatus: $('#formStatus'),
  applicationsList: $('#applicationsList'),
  applicationsEmpty: $('#applicationsEmpty'),

  favoritesGrid: $('#favoritesGrid'),
  favoritesEmpty: $('#favoritesEmpty'),

  quoteText: $('#quoteText'),
  quoteAuthor: $('#quoteAuthor'),
  quoteRefresh: $('#quoteRefresh'),
};

// Application state lives in one place; views are re-rendered from it.
const state = {
  programs: [],
  activeSchool: 'All',
  searchTerm: '',
};

/* =====================================================================
   2. SMALL UTILITIES (ES6+: rest/spread, default params, arrow fns)
   ===================================================================== */
const cx = (...classNames) => classNames.filter(Boolean).join(' ');

const debounce = (fn, delay = 200) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const escapeHtml = (str = '') =>
  str.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]));

/* =====================================================================
   3. WEB STORAGE LAYER
   localStorage itself is synchronous, but we wrap writes in a Promise
   (with a short simulated delay) so the rest of the app can treat every
   persistence call consistently with async/await.
   ===================================================================== */
const readStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.warn(`Could not read "${key}" from localStorage:`, err);
    return fallback;
  }
};

const writeStorageAsync = (key, value) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        resolve(value);
      } catch (err) {
        reject(err);
      }
    }, 150);
  });

const getFavorites = () => readStorage(STORAGE_KEYS.favorites, []);
const getApplications = () => readStorage(STORAGE_KEYS.applications, []);

/* =====================================================================
   3b. DAY / NIGHT MODE
   The actual theme class is applied as early as possible by an inline
   script in <head> (to avoid a flash of the wrong theme). This module
   just keeps the toggle button in sync and persists the user's choice.
   ===================================================================== */
const applyTheme = (theme) => {
  const isDark = theme === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  if (elements.themeToggle) {
    elements.themeToggle.setAttribute('aria-pressed', String(isDark));
    elements.themeToggle.setAttribute('aria-label', isDark ? 'Switch to day mode' : 'Switch to night mode');
    elements.themeToggle.setAttribute('title', isDark ? 'Switch to day mode' : 'Switch to night mode');
  }
};

const getCurrentTheme = () => (document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

const toggleTheme = () => {
  const next = getCurrentTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try {
    localStorage.setItem(STORAGE_KEYS.theme, next);
  } catch (err) {
    console.warn('Could not persist theme preference:', err);
  }
};

/* =====================================================================
   4. CALLBACK-STYLE HELPER
   A classic callback pattern (no Promises involved): typeWriter reveals
   text one character at a time and invokes onComplete() once it's done.
   ===================================================================== */
function typeWriter(el, text, speed, onComplete) {
  el.textContent = '';
  let i = 0;
  const step = () => {
    if (i < text.length) {
      el.textContent += text.charAt(i);
      i += 1;
      setTimeout(step, speed);
    } else if (typeof onComplete === 'function') {
      onComplete();
    }
  };
  step();
}

let factIndex = 0;
const showNextFact = () => {
  const fact = CAMPUS_FACTS[factIndex % CAMPUS_FACTS.length];
  factIndex += 1;
  // typeWriter's callback chains the next fact after a pause — classic
  // nested-callback style asynchronous flow.
  typeWriter(elements.pulseFact, fact, 22, () => {
    setTimeout(showNextFact, 4500);
  });
};

/* =====================================================================
   5. PROMISE CHAIN (.then / .catch) + FETCH — live campus weather
   Intentionally written as a .then().catch() chain (not async/await)
   to demonstrate the classic Promise consumption style alongside the
   async/await approach used elsewhere in this file.
   ===================================================================== */
function loadCampusWeather() {
  fetch(WEATHER_API)
    .then((response) => {
      if (!response.ok) throw new Error(`Weather request failed (${response.status})`);
      return response.json();
    })
    .then(({ current_weather: { temperature, weathercode } }) => {
      const condition = WEATHER_CODES[weathercode] ?? 'Mixed conditions';
      elements.pulseWeather.textContent = `${temperature}°C · ${condition}`;
    })
    .catch((err) => {
      console.warn('Weather unavailable:', err);
      elements.pulseWeather.textContent = 'unavailable right now';
      elements.pulseDot.classList.add('is-offline');
    });
}

/* =====================================================================
   6. QUOTE ROTATION — curated local array, no external dependency.
   Picks a deterministic quote based on the day of the year so the
   "daily" feel is preserved (same quote all day, new one each day),
   and the Refresh button steps forward through the list.
   ===================================================================== */
let quoteIndex = (() => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay) % EDUCATION_QUOTES.length;
})();

function loadDailyQuote() {
  const { quote, author } = EDUCATION_QUOTES[quoteIndex % EDUCATION_QUOTES.length];
  quoteIndex += 1;
  elements.quoteText.textContent = `\u201C${quote}\u201D`;
  elements.quoteAuthor.textContent = `\u2014 ${author}`;
}

/* =====================================================================
   7. ASYNC/AWAIT + FETCH — local program catalogue (JSON "API")
   ===================================================================== */
async function loadPrograms() {
  try {
    const response = await fetch(PROGRAMS_JSON_PATH);
    if (!response.ok) throw new Error('Catalogue request failed');
    const data = await response.json();
    return data.programs;
  } catch (err) {
    console.warn('Falling back to the bundled program catalogue:', err);
    return FALLBACK_PROGRAMS;
  }
}

/* =====================================================================
   8. RENDERING — programs grid, filter chips, favorites
   ===================================================================== */
const renderProgramCard = (program) => {
  const { id, name, school, degree, duration, language, tagline } = program;
  const isFav = getFavorites().includes(id);
  return `
    <article class="program-card" data-id="${id}">
      <button class="${cx('fav-btn', isFav && 'is-active')}" data-fav-toggle="${id}" aria-label="${isFav ? 'Remove' : 'Save'} ${escapeHtml(name)}">${isFav ? '\u2605' : '\u2606'}</button>
      <span class="program-tag">${school}</span>
      <h3>${name}</h3>
      <div class="program-meta">
        <span>${degree}</span><span>${duration}</span><span>${language}</span>
      </div>
      <p class="program-tagline">${tagline}</p>
      <a class="program-apply" href="#admission" data-apply="${id}">Apply to this program \u2192</a>
    </article>`;
};

const renderPrograms = (list) => {
  elements.programsGrid.innerHTML = list.map(renderProgramCard).join('');
  elements.programsEmpty.hidden = list.length !== 0;
};

const getFilteredPrograms = () => {
  const { programs, activeSchool, searchTerm } = state;
  const term = searchTerm.trim().toLowerCase();
  return programs.filter(({ name, school, tagline }) => {
    const matchesSchool = activeSchool === 'All' || school === activeSchool;
    const matchesSearch = !term || `${name} ${tagline}`.toLowerCase().includes(term);
    return matchesSchool && matchesSearch;
  });
};

const refreshProgramView = () => renderPrograms(getFilteredPrograms());

const buildFilterChips = (programs) => {
  const schools = ['All', ...new Set(programs.map(({ school }) => school))];
  elements.filterChips.innerHTML = schools
    .map((school) => `<button class="${cx('chip', school === state.activeSchool && 'is-active')}" data-school="${school}">${school}</button>`)
    .join('');
};

const renderFavorites = () => {
  const favIds = getFavorites();
  const favPrograms = state.programs.filter(({ id }) => favIds.includes(id));
  elements.favoritesGrid.innerHTML = favPrograms.map(renderProgramCard).join('');
  elements.favoritesEmpty.hidden = favPrograms.length !== 0;
  elements.favCount.textContent = favIds.length;
};

const toggleFavorite = async (id) => {
  const current = getFavorites();
  const next = current.includes(id)
    ? current.filter((favId) => favId !== id)
    : [...current, id];
  await writeStorageAsync(STORAGE_KEYS.favorites, next);
  refreshProgramView();
  renderFavorites();
};

const populateProgramSelect = (programs) => {
  const options = programs.map(({ id, name }) => `<option value="${id}">${name}</option>`).join('');
  elements.programSelect.innerHTML = `<option value="" disabled selected>Choose a program</option>${options}`;
};

const programNameById = (id) => state.programs.find((program) => program.id === id)?.name ?? id;

/* =====================================================================
   9. ADMISSION FORM — Promise-based "submission" + localStorage
   ===================================================================== */
const submitApplication = (payload) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      const { fullName, email } = payload;
      if (!fullName || !email) {
        reject(new Error('Please fill in your name and email.'));
        return;
      }
      resolve({ ...payload, id: `app_${Date.now()}`, submittedAt: new Date().toISOString() });
    }, 900); // simulated network round-trip
  });

const renderApplicationCard = ({ id, fullName, program, intake, submittedAt }) => {
  const when = new Date(submittedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
  return `
    <li class="application-card" data-id="${id}">
      <div class="application-info">
        <strong>${escapeHtml(fullName)}</strong>
        <span class="application-meta">${programNameById(program)} \u00B7 ${intake} \u00B7 saved ${when}</span>
      </div>
      <button class="application-remove" data-remove="${id}">Remove</button>
    </li>`;
};

const renderApplications = () => {
  const applications = getApplications();
  elements.applicationsList.innerHTML = applications.map(renderApplicationCard).join('');
  elements.applicationsEmpty.hidden = applications.length !== 0;
};

const handleAdmissionSubmit = async (event) => {
  event.preventDefault();
  const formData = new FormData(elements.admissionForm);
  const { fullName, email, program, intake, message } = Object.fromEntries(formData);

  elements.submitBtn.disabled = true;
  elements.submitBtnText.textContent = 'Submitting\u2026';
  elements.formStatus.textContent = '';
  elements.formStatus.classList.remove('is-error');

  try {
    const application = await submitApplication({ fullName, email, program, intake, message });
    const existing = getApplications();
    await writeStorageAsync(STORAGE_KEYS.applications, [...existing, application]);
    elements.formStatus.textContent = `Saved \u2014 we "received" ${fullName}'s application for ${intake}.`;
    elements.admissionForm.reset();
    renderApplications();
  } catch (err) {
    elements.formStatus.textContent = `Couldn't submit: ${err.message}`;
    elements.formStatus.classList.add('is-error');
  } finally {
    elements.submitBtn.disabled = false;
    elements.submitBtnText.textContent = 'Submit application';
  }
};

/* =====================================================================
   10. STATS COUNT-UP (IntersectionObserver + requestAnimationFrame)
   ===================================================================== */
const animateCount = (el, target, duration = 1200) => {
  const start = performance.now();
  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - (1 - progress) ** 3;
    el.textContent = Math.round(target * eased);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
};

const statObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(({ isIntersecting }) => {
    if (!isIntersecting) return;
    $$('.stat-num', elements.statsBand).forEach((el) => animateCount(el, Number(el.dataset.target)));
    observer.disconnect();
  });
}, { threshold: 0.4 });

/* =====================================================================
   11. LIVE CLOCK + VISIT COUNTER
   ===================================================================== */
const clockFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Tbilisi', hour: '2-digit', minute: '2-digit', second: '2-digit',
});
const updateClock = () => {
  elements.pulseClock.textContent = clockFormatter.format(new Date());
};

const trackVisit = () => {
  const count = readStorage(STORAGE_KEYS.visits, 0) + 1;
  localStorage.setItem(STORAGE_KEYS.visits, JSON.stringify(count));
  elements.pulseVisits.textContent = count === 1 ? '1st visit \u2014 welcome' : `visit #${count}`;
};

/* =====================================================================
   12. EVENT LISTENERS (delegation, input, submit, scroll)
   ===================================================================== */
const handleCardGridClick = (event) => {
  const favBtn = event.target.closest('[data-fav-toggle]');
  if (favBtn) {
    toggleFavorite(favBtn.dataset.favToggle);
    return;
  }
  const applyLink = event.target.closest('[data-apply]');
  if (applyLink) {
    elements.programSelect.value = applyLink.dataset.apply;
  }
};
elements.programsGrid.addEventListener('click', handleCardGridClick);
elements.favoritesGrid.addEventListener('click', handleCardGridClick);

const debouncedSearch = debounce((value) => {
  state.searchTerm = value;
  refreshProgramView();
}, 220);
elements.programSearch.addEventListener('input', (event) => debouncedSearch(event.target.value));

elements.filterChips.addEventListener('click', (event) => {
  const chip = event.target.closest('[data-school]');
  if (!chip) return;
  state.activeSchool = chip.dataset.school;
  localStorage.setItem(STORAGE_KEYS.lastFilter, state.activeSchool);
  $$('.chip', elements.filterChips).forEach((c) => c.classList.toggle('is-active', c === chip));
  refreshProgramView();
});

elements.admissionForm.addEventListener('submit', handleAdmissionSubmit);

// .then()/.catch() consumption style — contrasts with the async/await handlers above.
elements.applicationsList.addEventListener('click', (event) => {
  const removeBtn = event.target.closest('[data-remove]');
  if (!removeBtn) return;
  const remaining = getApplications().filter(({ id }) => id !== removeBtn.dataset.remove);
  writeStorageAsync(STORAGE_KEYS.applications, remaining)
    .then(() => renderApplications())
    .catch((err) => console.warn('Could not remove application:', err));
});

elements.quoteRefresh.addEventListener('click', loadDailyQuote);

elements.themeToggle.addEventListener('click', toggleTheme);

elements.navToggle.addEventListener('click', () => {
  const isOpen = elements.navLinks.classList.toggle('is-open');
  elements.navToggle.setAttribute('aria-expanded', String(isOpen));
});
elements.navLinks.addEventListener('click', (event) => {
  if (event.target.tagName === 'A') {
    elements.navLinks.classList.remove('is-open');
    elements.navToggle.setAttribute('aria-expanded', 'false');
  }
});

window.addEventListener('scroll', () => {
  elements.header.classList.toggle('is-scrolled', window.scrollY > 12);
});

/* =====================================================================
   14. CAMPUS GALLERY SLIDESHOW
   Three real KIU campus photos with auto-advance, manual prev/next,
   dot indicators, a progress bar, and synced left-panel descriptions.
   ===================================================================== */
const GALLERY_SLIDES = [
  {
    src: 'https://studenthelp.ro/assets/uploads/universities/74/314f53732a05e470bc101da203adb3d2.jpg',
    alt: 'Aerial view of the full KIU campus grounds',
    heading: 'A Campus Built for Discovery',
    description: '150 hectares of forested land along the Rioni river — KIU\'s campus was designed from scratch as a purpose-built academic and research community, located ~25\u00A0km from Kutaisi city.',
  },
  {
    src: 'https://keystoneacademic-res.cloudinary.com/image/upload/element/17/178205_122814002_101031178482275_5380330633712281683_n.jpg',
    alt: 'Main academic building K at Kutaisi International University',
    heading: 'Academic Building K',
    description: 'The primary academic hub at KIU, where lectures, seminars and collaborative projects bring together students from Engineering, Business, Design, Law and Medicine.',
  },
  {
    src: 'https://i.redd.it/kutaisi-international-university-v0-v0pwm6n0jzhf1.jpg?width=800&format=pjpg&auto=webp&s=ec04d9e238de276319edf50b40cfb5aa5b333f1e',
    alt: 'Academic building A at Kutaisi International University',
    heading: 'Academic Building A',
    description: 'Building A houses specialised labs and faculty offices. Together with Building K, it anchors the pedestrian core of the campus — designed for chance encounters and cross-disciplinary thinking.',
  },
];

const GALLERY_INTERVAL = 5000; // ms between auto-advances

const galleryState = {
  current: 0,
  total: GALLERY_SLIDES.length,
  timer: null,
  progressTimer: null,
};

const initGallery = () => {
  const track      = $('#galleryTrack');
  const dotsWrap   = $('#galleryDots');
  const heading    = $('#galleryHeading');
  const sub        = $('#gallerySub');
  const label      = $('#galleryLabel');

  if (!track) return; // section not present

  // Build slides
  GALLERY_SLIDES.forEach(({ src, alt }, i) => {
    const slide = document.createElement('div');
    slide.className = 'gallery-slide';
    slide.setAttribute('role', 'tabpanel');
    slide.setAttribute('aria-label', `Slide ${i + 1} of ${GALLERY_SLIDES.length}`);
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.loading = i === 0 ? 'eager' : 'lazy';
    slide.appendChild(img);
    track.appendChild(slide);
  });

  // Build progress bar
  const progress = document.createElement('div');
  progress.className = 'gallery-progress';
  progress.id = 'galleryProgress';
  track.parentElement.appendChild(progress);

  // Build dots
  GALLERY_SLIDES.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'gallery-dot' + (i === 0 ? ' is-active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-selected', String(i === 0));
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.dataset.index = i;
    dotsWrap.appendChild(dot);
  });

  const goTo = (index) => {
    const next = (index + galleryState.total) % galleryState.total;
    if (next === galleryState.current) return;

    // Slide the track
    track.style.transform = `translateX(-${next * 100}%)`;

    // Fade out text, swap, fade in
    label.classList.add('is-transitioning');
    setTimeout(() => {
      heading.textContent = GALLERY_SLIDES[next].heading;
      sub.textContent     = GALLERY_SLIDES[next].description;
      label.classList.remove('is-transitioning');
    }, 350);

    // Update dots
    $$('.gallery-dot', dotsWrap).forEach((d, i) => {
      d.classList.toggle('is-active', i === next);
      d.setAttribute('aria-selected', String(i === next));
    });

    galleryState.current = next;
  };

  const resetProgress = () => {
    const bar = $('#galleryProgress');
    if (!bar) return;
    bar.style.transition = 'none';
    bar.style.width = '0%';
    // Force reflow so the instant reset paints before the animation begins
    void bar.offsetWidth;
    bar.style.transition = `width ${GALLERY_INTERVAL}ms linear`;
    bar.style.width = '100%';
  };

  // Always stop before starting — prevents stacking intervals on hover resume
  const startAuto = () => {
    clearInterval(galleryState.timer); // ensure only one interval runs
    resetProgress();
    galleryState.timer = setInterval(() => {
      goTo(galleryState.current + 1);
      resetProgress();
    }, GALLERY_INTERVAL);
  };

  // Seed the first description
  heading.textContent = GALLERY_SLIDES[0].heading;
  sub.textContent     = GALLERY_SLIDES[0].description;

  // Kick everything off
  startAuto();
};


const init = async () => {
  applyTheme(getCurrentTheme());
  trackVisit();
  updateClock();
  setInterval(updateClock, 1000);
  showNextFact();
  statObserver.observe(elements.statsBand);

  // These two external calls run independently of the program catalogue.
  loadCampusWeather();
  loadDailyQuote();

  initGallery();

  state.programs = await loadPrograms();

  const savedFilter = localStorage.getItem(STORAGE_KEYS.lastFilter);
  if (savedFilter && state.programs.some(({ school }) => school === savedFilter)) {
    state.activeSchool = savedFilter;
  }

  buildFilterChips(state.programs);
  refreshProgramView();
  populateProgramSelect(state.programs);
  renderApplications();
  renderFavorites();
};

init().catch((err) => console.error('App failed to initialize:', err));