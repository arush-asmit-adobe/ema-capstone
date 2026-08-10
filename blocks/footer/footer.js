// WKND footer (site chrome), self-contained. Migrated pages get real links.
const NAV_ITEMS = [
  { label: 'Magazine', href: '/us/en/magazine' },
  { label: 'Adventures', href: '/us/en/adventures' },
  { label: 'FAQs', href: '/us/en/faqs' },
  { label: 'About Us', href: '/us/en/about-us' },
];

const SOCIAL = [
  {
    label: 'Facebook',
    href: '#facebook',
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H16.7V3.6c-.3 0-1.3-.1-2.45-.1-2.4 0-4.05 1.47-4.05 4.17v2.33H7.5V13h2.7v8h3.3z"/></svg>',
  },
  {
    label: 'Twitter',
    href: '#twitter',
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M22 5.9c-.7.3-1.5.55-2.3.65.85-.5 1.5-1.3 1.8-2.25-.8.47-1.66.8-2.58.99A4.07 4.07 0 0 0 16 4c-2.27 0-4.1 1.85-4.1 4.13 0 .32.03.64.1.94-3.4-.17-6.42-1.8-8.44-4.3-.35.62-.56 1.34-.56 2.1 0 1.44.73 2.7 1.83 3.44-.68-.02-1.32-.21-1.87-.52v.05c0 2 1.42 3.67 3.3 4.05-.35.1-.72.15-1.1.15-.27 0-.53-.03-.78-.08.53 1.64 2.05 2.84 3.86 2.87A8.19 8.19 0 0 1 2 18.57 11.55 11.55 0 0 0 8.29 20.4c7.55 0 11.68-6.27 11.68-11.7v-.53c.8-.58 1.5-1.3 2.03-2.12z"/></svg>',
  },
  {
    label: 'Instagram',
    href: '#instagram',
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 4.62c2.4 0 2.69.01 3.64.05.88.04 1.35.19 1.67.31.42.16.72.36 1.03.67.31.31.51.61.67 1.03.12.32.27.79.31 1.67.04.95.05 1.24.05 3.64s-.01 2.69-.05 3.64c-.04.88-.19 1.35-.31 1.67-.16.42-.36.72-.67 1.03-.31.31-.61.51-1.03.67-.32.12-.79.27-1.67.31-.95.04-1.24.05-3.64.05s-2.69-.01-3.64-.05c-.88-.04-1.35-.19-1.67-.31a2.78 2.78 0 0 1-1.03-.67 2.78 2.78 0 0 1-.67-1.03c-.12-.32-.27-.79-.31-1.67-.04-.95-.05-1.24-.05-3.64s.01-2.69.05-3.64c.04-.88.19-1.35.31-1.67.16-.42.36-.72.67-1.03.31-.31.61-.51 1.03-.67.32-.12.79-.27 1.67-.31.95-.04 1.24-.05 3.64-.05M12 3c-2.44 0-2.75.01-3.71.05-.96.05-1.61.2-2.18.42-.59.23-1.1.54-1.6 1.04-.5.5-.81 1.01-1.04 1.6-.22.57-.37 1.22-.42 2.18C3.01 9.25 3 9.56 3 12s.01 2.75.05 3.71c.05.96.2 1.61.42 2.18.23.59.54 1.1 1.04 1.6.5.5 1.01.81 1.6 1.04.57.22 1.22.37 2.18.42.96.04 1.27.05 3.71.05s2.75-.01 3.71-.05c.96-.05 1.61-.2 2.18-.42a4.4 4.4 0 0 0 1.6-1.04c.5-.5.81-1.01 1.04-1.6.22-.57.37-1.22.42-2.18.04-.96.05-1.27.05-3.71s-.01-2.75-.05-3.71c-.05-.96-.2-1.61-.42-2.18a4.4 4.4 0 0 0-1.04-1.6 4.4 4.4 0 0 0-1.6-1.04c-.57-.22-1.22-.37-2.18-.42C14.75 3.01 14.44 3 12 3zm0 4.38A4.62 4.62 0 1 0 16.62 12 4.62 4.62 0 0 0 12 7.38zm0 7.62A3 3 0 1 1 15 12a3 3 0 0 1-3 3zm4.8-8.88a1.08 1.08 0 1 0 1.08 1.08 1.08 1.08 0 0 0-1.08-1.08z"/></svg>',
  },
];

