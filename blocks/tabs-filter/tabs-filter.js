import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Tabs Filter — dynamic card grid with client-side category tabs.
 *
 * Authoring contract (matches the reference doc): a 2-data-row block.
 *   | Tabs Filter                              |
 *   | All, Climbing, Cycling, Skiing, Surfing, Travel |
 *   | /us/en/adventures/query-index.json       |
 * Row 1 = comma-separated tab labels (the first, usually "All", shows every
 * card). Row 2 = a path to a query-index.json. Each index row becomes a card
 * linking to its own detail page; clicking a tab filters the already-rendered
 * cards by their `category` field, with no re-fetch. Authors add/remove
 * adventures by editing the sheet behind the index — never this document.
 */

// One fetch per unique index URL per page load, shared across block instances.
const indexCache = new Map();

/**
 * Resolve the authored index path to a fetchable URL.
 * @param {string} path
 * @returns {string}
 */
function resolveIndexUrl(path) {
  if (/^https?:\/\//i.test(path)) return path;
  return new URL(path, window.location.href).href;
}

/**
 * Resolve an entry's detail-page `path` for the current environment.
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
 * eagerly; a single attempt would then leave the grid empty until the next full
 * reload. So retry a few times with backoff, revalidating against the server,
 * before giving up. Returns the parsed `data` array (empty only if every
 * attempt fails).
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
  console.warn(`tabs-filter: could not load index ${url} —`, lastErr && lastErr.message);
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

/** Split a raw "Cycling, Travel" value into a trimmed list. */
function splitList(raw) {
  return (raw || '').split(',').map((c) => c.trim()).filter(Boolean);
}

/**
 * Read the two authored rows: [labels[], indexPath]. Falls back gracefully if
 * only the path is present (no tab row) — labels become empty.
 * @param {Element} block
 * @returns {{labels:string[], path:string}}
 */
function readConfig(block) {
  const rows = [...block.children];
  const cellText = (row) => (row ? (row.textContent || '').trim() : '');
  const pathFrom = (row) => {
    if (!row) return '';
    const link = row.querySelector('a[href]');
    return (link ? link.getAttribute('href') : row.textContent || '').trim();
  };
  // Identify the path row (contains a link or a value that looks like a path);
  // the other row holds the labels.
  let labels = [];
  let path = '';
  if (rows.length >= 2) {
    labels = splitList(cellText(rows[0]));
    path = pathFrom(rows[1]);
  } else if (rows.length === 1) {
    path = pathFrom(rows[0]);
  }
  return { labels, path };
}

/**
 * Build one card <li> linking to its own detail page; stores the entry's
 * categories on a data attribute for filtering.
 * @param {object} entry
 * @returns {HTMLLIElement}
 */
function buildCard(entry) {
  const li = document.createElement('li');
  const cats = splitList(entry.category || entry.categories || entry.tags || '');
  if (cats.length) li.dataset.categories = cats.map((c) => c.toLowerCase()).join(',');
  const href = resolveDetailHref(entry.path);

  const imageWrap = document.createElement('div');
  imageWrap.className = 'tabs-filter-card-image';
  if (entry.image) {
    imageWrap.append(createOptimizedPicture(entry.image, entry.title || '', false, [{ width: '750' }]));
  }

  const body = document.createElement('div');
  body.className = 'tabs-filter-card-body';
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
    link.className = 'tabs-filter-card-link';
    link.href = href;
    if (entry.title) link.setAttribute('aria-label', entry.title);
    link.append(imageWrap, body);
    li.classList.add('tabs-filter-card-clickable');
    li.append(link);
  } else {
    li.append(imageWrap, body);
  }
  return li;
}

/**
 * Show only cards matching the active category ('all' shows everything).
 * @param {HTMLUListElement} list
 * @param {string} category lower-cased category key, or 'all'
 */
function applyFilter(list, category) {
  [...list.children].forEach((li) => {
    const cats = (li.dataset.categories || '').split(',').filter(Boolean);
    li.hidden = category !== 'all' && !cats.includes(category);
  });
}

/**
 * Build the tablist from authored labels and wire click-to-filter (no re-fetch).
 * The first label is treated as the "show all" tab.
 * @param {string[]} labels
 * @param {HTMLUListElement} list
 * @returns {HTMLDivElement}
 */
function buildTablist(labels, list) {
  const tabs = document.createElement('div');
  tabs.className = 'tabs-filter-tabs';
  tabs.setAttribute('role', 'tablist');
  labels.forEach((label, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tabs-filter-tab';
    btn.textContent = label;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', String(i === 0));
    btn.addEventListener('click', () => {
      tabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', 'false'));
      btn.setAttribute('aria-selected', 'true');
      applyFilter(list, i === 0 ? 'all' : label.toLowerCase());
    });
    tabs.append(btn);
  });
  return tabs;
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const { labels, path } = readConfig(block);
  // Clear the authored table content; render dynamically below.
  block.textContent = '';
  if (!path) return;

  const entries = await loadIndex(resolveIndexUrl(path));
  if (!entries.length) return; // graceful: leave empty (warning already logged)

  const ul = document.createElement('ul');
  entries.forEach((entry) => ul.append(buildCard(entry)));

  if (labels.length >= 2) block.append(buildTablist(labels, ul));
  block.append(ul);
}
