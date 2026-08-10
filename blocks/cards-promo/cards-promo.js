import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Author-editable data sheet feeding this block. Authors add/remove a row in
 * the sheet (no code, no page) and the promo grid updates. Path is resolved
 * per environment (local preview serves content under a /content prefix).
 */
const PROMOS_SHEET = '/us/en/data/promos.json';

/**
 * Resolve a data-sheet path for the current environment. The local preview
 * serves content under a /content prefix; production serves it at the root.
 * @param {string} path
 * @returns {string}
 */
function resolveSheet(path) {
  return window.location.pathname.startsWith('/content/') ? `/content${path}` : path;
}

/**
 * Turn a promo row's CTA into a button that navigates to its link.
 * @param {HTMLElement} scope
 */
function decorateCtas(scope) {
  scope.querySelectorAll('.cards-promo-card-body a').forEach((a) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'cards-promo-cta';
    button.textContent = a.textContent;
    const href = a.getAttribute('href') || '#';
    button.addEventListener('click', () => { window.location.href = href; });
    a.replaceWith(button);
  });
}

/**
 * Build one promo card <li> from a sheet record.
 * @param {{title:string,description:string,cta:string,image:string,link:string}} record
 * @returns {HTMLLIElement}
 */
function buildCard(record) {
  const li = document.createElement('li');

  const imageDiv = document.createElement('div');
  imageDiv.className = 'cards-promo-card-image';
  if (record.image) {
    imageDiv.append(createOptimizedPicture(record.image, record.title || '', false, [{ width: '750' }]));
  }

  const body = document.createElement('div');
  body.className = 'cards-promo-card-body';
  if (record.title) {
    const h2 = document.createElement('h2');
    h2.textContent = record.title;
    body.append(h2);
  }
  if (record.description) {
    const p = document.createElement('p');
    p.textContent = record.description;
    body.append(p);
  }
  if (record.cta) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = record.link || '#';
    a.textContent = record.cta;
    p.append(a);
    body.append(p);
  }

  li.append(imageDiv, body);
  return li;
}

/**
 * Render the block from the authored block table (fallback when the sheet is
 * unavailable, so existing authored content still works).
 * @param {Element} block
 */
function decorateAuthored(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-promo-card-image';
      else div.className = 'cards-promo-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
  decorateCtas(ul);
}

/**
 * loads and decorates the block
 *
 * The promo grid renders dynamically from an author-editable data sheet
 * (/us/en/data/promos.json): one row per promo, with title, description, cta,
 * image, and link. Authors add or remove a row in the sheet and the grid
 * updates — no code and no page needed. If the sheet is unavailable, falls
 * back to any authored block-table content.
 *
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  try {
    const resp = await fetch(resolveSheet(PROMOS_SHEET), { cache: 'no-cache' });
    if (!resp.ok) throw new Error(`promos sheet ${resp.status}`);
    const json = await resp.json();
    const records = json.data || [];
    if (!records.length) throw new Error('no promo records');

    const ul = document.createElement('ul');
    records.forEach((record) => ul.append(buildCard(record)));

    block.textContent = '';
    block.append(ul);
    decorateCtas(ul);
  } catch (e) {
    // graceful fallback: render authored cards if the sheet is unavailable
    // eslint-disable-next-line no-console
    console.warn('cards-promo: falling back to authored cards —', e.message);
    decorateAuthored(block);
  }
}
