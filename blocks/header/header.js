// WKND navigation model (site chrome). Migrated pages get real links; the rest use '#'.
const NAV_ITEMS = [
  { label: 'Magazine', href: '/us/en/magazine' },
  { label: 'Adventures', href: '/us/en/adventures' },
  { label: 'FAQs', href: '/us/en/faqs' },
  { label: 'About Us', href: '/us/en/about-us' },
];

/**
 * Build the Sign In modal (matches the WKND source): a dark panel with a
 * serif heading + yellow underline, "Welcome Back", username/password fields,
 * a "forgot password" link and a yellow SIGN IN submit button.
 * @returns {{ overlay: Element, open: Function, close: Function }}
 */
function buildSignInModal() {
  const overlay = document.createElement('div');
  overlay.className = 'signin-overlay';
  overlay.hidden = true;

  const panel = document.createElement('div');
  panel.className = 'signin-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-labelledby', 'signin-title');

  const form = document.createElement('form');
  form.className = 'signin-form';
  form.noValidate = true;
  form.innerHTML = `
    <h1 class="signin-title" id="signin-title">Sign In</h1>
    <h3 class="signin-subtitle">Welcome Back</h3>
    <div class="signin-fields">
      <input class="signin-input" type="text" name="username" placeholder="USERNAME" aria-label="Username" autocomplete="username">
      <input class="signin-input" type="password" name="password" placeholder="PASSWORD" aria-label="Password" autocomplete="current-password">
    </div>
    <p class="signin-forgot"><a href="#">Forgot your password?</a></p>
    <button class="signin-submit" type="submit">Sign In</button>
    <hr class="signin-rule" aria-hidden="true">
  `;
  form.addEventListener('submit', (e) => e.preventDefault());

  panel.append(form);
  overlay.append(panel);

  let lastFocused = null;

  const close = () => {
    overlay.hidden = true;
    document.body.classList.remove('signin-open');
    if (lastFocused) lastFocused.focus();
  };

  const open = () => {
    lastFocused = document.activeElement;
    overlay.hidden = false;
    document.body.classList.add('signin-open');
    const firstInput = form.querySelector('input');
    if (firstInput) firstInput.focus();
  };

  // close on backdrop click (but not when clicking inside the panel)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  // close on Escape
  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  return { overlay, open, close };
}

// Country flag SVGs for the language dropdown. Kept inline so they render
// reliably (no external asset dependency), one per country in the source list.
const FLAGS = {
  US: '<svg viewBox="0 0 24 16" role="img" aria-label="United States"><rect width="24" height="16" fill="#b22234"/><g fill="#fff"><rect y="1.23" width="24" height="1.23"/><rect y="3.69" width="24" height="1.23"/><rect y="6.15" width="24" height="1.23"/><rect y="8.62" width="24" height="1.23"/><rect y="11.08" width="24" height="1.23"/><rect y="13.54" width="24" height="1.23"/></g><rect width="9.6" height="8.62" fill="#3c3b6e"/></svg>',
  CA: '<svg viewBox="0 0 24 16" role="img" aria-label="Canada"><rect width="24" height="16" fill="#fff"/><rect width="6" height="16" fill="#d52b1e"/><rect x="18" width="6" height="16" fill="#d52b1e"/><path fill="#d52b1e" d="M12 4l.6 1.7 1.7-.4-.9 1.5 1.3 1-1.7.3.1 1.7-1.2-1-1.2 1 .1-1.7-1.7-.3 1.3-1-.9-1.5 1.7.4z"/></svg>',
  CH: '<svg viewBox="0 0 24 16" role="img" aria-label="Switzerland"><rect width="24" height="16" fill="#d52b1e"/><rect x="10.5" y="4" width="3" height="8" fill="#fff"/><rect x="8" y="6.5" width="8" height="3" fill="#fff"/></svg>',
  DE: '<svg viewBox="0 0 24 16" role="img" aria-label="Germany"><rect width="24" height="5.33" fill="#000"/><rect y="5.33" width="24" height="5.33" fill="#d00"/><rect y="10.66" width="24" height="5.34" fill="#ffce00"/></svg>',
  FR: '<svg viewBox="0 0 24 16" role="img" aria-label="France"><rect width="8" height="16" fill="#002395"/><rect x="8" width="8" height="16" fill="#fff"/><rect x="16" width="8" height="16" fill="#ed2939"/></svg>',
  ES: '<svg viewBox="0 0 24 16" role="img" aria-label="Spain"><rect width="24" height="16" fill="#c60b1e"/><rect y="4" width="24" height="8" fill="#ffc400"/></svg>',
  IT: '<svg viewBox="0 0 24 16" role="img" aria-label="Italy"><rect width="8" height="16" fill="#009246"/><rect x="8" width="8" height="16" fill="#fff"/><rect x="16" width="8" height="16" fill="#ce2b37"/></svg>',
};

