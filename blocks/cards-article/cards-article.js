import { createOptimizedPicture } from '../../scripts/aem.js';

const QUERY_INDEX = '/query-index.json';

/**
 * Build a single card <li> from an article record.
 * @param {{path:string,title:string,description:string,image:string}} article
 * @returns {HTMLLIElement}
 */
function buildCard(article) {
  const li = document.createElement('li');

  const imageDiv = document.createElement('div');
  imageDiv.className = 'cards-article-card-image';
  const imgLink = document.createElement('a');
  imgLink.href = '#';
  if (article.image) {
    const pic = createOptimizedPicture(article.image, article.title, false, [{ width: '750' }]);
    imgLink.append(pic);
  }
  imageDiv.append(imgLink);

  const body = document.createElement('div');
  body.className = 'cards-article-card-body';
  const h3 = document.createElement('h3');
  const titleLink = document.createElement('a');
  titleLink.href = '#';
  titleLink.textContent = article.title;
  h3.append(titleLink);
  body.append(h3);
  if (article.description) {
    const p = document.createElement('p');
    p.textContent = article.description;
    body.append(p);
  }

  li.append(imageDiv, body);
  return li;
}

/**
 * Decorate authored cards (fallback / non-dynamic instances).
 * @param {Element} block
 */
function decorateAuthored(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-article-card-image';
      else div.className = 'cards-article-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  // point every card link to '#' for now
  ul.querySelectorAll('a[href]').forEach((a) => { a.href = '#'; });
  block.textContent = '';
  block.append(ul);
}

/**
 * Determine whether this block should be populated dynamically from the query
 * index, and with which article-path filter.
 *
 * Only the homepage "Recent Articles" teaser is dynamic — it links to
 * /magazine/ pages and its section is headed "Recent Articles". Other card
 * grids that also link to /magazine/ (e.g. the magazine page's authored
 * "All Articles" list) or to /adventures/ keep their authored cards, which
 * already carry the correct set and order of items.
 * @param {Element} block
 * @returns {string|null} path segment to filter on, or null for authored mode
 */
function getDynamicFilter(block) {
  const firstLink = block.querySelector('a[href]');
  if (!firstLink) return null;
  const href = firstLink.getAttribute('href');
  if (!href || !href.includes('/magazine/')) return null;

  // Only go dynamic for the "Recent Articles" section (homepage teaser).
  const section = block.closest('.section');
  const heading = section && section.querySelector('.default-content-wrapper h2, .default-content-wrapper h3');
  if (heading && /recent articles/i.test(heading.textContent)) return '/magazine/';
  return null;
}

/**
 * Convert the section's standalone CTA link ("All Articles" / "All Trips")
 * into a button pointing to '#'.
 * @param {Element} block
 */
function decorateSectionCta(block) {
  const section = block.closest('.section');
  if (!section) return;
  const ctas = section.querySelectorAll('.default-content-wrapper p > a');
  ctas.forEach((a) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'cards-article-cta';
    button.textContent = a.textContent;
    button.addEventListener('click', () => {
      window.location.href = '#';
    });
    a.replaceWith(button);
  });
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const filter = getDynamicFilter(block);

  // Non-dynamic instances (e.g. adventures grid) keep their authored cards.
  if (!filter) {
    decorateAuthored(block);
    decorateSectionCta(block);
    return;
  }

  const limit = block.children.length || 4;

  try {
    const resp = await fetch(QUERY_INDEX);
    if (!resp.ok) throw new Error(`query-index ${resp.status}`);
    const json = await resp.json();
    const articles = (json.data || [])
      .filter((a) => a.path && a.path.includes(filter))
      .slice(0, limit);

    if (!articles.length) throw new Error('no indexed articles');

    const ul = document.createElement('ul');
    articles.forEach((article) => ul.append(buildCard(article)));
    block.textContent = '';
    block.append(ul);

    decorateSectionCta(block);
  } catch (e) {
    // graceful fallback: render the authored cards if the index is unavailable
    // eslint-disable-next-line no-console
    console.warn('cards-article: falling back to authored cards —', e.message);
    decorateAuthored(block);
    decorateSectionCta(block);
  }
}