function buildBrand() {
  const brand = document.createElement('div');
  brand.className = 'footer-brand';
  const link = document.createElement('a');
  link.href = '/us/en';
  link.setAttribute('aria-label', 'WKND Home');
  link.textContent = 'WKND';
  brand.append(link);
  return brand;
}

/**
 * True when the current page is `href` or one of its sub-pages. Compares the
 * current path (stripped of the local `/content` preview prefix, a trailing
 * `.html`, and any trailing slash) against the nav item's section path, so the
 * section link stays highlighted across all of its detail pages (e.g. the
 * Magazine link is active on /magazine and every /magazine/<article>).
 * @param {string} href the nav item's section path
 * @returns {boolean}
 */
function isActiveSection(href) {
  const path = window.location.pathname
    .replace(/^\/content/, '')
    .replace(/\.html$/, '')
    .replace(/\/$/, '');
  const section = href.replace(/\/$/, '');
  return path === section || path.startsWith(`${section}/`);
}

function buildNav() {
  const nav = document.createElement('nav');
  nav.className = 'footer-nav';
  nav.setAttribute('aria-label', 'Footer navigation');
  const ul = document.createElement('ul');
  NAV_ITEMS.forEach((item) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = item.href;
    a.textContent = item.label;
    // Keep the current section underlined while on that page or its sub-pages.
    if (isActiveSection(item.href)) {
      a.classList.add('footer-nav-active');
      a.setAttribute('aria-current', 'page');
    }
    li.append(a);
    ul.append(li);
  });
  nav.append(ul);
  return nav;
}

function buildFollow() {
  const follow = document.createElement('div');
  follow.className = 'footer-follow';

  const heading = document.createElement('h4');
  heading.textContent = 'Follow Us';

  const icons = document.createElement('div');
  icons.className = 'footer-social';
  SOCIAL.forEach((s) => {
    const a = document.createElement('a');
    a.href = s.href;
    a.className = 'footer-social-link';
    a.setAttribute('aria-label', s.label);
    a.innerHTML = s.icon;
    icons.append(a);
  });

  follow.append(heading, icons);
  return follow;
}

function buildLegal() {
  const legal = document.createElement('div');
  legal.className = 'footer-legal';
  legal.innerHTML = `
    <p class="footer-copyright">Ⓒ 2019, WKND Site.</p>
    <p>WKND is a fictitious adventure and travel website created by Adobe to demonstrate how anyone can use Adobe Experience Manager to build a beautiful, feature-rich website over a single weekend. This site is built entirely with Adobe Experience Manager <a href="https://docs.adobe.com/content/help/en/experience-manager-core-components/using/introduction.html">Core Components</a> and <a href="https://github.com/adobe/aem-project-archetype">Archetype</a> that are available as open source code to the public. The entire <a href="https://github.com/adobe/aem-guides-wknd/">site source code</a> is available as open source as well and is accompanied with a <a href="https://docs.adobe.com/content/help/en/experience-manager-learn/getting-started-wknd-tutorial-develop/overview.html">detailed tutorial</a> on how to recreate the site.</p>
    <p>Many of the beautiful images in the WKND site are available for purchase via <a href="https://stock.adobe.com/">Adobe Stock</a>.</p>
  `;
  return legal;
}

/**
 * loads and decorates the footer (WKND site chrome)
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  block.textContent = '';

  const footer = document.createElement('div');
  footer.className = 'footer-inner';

  const topRow = document.createElement('div');
  topRow.className = 'footer-top';
  topRow.append(buildBrand(), buildNav(), buildFollow());

  footer.append(topRow, buildLegal());
  block.append(footer);
}
