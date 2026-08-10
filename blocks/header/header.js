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

function buildUtilityBar() {
  const utility = document.createElement('div');
  utility.className = 'nav-utility';

  const signIn = document.createElement('a');
  signIn.className = 'nav-signin';
  signIn.href = '#sign-in';
  signIn.textContent = 'Sign In';

  // inline US flag SVG (renders reliably, unlike the emoji flag)
  const usFlag = `<svg class="nav-lang-flag" viewBox="0 0 24 16" role="img" aria-label="United States">
    <rect width="24" height="16" fill="#b22234"/>
    <g fill="#fff">
      <rect y="1.23" width="24" height="1.23"/>
      <rect y="3.69" width="24" height="1.23"/>
      <rect y="6.15" width="24" height="1.23"/>
      <rect y="8.62" width="24" height="1.23"/>
      <rect y="11.08" width="24" height="1.23"/>
      <rect y="13.54" width="24" height="1.23"/>
    </g>
    <rect width="9.6" height="8.62" fill="#3c3b6e"/>
  </svg>`;

  const lang = document.createElement('a');
  lang.className = 'nav-lang';
  lang.href = '#language';
  lang.innerHTML = `${usFlag}<span class="nav-lang-code">EN-US</span><span class="nav-lang-caret" aria-hidden="true"></span>`;

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

  nav.append(brand, sections, tools);

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