// Locale list per country, mirroring the WKND source language navigation.
const LANGUAGES = [
  { country: 'United States', cc: 'US', locales: [{ label: 'EN-US', href: '/us/en', active: true }, { label: 'ES-US', href: '/us/es' }] },
  { country: 'Canada', cc: 'CA', locales: [{ label: 'EN-CA', href: '/ca/en' }, { label: 'FR-CA', href: '/ca/fr' }] },
  { country: 'Switzerland', cc: 'CH', locales: [{ label: 'DE-CH', href: '/ch/de' }, { label: 'FR-CH', href: '/ch/fr' }, { label: 'IT-CH', href: '/ch/it' }] },
  { country: 'Germany', cc: 'DE', locales: [{ label: 'DE-DE', href: '/de/de' }] },
  { country: 'France', cc: 'FR', locales: [{ label: 'FR-FR', href: '/fr/fr' }] },
  { country: 'Spain', cc: 'ES', locales: [{ label: 'ES-ES', href: '/es/es' }] },
  { country: 'Italy', cc: 'IT', locales: [{ label: 'IT-IT', href: '/it/it' }] },
];

/**
 * Build the language dropdown panel (matches the WKND source): a dark panel of
 * country rows, each with a flag, the country name, and its locale codes. The
 * active locale (EN-US) is underlined.
 * @returns {HTMLElement}
 */
function buildLangMenu() {
  const menu = document.createElement('div');
  menu.className = 'nav-lang-menu';
  menu.hidden = true;

  LANGUAGES.forEach((entry) => {
    const row = document.createElement('div');
    row.className = 'nav-lang-country';

    const flag = document.createElement('span');
    flag.className = 'nav-lang-menu-flag';
    flag.innerHTML = FLAGS[entry.cc] || '';

    const text = document.createElement('div');
    text.className = 'nav-lang-country-text';

    const name = document.createElement('span');
    name.className = 'nav-lang-country-name';
    name.textContent = entry.country;

    const locales = document.createElement('span');
    locales.className = 'nav-lang-locales';
    entry.locales.forEach((loc, i) => {
      if (i > 0) {
        const sep = document.createElement('span');
        sep.className = 'nav-lang-sep';
        sep.setAttribute('aria-hidden', 'true');
        sep.textContent = '|';
        locales.append(sep);
      }
      const a = document.createElement('a');
      a.className = 'nav-lang-locale';
      a.href = loc.href;
      a.textContent = loc.label;
      if (loc.active) a.classList.add('is-active');
      locales.append(a);
    });

    text.append(name, locales);
    row.append(flag, text);
    menu.append(row);
  });

  return menu;
}

function buildUtilityBar() {
  const utility = document.createElement('div');
  utility.className = 'nav-utility';

  const signIn = document.createElement('a');
  signIn.className = 'nav-signin';
  signIn.href = '#sign-in';
  signIn.textContent = 'Sign In';

  // language toggle: US flag + EN-US + caret, opening the country dropdown
  const lang = document.createElement('div');
  lang.className = 'nav-lang-wrap';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-lang';
  toggle.setAttribute('aria-haspopup', 'true');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Toggle language, current: EN-US');
  toggle.innerHTML = `<span class="nav-lang-flag">${FLAGS.US}</span><span class="nav-lang-code">EN-US</span><span class="nav-lang-caret" aria-hidden="true"></span>`;

  const menu = buildLangMenu();

  const closeMenu = () => {
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    lang.classList.remove('is-open');
  };
  const openMenu = () => {
    menu.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    lang.classList.add('is-open');
  };
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (menu.hidden) openMenu(); else closeMenu();
  });
  // close when clicking outside or pressing Escape
  document.addEventListener('click', (e) => {
    if (!lang.contains(e.target)) closeMenu();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  lang.append(toggle, menu);
  utility.append(signIn, lang);
  return { utility, signIn };
}

function buildBrand() {
  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', 'WKND Home');
  button.textContent = 'WKND';
  // redirect to the landing page
  button.addEventListener('click', () => {
    window.location.href = '/us/en';
  });
  brand.append(button);
  return brand;
}

/**
 * Whether a nav item points to the page currently being viewed. Handles both
 * the production path (/us/en/magazine) and the local preview path
 * (/content/us/en/magazine[.html]).
 * @param {string} href
 * @returns {boolean}
 */
function isActive(href) {
  if (!href || href === '#') return false;
  const path = window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '');
  const target = href.replace(/\.html$/, '').replace(/\/$/, '');
  return path === target || path === `/content${target}` || path.endsWith(target);
}

