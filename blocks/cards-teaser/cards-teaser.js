import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Cards Teaser — dynamic article-teaser grid.
 *
 * Authoring contract (matches the reference doc): a 2-row block whose single
 * data cell holds ONLY a path to a query-index.json, e.g.
 *   | Cards Teaser                       |
 *   | /us/en/magazine/query-index.json   |
 * Every row of the fetched index becomes a card (image + title + teaser text)
 * linking to its own detail page via the entry's `path`. Authors add/remove
 * articles by editing the sheet behind the index — never this document.
 */

// One fetch per unique index URL per page load, shared across block instances.
const indexCache = new Map();

/**
 * Read the authored index path from the block's single data cell (plain text
 * or an authored link).
 * @param {Element} block
 * @returns {string}
 */
function readIndexPath(block) {
  const link = block.querySelector('a[href]');
  if (link) return (link.getAttribute('href') || '').trim();
  return (block.textContent || '').trim();
}

/**
 * Resolve the authored index path to a fetchable URL. Full URLs pass through;
 * root/relative paths resolve against the current location.
 * @param {string} path
 * @returns {string}
 */
function resolveIndexUrl(path) {
  if (/^https?:\/\//i.test(path)) return path;
  return new URL(path, window.location.href).href;
}

/**
 * Resolve an entry's detail-page `path` for the current environment: mirror the
 * `/content` prefix used by the local preview (production serves clean paths at
 * the root) and drop a trailing `.html`.
 * @param {string} rawPath
 * @returns {string}
 */
function resolveDetailHref(rawPath) {
  const clean = (rawPath || '').trim().replace(/\.html($|[?#])/, '$1');
  if (!clean) return '';
  if (/^https?:\/\//i.test(clean) || clean.startsWith('/content/')) return clean;
  if (!clean.startsWith('/')) return clean;
  return window.location.pathname.startsWith('/content/') ? `/content${clean}` : clean;
}

/** Resolve after `ms` milliseconds. */
function delay(ms) {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}

/**
 * Fetch + parse an index with a few retries. A freshly (re)published sheet can
 * briefly return a CDN-edge 404 (negative cache) right when the block decorates
 * eagerly; a single attempt would then leave the grid empty until a full
 * reload. So retry a few times with backoff before giving up. Returns the
 * parsed `data` array (empty only if every attempt fails).
 * @param {string} url
 * @param {number} attempts
 * @returns {Promise<object[]>}
 */
async function fetchIndex(url, attempts = 4) {
  let lastErr;
  for (let i = 0; i < attempts; i += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const resp = await fetch(url, { cache: 'no-cache' });
      if (!resp.ok) throw new Error(`status ${resp.status}`);
      // eslint-disable-next-line no-await-in-loop
      const json = await resp.json();
      return Array.isArray(json && json.data) ? json.data : [];
    } catch (e) {
      lastErr = e;
      // eslint-disable-next-line no-await-in-loop
      if (i < attempts - 1) await delay(400 * (i + 1));
    }
  }
  // eslint-disable-next-line no-console
  console.warn(`cards-teaser: could not load index ${url} —`, lastErr && lastErr.message);
  return [];
}

/**
 * Load an index once per URL. Only a SUCCESSFUL (non-empty) result is cached,
 * so a transient failure never sticks for the rest of the page's life.
 * @param {string} url
 * @returns {Promise<object[]>}
 */
function loadIndex(url) {
  if (indexCache.has(url)) return indexCache.get(url);
  const promise = fetchIndex(url).then((data) => {
    if (!data.length) indexCache.delete(url); // don't cache an empty/failed load
    return data;
  });
  indexCache.set(url, promise);
  return promise;
}

/**
 * Build a single teaser card <li> linking to its own detail page.
 * @param {{path:string,title:string,image:string,description:string}} entry
 * @returns {HTMLLIElement}
 */
function buildCard(entry) {
  const li = document.createElement('li');
  const href = resolveDetailHref(entry.path);

  const imageWrap = document.createElement('div');
  imageWrap.className = 'cards-teaser-card-image';
  if (entry.image) {
    // eager=false -> loading="lazy" on the generated <img>
    imageWrap.append(createOptimizedPicture(entry.image, entry.title || '', false, [{ width: '750' }]));
  }

  const body = document.createElement('div');
  body.className = 'cards-teaser-card-body';
  const h3 = document.createElement('h3');
  h3.textContent = entry.title || '';
  body.append(h3);
  if (entry.description) {
    const p = document.createElement('p');
    p.textContent = entry.description;
    body.append(p);
  }

  if (href) {
    const link = document.createElement('a');
    link.className = 'cards-teaser-card-link';
    link.href = href;
    if (entry.title) link.setAttribute('aria-label', entry.title);
    link.append(imageWrap, body);
    li.classList.add('cards-teaser-card-clickable');
    li.append(link);
  } else {
    li.append(imageWrap, body);
  }
  return li;
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const path = readIndexPath(block);
  // Clear the authored table content; render dynamically below.
  block.textContent = '';
  if (!path) return;

  const entries = await loadIndex(resolveIndexUrl(path));
  if (!entries.length) return; // graceful: leave empty (warning already logged)

  const ul = document.createElement('ul');
  entries.forEach((entry) => ul.append(buildCard(entry)));
  block.append(ul);
}
