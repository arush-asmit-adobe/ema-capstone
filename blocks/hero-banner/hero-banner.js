/**
 * Resolve an authored absolute path for the current environment. The local
 * preview serves content under a `/content` prefix, while production serves it
 * at the root. Drops a trailing `.html` and mirrors the current page's prefix
 * so links work in both places. Non-absolute hrefs (e.g. '#') pass through.
 * @param {string} rawHref
 * @returns {string}
 */
function resolveHref(rawHref) {
  const href = (rawHref || '#').replace(/\.html($|[?#])/, '$1');
  if (!href.startsWith('/') || href.startsWith('/content/')) return href;
  return window.location.pathname.startsWith('/content/') ? `/content${href}` : href;
}

export default function decorate(block) {
  const rows = [...block.children];

  // first row holds the background image, second row holds the content
  const imageRow = rows.find((row) => row.querySelector('picture'));
  const contentRow = rows.find((row) => !row.querySelector('picture'));

  if (imageRow) imageRow.classList.add('hero-banner-image');
  if (!imageRow) block.classList.add('no-image');

  if (contentRow) {
    contentRow.classList.add('hero-banner-content');

    // convert the CTA link ("See Trip") into a button that navigates to the
    // link's authored destination (e.g. the Climbing New Zealand adventure)
    const cta = contentRow.querySelector('p:last-child a');
    if (cta) {
      const href = resolveHref(cta.getAttribute('href'));
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'hero-banner-cta';
      button.textContent = cta.textContent;
      button.addEventListener('click', () => {
        window.location.href = href;
      });
      cta.closest('p').classList.add('hero-banner-cta-wrapper');
      cta.replaceWith(button);
    }
  }
}
