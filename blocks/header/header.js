// WKND navigation model (site chrome). Links use '#' for now.
const NAV_ITEMS = [
  { label: 'Magazine', href: '#' },
  { label: 'Adventures', href: '#' },
  { label: 'FAQs', href: '#' },
  { label: 'About Us', href: '#' },
];

function buildUtilityBar() {
  const utility = document.createElement('div');
  utility.className = 'nav-utility';

  const signIn = document.createElement('a');
  signIn.className = 'nav-signin';
  signIn.href = '#sign-in';
  signIn.textContent = 'Sign In';

  const lang = document.createElement('a');
  lang.className = 'nav-lang';
  lang.href = '#language';
  lang.innerHTML = '<span class="nav-lang-flag" aria-hidden="true">🇺🇸</span><span class="nav-lang-code">EN-US</span>';

  utility.append(signIn, lang);
  return utility;
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

function buildSections() {
  const sections = document.createElement('div');
  sections.className = 'nav-sections';
  const ul = document.createElement('ul');
  NAV_ITEMS.forEach((item) => {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = item.label;
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
 * loads and decorates the header (WKND site chrome)
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  block.textContent = '';

  const nav = document.createElement('nav');
  nav.id = 'nav';

  const utility = buildUtilityBar();
  const brand = buildBrand();
  const sections = buildSections();
  const tools = buildTools();

  nav.append(brand, sections, tools);

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(utility, nav);
  block.append(navWrapper);
}
