const QUERY_INDEX = '/query-index.json';

/**
 * Normalise a path for comparison: strip a leading /content prefix (local
 * preview) and any .html suffix / trailing slash.
 * @param {string} p
 * @returns {string}
 */
function normalise(p) {
  return (p || '')
    .replace(/^\/content/, '')
    .replace(/\.html$/, '')
    .replace(/\/$/, '');
}

/**
 * Resolve an index path to the current environment (adds the /content prefix
 * when previewed locally so links resolve).
 * @param {string} path
 * @returns {string}
 */
function resolveHref(path) {
  return window.location.pathname.startsWith('/content/') ? `/content${path}` : path;
}

/**
 * loads and decorates the "Share This Story" sidebar. The list of other
 * magazine articles is fetched from the query index at runtime, so it stays in
 * sync as articles are added — it never lists the article currently being read.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const heading = document.createElement('h5');
  heading.className = 'share-story-heading';
  heading.textContent = 'Share This Story';

  const list = document.createElement('ul');
  list.className = 'share-story-list';

  block.textContent = '';
  block.append(heading, list);

  try {
    const resp = await fetch(QUERY_INDEX);
    if (!resp.ok) throw new Error(`query-index ${resp.status}`);
    const json = await resp.json();
    const here = normalise(window.location.pathname);

    const articles = (json.data || [])
      .filter((a) => a.path && a.path.includes('/magazine/'))
      // don't list the article currently being read
      .filter((a) => normalise(a.path) !== here);

    if (!articles.length) {
      block.remove();
      return;
    }

    articles.forEach((article) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'share-story-item';
      a.href = resolveHref(article.path);

      const title = document.createElement('span');
      title.className = 'share-story-item-title';
      title.textContent = article.title || '';
      a.append(title);

      if (article.date) {
        const date = document.createElement('span');
        date.className = 'share-story-item-date';
        date.textContent = article.date;
        a.append(date);
      }

      li.append(a);
      list.append(li);
    });
  } catch (e) {
    // if the index is unavailable there is nothing to relate to — hide the block
    // eslint-disable-next-line no-console
    console.warn('share-story: could not load related articles —', e.message);
    block.remove();
  }
}
