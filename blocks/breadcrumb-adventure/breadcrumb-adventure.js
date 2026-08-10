/*
 * breadcrumb-adventure — the "ADVENTURES › <Page Name>" trail shown above the
 * masthead on adventure detail pages. Auto-injected (see scripts.js); the page
 * name comes from the page's own H1 so no authored content is required.
 */

/**
 * Resolve the Adventures listing link for the current environment (local
 * preview serves content under a /content prefix; production at the root).
 * @returns {string}
 */
function adventuresHref() {
  return window.location.pathname.startsWith('/content/')
    ? '/content/us/en/adventures'
    : '/us/en/adventures';
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // Current page name: prefer the page H1, fall back to the last path segment.
  const h1 = document.querySelector('main h1');
  let pageName = h1 ? h1.textContent.trim() : '';
  if (!pageName) {
    const slug = window.location.pathname.replace(/\/$/, '').split('/').pop() || '';
    pageName = slug.replace(/-/g, ' ');
  }

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');

  const ol = document.createElement('ol');
  ol.className = 'breadcrumb-adventure-list';

  // 1) Adventures (link)
  const parent = document.createElement('li');
  parent.className = 'breadcrumb-adventure-item';
  const link = document.createElement('a');
  link.href = adventuresHref();
  link.textContent = 'Adventures';
  parent.append(link);

  // 2) current page (active, not a link)
  const current = document.createElement('li');
  current.className = 'breadcrumb-adventure-item breadcrumb-adventure-item-active';
  current.setAttribute('aria-current', 'page');
  current.textContent = pageName;

  ol.append(parent, current);
  nav.append(ol);

  block.textContent = '';
  block.append(nav);
}