function buildSections() {
  const sections = document.createElement('div');
  sections.className = 'nav-sections';
  const ul = document.createElement('ul');
  NAV_ITEMS.forEach((item) => {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = item.label;
    // highlight the nav item for the page currently being viewed
    if (isActive(item.href)) button.classList.add('is-active');
    // navigate to the item's hyperlink ('#' for now)
    button.addEventListener('click', () => {
      window.location.href = item.href;
    });
    li.append(button);
    ul.append(li);
  });
  sections.append(ul);
  return sections;
}

function buildTools() {
  const tools = document.createElement('div');
  tools.className = 'nav-tools';

  const form = document.createElement('form');
  form.className = 'nav-search';
  form.setAttribute('role', 'search');
  form.addEventListener('submit', (e) => e.preventDefault());

  const label = document.createElement('label');
  label.className = 'nav-search-icon';
  label.setAttribute('aria-hidden', 'true');

  const input = document.createElement('input');
  input.type = 'search';
  input.placeholder = 'SEARCH';
  input.setAttribute('aria-label', 'Search');

  form.append(label, input);
  tools.append(form);
  return tools;
}

/**
 * Reacts to scroll position on the sticky header:
 * - `is-scrolled` (past a small threshold) smoothly shrinks the nav.
 * - `header-scrolled` (any scroll below the top) adds a drop shadow.
 * A single scroll listener drives both, throttled with requestAnimationFrame
 * to avoid layout thrash. Sticky positioning itself is handled in CSS.
 * @param {Element} header The header (header-wrapper) element
 */
function enableShrinkOnScroll(header) {
  const THRESHOLD = 40;
  let ticking = false;

  const update = () => {
    header.classList.toggle('is-scrolled', window.scrollY > THRESHOLD);
    header.classList.toggle('header-scrolled', window.scrollY > 0);
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  // set the correct state on load (e.g. when navigating to an anchor)
  update();
}

/**
 * Build the mobile hamburger toggle. On small screens (see CSS) it shows and
 * expands/collapses the nav sections + tools into a panel below the bar. It is
 * hidden on desktop, where the nav renders inline.
 * @param {Element} nav the <nav> element whose open state it toggles
 * @returns {HTMLButtonElement}
 */
function buildHamburger(nav) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'nav-hamburger';
  button.setAttribute('aria-label', 'Open navigation');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', 'nav');
  button.innerHTML = '<span class="nav-hamburger-icon" aria-hidden="true"></span>';

  button.addEventListener('click', () => {
    const open = nav.classList.toggle('is-nav-open');
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    document.body.classList.toggle('nav-open', open);
  });

  return button;
}

/**
 * loads and decorates the header (WKND site chrome)
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  block.textContent = '';

  const nav = document.createElement('nav');
  nav.id = 'nav';

  const { utility, signIn } = buildUtilityBar();
  const brand = buildBrand();
  const sections = buildSections();
  const tools = buildTools();
  const hamburger = buildHamburger(nav);

  // Order: brand, hamburger (mobile), then the collapsible sections + tools.
  nav.append(brand, hamburger, sections, tools);

  // Close the mobile nav after following a section link.
  sections.querySelectorAll('button').forEach((b) => {
    b.addEventListener('click', () => {
      nav.classList.remove('is-nav-open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open navigation');
      document.body.classList.remove('nav-open');
    });
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(utility, nav);
  block.append(navWrapper);

  // Sign In modal — opens when the utility-bar "Sign In" is clicked
  const signInModal = buildSignInModal();
  block.append(signInModal.overlay);
  signIn.addEventListener('click', (e) => {
    e.preventDefault();
    signInModal.open();
  });

  // shrink the sticky header smoothly as the user scrolls
  const header = block.closest('header') || block.parentElement;
  if (header) enableShrinkOnScroll(header);
}
