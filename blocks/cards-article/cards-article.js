import { createOptimizedPicture } from '../../scripts/aem.js';

const QUERY_INDEX = '/query-index.json';

/**
 * Resolve a card link for the current environment. Only migrated pages
 * (/magazine/… articles) get a real destination — dropping a trailing .html and
 * mirroring the /content prefix when previewed locally. Any other target (e.g.
 * not-yet-migrated /adventures/… detail pages, which are teaser cards on the
 * source homepage) stays '#'.
 * @param {string} rawHref
 * @returns {string}
 */
function resolveArticleHref(rawHref) {
  const href = (rawHref || '').replace(/\.html($|[?#])/, '$1');
  if (!href.includes('/magazine/')) return '#';
  return window.location.pathname.startsWith('/content/') ? `/content${href}` : href;
}

/**
 * Build a single card <li> from an indexed record. The link points at the
 * record's own path (resolved per environment; unmigrated targets stay '#').
 * @param {{path:string,title:string,description:string,image:string}} article
 * @returns {HTMLLIElement}
 */
function buildCard(article) {
  const li = document.createElement('li');
  const href = resolveArticleHref(article.path);

  const imageDiv = document.createElement('div');
  imageDiv.className = 'cards-article-card-image';
  const imgLink = document.createElement('a');
  imgLink.href = href;
  if (article.image) {
    const pic = createOptimizedPicture(article.image, article.title, false, [{ width: '750' }]);
    imgLink.append(pic);
  }
  imageDiv.append(imgLink);

  const body = document.createElement('div');
  body.className = 'cards-article-card-body';
  const h3 = document.createElement('h3');
  const titleLink = document.createElement('a');
  titleLink.href = href;
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
  // wire each card link to its authored article destination (env-aware)
  ul.querySelectorAll('a[href]').forEach((a) => { a.href = resolveArticleHref(a.getAttribute('href')); });
  block.textContent = '';
  block.append(ul);
}

/**
 * Determine whether this block should be populated dynamically from the query
 * index, and with which article-path filter. The section heading is the signal:
 *   - "Recent Articles"        -> homepage magazine teaser  -> /magazine/
 *   - "Where do you want to go" -> homepage adventures grid  -> /adventures/
 * Any other card grid (e.g. the magazine page's authored "All Articles") keeps
 * its authored cards, which already carry the correct set and order.
 * @param {Element} block
 * @returns {string|null} path segment to filter on, or null for authored mode
 */
function getDynamicFilter(block) {
  const section = block.closest('.section');
  const heading = section && section.querySelector('.default-content-wrapper h2, .default-content-wrapper h3');
  if (!heading) return null;
  const text = heading.textContent;
  if (/recent articles/i.test(text)) return '/magazine/';
  if (/where do you want to go/i.test(text)) return '/adventures/';
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
