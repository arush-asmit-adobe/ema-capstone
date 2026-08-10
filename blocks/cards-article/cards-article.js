import { createOptimizedPicture } from '../../scripts/aem.js';

const QUERY_INDEX = '/query-index.json';

/** Category tabs render in this order (source order); extras are appended. */
const TAB_ORDER = ['Climbing', 'Cycling', 'Skiing', 'Surfing', 'Travel'];

/** Path segments that have migrated detail pages a card can link to. */
const MIGRATED_DETAIL_PATHS = ['/magazine/', '/adventures/'];

/**
 * Resolve a card link for the current environment. Migrated detail pages
 * (/magazine/… articles and /adventures/… adventure pages) get a real
 * destination — dropping a trailing .html and mirroring the /content prefix
 * when previewed locally. Any other target stays '#'.
 * @param {string} rawHref
 * @returns {string}
 */
function resolveArticleHref(rawHref) {
  const href = (rawHref || '').replace(/\.html($|[?#])/, '$1');
  if (!MIGRATED_DETAIL_PATHS.some((seg) => href.includes(seg))) return '#';
  return window.location.pathname.startsWith('/content/') ? `/content${href}` : href;
}

/**
 * Split a record's raw `category` value ("Cycling, Travel") into a trimmed,
 * lower-cased list used for tab filtering.
 * @param {string} raw
 * @returns {string[]}
 */
function splitCategories(raw) {
  return (raw || '')
    .split(',')
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Build a single card <li> from an indexed record. The link points at the
 * record's own path (resolved per environment; unmigrated targets stay '#').
 * The card's categories are stored on a data attribute for tab filtering.
 * @param {{path:string,title:string,description:string,image:string,category:string}} record
 * @returns {HTMLLIElement}
 */
function buildCard(record) {
  const li = document.createElement('li');
  li.dataset.categories = splitCategories(record.category).join(',');
  const href = resolveArticleHref(record.path);

  // Image is not wrapped in its own anchor — the single title link below is
  // "stretched" over the whole card (see CSS), so one focusable link covers
  // the entire card surface (image included) with a single tab stop.
  const imageDiv = document.createElement('div');
  imageDiv.className = 'cards-article-card-image';
  if (record.image) {
    const pic = createOptimizedPicture(record.image, record.title, false, [{ width: '750' }]);
    imageDiv.append(pic);
  }

  const body = document.createElement('div');
  body.className = 'cards-article-card-body';
  const h3 = document.createElement('h3');
  const titleLink = document.createElement('a');
  titleLink.href = href;
  titleLink.textContent = record.title;
  // Only real destinations become a whole-card link; unmigrated ('#') targets
  // render as plain text so the card isn't a dead full-surface click target.
  if (href !== '#') {
    titleLink.className = 'cards-article-card-link';
    li.classList.add('cards-article-card-clickable');
  }
  h3.append(titleLink);
  body.append(h3);
  if (record.description) {
    const p = document.createElement('p');
    p.textContent = record.description;
    body.append(p);
  }

  li.append(imageDiv, body);
  return li;
}

/**
 * Decorate authored cards (fallback when the query index is unavailable, and
 * for any grid not matched by getGridConfig).
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
  // Consolidate each card to a single stretched link. Authored cards carry two
  // anchors to the same page (an image link + a title link); unwrap the image
  // anchor (keep the picture) so only the title link remains, then stretch it
  // over the whole card for a one-tab-stop clickable surface.
  [...ul.children].forEach((li) => {
    const anchors = [...li.querySelectorAll('a[href]')];
    const titleLink = li.querySelector('h3 a[href]') || anchors[anchors.length - 1];
    anchors.forEach((a) => {
      const href = resolveArticleHref(a.getAttribute('href'));
      if (a === titleLink) {
        a.href = href;
      } else {
        // image (or duplicate) anchor → unwrap, preserving its contents
        a.replaceWith(...a.childNodes);
      }
    });
    if (titleLink && titleLink.getAttribute('href') !== '#') {
      titleLink.classList.add('cards-article-card-link');
      li.classList.add('cards-article-card-clickable');
    }
  });
  block.textContent = '';
  block.append(ul);
}

/**
 * Determine how this block should be populated from the query index. The
 * section heading is the signal:
 *   - "Recent Articles"          -> /magazine/  top 4          (no tabs)
 *   - "All Articles"             -> /magazine/  all            (no tabs)
 *   - "Where do you want to go"  -> /adventures/ featured 4    (no tabs)
 *   - "Current Adventures"       -> /adventures/ all           (category tabs)
 * Any other card grid keeps its authored cards.
 * @param {Element} block
 * @returns {{filter:string, limit:number, featured?:boolean, tabs?:boolean}|null}
 */
function getGridConfig(block) {
  const section = block.closest('.section');
  const heading = section && section.querySelector('.default-content-wrapper h2, .default-content-wrapper h3');
  if (!heading) return null;
  const text = heading.textContent;
  if (/recent articles/i.test(text)) return { filter: '/magazine/', limit: 4 };
  if (/all articles/i.test(text)) return { filter: '/magazine/', limit: Infinity };
  if (/where do you want to go/i.test(text)) return { filter: '/adventures/', limit: 4, featured: true };
  if (/current adventures/i.test(text)) return { filter: '/adventures/', limit: Infinity, tabs: true };
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
    button.addEventListener('click', () => { window.location.href = '#'; });
    a.replaceWith(button);
  });
}

/**
 * Show only cards matching the active category ('all' shows everything).
 * @param {HTMLUListElement} ul
 * @param {string} category lower-cased category key, or 'all'
 */
function filterCards(ul, category) {
  [...ul.children].forEach((li) => {
    const cats = (li.dataset.categories || '').split(',').filter(Boolean);
    li.hidden = category !== 'all' && !cats.includes(category);
  });
}

/**
 * Build a category tablist for the adventures grid. Tabs are derived from the
 * categories actually present in the data, ordered by TAB_ORDER, prefixed with
 * an "All" tab. Clicking a tab filters the shared card grid in place.
 * @param {object[]} records
 * @param {HTMLUListElement} ul the card grid to filter
 * @returns {HTMLDivElement} the tablist element
 */
function buildTablist(records, ul) {
  const present = new Set();
  records.forEach((r) => splitCategories(r.category).forEach((c) => present.add(c)));
  const ordered = TAB_ORDER.filter((c) => present.has(c.toLowerCase()));
  [...present].forEach((c) => {
    if (!TAB_ORDER.some((t) => t.toLowerCase() === c)) {
      ordered.push(c.charAt(0).toUpperCase() + c.slice(1));
    }
  });
  const labels = ['All', ...ordered];

  const tablist = document.createElement('div');
  tablist.className = 'cards-article-tabs';
  tablist.setAttribute('role', 'tablist');

  labels.forEach((label, i) => {
    const key = i === 0 ? 'all' : label.toLowerCase();
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'cards-article-tab';
    button.textContent = label;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-selected', String(i === 0));
    button.addEventListener('click', () => {
      tablist.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', 'false'));
      button.setAttribute('aria-selected', 'true');
      filterCards(ul, key);
    });
    tablist.append(button);
  });

  return tablist;
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const config = getGridConfig(block);

  // Grids not matched by a heading keep their authored cards.
  if (!config) {
    decorateAuthored(block);
    decorateSectionCta(block);
    return;
  }

  try {
    const resp = await fetch(QUERY_INDEX);
    if (!resp.ok) throw new Error(`query-index ${resp.status}`);
    const json = await resp.json();

    let records = (json.data || []).filter((r) => r.path && r.path.includes(config.filter));
    if (config.featured) {
      records = records
        .filter((r) => r.featured !== undefined && r.featured !== null && `${r.featured}`.trim() !== '')
        .sort((a, b) => Number(a.featured) - Number(b.featured));
    }
    records = records.slice(0, config.limit);

    if (!records.length) throw new Error('no indexed records');

    const ul = document.createElement('ul');
    records.forEach((record) => ul.append(buildCard(record)));

    block.textContent = '';
    if (config.tabs) {
      block.append(buildTablist(records, ul));
    }
    block.append(ul);

    decorateSectionCta(block);
  } catch (e) {
    // graceful fallback: render authored cards if the index is unavailable
    // eslint-disable-next-line no-console
    console.warn('cards-article: falling back to authored cards —', e.message);
    decorateAuthored(block);
    decorateSectionCta(block);
  }
}
