/**
 * Resolve an authored absolute path for the current environment. The local
 * preview serves content under a `/content` prefix, while production serves it
 * at the root. Mirror the prefix of the page we're currently on so links work
 * in both places. Non-absolute hrefs (e.g. '#') pass through unchanged.
 * @param {string} href
 * @returns {string}
 */
function resolveHref(href) {
  if (!href.startsWith('/') || href.startsWith('/content/')) return href;
  return window.location.pathname.startsWith('/content/') ? `/content${href}` : href;
}

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-featured-${cols.length}-cols`);

  // setup columns: mark image columns and text columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-featured-img-col');
        }
      } else {
        col.classList.add('columns-featured-text-col');

        // first paragraph acts as the eyebrow/pretitle ("Featured Article")
        const firstP = col.querySelector('p');
        if (firstP) firstP.classList.add('columns-featured-eyebrow');

        // convert the CTA link ("Full Article" / "Read More") into a button
        // that navigates to the link's authored destination
        const cta = col.querySelector('p:last-child a');
        if (cta) {
          // use the authored href, normalising the .html suffix to a clean path
          // and mirroring the current environment's path prefix
          const rawHref = (cta.getAttribute('href') || '#').replace(/\.html($|[?#])/, '$1');
          const href = resolveHref(rawHref);
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'columns-featured-cta';
          button.textContent = cta.textContent;
          button.addEventListener('click', () => {
            window.location.href = href;
          });
          const ctaP = cta.closest('p');
          ctaP.classList.add('columns-featured-cta-wrapper');
          cta.replaceWith(button);
        }
      }
    });
  });
}
