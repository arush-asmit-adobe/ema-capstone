import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Author-editable data sheets feeding this block, keyed by the section heading.
 * Each is a spreadsheet in the content source: one row per person. Authors add
 * or remove a row (no code, no page) and the matching section updates.
 * "Our Contributors" -> contributors.json, "WKND Guides" -> guides.json.
 */
const SHEETS = [
  { match: /our contributors/i, path: '/us/en/data/contributors.json' },
  { match: /wknd guides/i, path: '/us/en/data/guides.json' },
];

// Inline SVG glyphs for the supported social platforms (currentColor-driven).
const SOCIAL_ICONS = {
  facebook: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H16.7V3.6c-.3 0-1.3-.1-2.45-.1-2.4 0-4.05 1.47-4.05 4.17v2.33H7.5V13h2.7v8h3.3z"/></svg>',
  twitter: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M22 5.9c-.7.3-1.5.55-2.3.65.85-.5 1.5-1.3 1.8-2.25-.8.47-1.66.8-2.58.99A4.07 4.07 0 0 0 16 4c-2.27 0-4.1 1.85-4.1 4.13 0 .32.03.64.1.94-3.4-.17-6.42-1.8-8.44-4.3-.35.62-.56 1.34-.56 2.1 0 1.44.73 2.7 1.83 3.44-.68-.02-1.32-.21-1.87-.52v.05c0 2 1.42 3.67 3.3 4.05-.35.1-.72.15-1.1.15-.27 0-.53-.03-.78-.08.53 1.64 2.05 2.84 3.86 2.87A8.19 8.19 0 0 1 2 18.57 11.55 11.55 0 0 0 8.29 20.4c7.55 0 11.68-6.27 11.68-11.7v-.53c.8-.58 1.5-1.3 2.03-2.12z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 4.62c2.4 0 2.69.01 3.64.05.88.04 1.35.19 1.67.31.42.16.72.36 1.03.67.31.31.51.61.67 1.03.12.32.27.79.31 1.67.04.95.05 1.24.05 3.64s-.01 2.69-.05 3.64c-.04.88-.19 1.35-.31 1.67-.16.42-.36.72-.67 1.03-.31.31-.61.51-1.03.67-.32.12-.79.27-1.67.31-.95.04-1.24.05-3.64.05s-2.69-.01-3.64-.05c-.88-.04-1.35-.19-1.67-.31a2.78 2.78 0 0 1-1.03-.67 2.78 2.78 0 0 1-.67-1.03c-.12-.32-.27-.79-.31-1.67-.04-.95-.05-1.24-.05-3.64s.01-2.69.05-3.64c.04-.88.19-1.35.31-1.67.16-.42.36-.72.67-1.03.31-.31.61-.51 1.03-.67.32-.12.79-.27 1.67-.31.95-.04 1.24-.05 3.64-.05M12 3c-2.44 0-2.75.01-3.71.05-.96.05-1.61.2-2.18.42-.59.23-1.1.54-1.6 1.04-.5.5-.81 1.01-1.04 1.6-.22.57-.37 1.22-.42 2.18C3.01 9.25 3 9.56 3 12s.01 2.75.05 3.71c.05.96.2 1.61.42 2.18.23.59.54 1.1 1.04 1.6.5.5 1.01.81 1.6 1.04.57.22 1.22.37 2.18.42.96.04 1.27.05 3.71.05s2.75-.01 3.71-.05c.96-.05 1.61-.2 2.18-.42a4.4 4.4 0 0 0 1.6-1.04c.5-.5.81-1.01 1.04-1.6.22-.57.37-1.22.42-2.18.04-.96.05-1.27.05-3.71s-.01-2.75-.05-3.71c-.05-.96-.2-1.61-.42-2.18a4.4 4.4 0 0 0-1.04-1.6 4.4 4.4 0 0 0-1.6-1.04c-.57-.22-1.22-.37-2.18-.42C14.75 3.01 14.44 3 12 3zm0 4.38A4.62 4.62 0 1 0 16.62 12 4.62 4.62 0 0 0 12 7.38zm0 7.62A3 3 0 1 1 15 12a3 3 0 0 1-3 3zm4.8-8.88a1.08 1.08 0 1 0 1.08 1.08 1.08 1.08 0 0 0-1.08-1.08z"/></svg>',
};

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
 * Pick the data sheet for this block based on the heading that precedes it.
 * About Us has two profile grids in the SAME section ("Our Contributors" and
 * "WKND Guides"), rendered as sibling wrappers with a heading wrapper before
 * each. So we walk backwards from this block's wrapper to the nearest previous
 * sibling that contains a heading, rather than taking the section's first
 * heading (which would match both blocks to "Our Contributors").
 * @param {Element} block
 * @returns {string|null} sheet path, or null if no heading matches
 */
function sheetForBlock(block) {
  const wrapper = block.closest('.cards-profile-wrapper') || block.parentElement;
  let node = wrapper ? wrapper.previousElementSibling : null;
  // Walk backwards through preceding siblings. A single wrapper can hold more
  // than one heading (e.g. "About Us" + "Our Contributors"), and we must not
  // stop at the wrong one — so test EVERY heading (nearest first) against the
  // sheet patterns and return the first that matches.
  while (node) {
    const headings = node.matches('h1,h2,h3,h4,h5,h6')
      ? [node]
      : [...node.querySelectorAll('h1,h2,h3,h4,h5,h6')];
    // nearest heading to the block first
    for (let i = headings.length - 1; i >= 0; i -= 1) {
      const text = headings[i].textContent || '';
      const entry = SHEETS.find((s) => s.match.test(text));
      if (entry) return entry.path;
    }
    node = node.previousElementSibling;
  }
  return null;
}

/**
 * Determine which social platform a link points at, from its text or href.
 * @param {HTMLAnchorElement} a
 * @returns {string} one of 'facebook' | 'twitter' | 'instagram' | ''
 */
function detectPlatform(a) {
  const hay = `${a.textContent} ${a.getAttribute('href') || ''}`.toLowerCase();
  if (hay.includes('facebook')) return 'facebook';
  if (hay.includes('twitter')) return 'twitter';
  if (hay.includes('insta')) return 'instagram';
  return '';
}

/**
 * Turn each card's social <a>s into a compact icon strip beneath name + role.
 * @param {HTMLUListElement} ul
 */
function decorateSocial(ul) {
  ul.querySelectorAll('.cards-profile-card-body').forEach((body) => {
    const links = [...body.querySelectorAll('a')];
    if (links.length > 1) {
      const social = document.createElement('p');
      social.className = 'cards-profile-social';
      links.forEach((a) => {
        const platform = detectPlatform(a);
        a.classList.add('cards-profile-social-link');
        const label = a.textContent.trim() || platform;
        if (label) a.setAttribute('aria-label', label);
        if (platform && SOCIAL_ICONS[platform]) {
          a.innerHTML = SOCIAL_ICONS[platform];
        }
        social.append(a);
      });
      body.append(social);

      // Drop the now-empty paragraph wrappers the links were lifted out of.
      [...body.children].forEach((child) => {
        if (child !== social && !child.textContent.trim() && !child.querySelector('svg, img, a')) {
          child.remove();
        }
      });
    }
  });
}

/**
 * Build one profile card <li> from a sheet record. A record has name, role,
 * image, and facebook/twitter/instagram link fields.
 * @param {object} record
 * @returns {HTMLLIElement}
 */
function buildCard(record) {
  const li = document.createElement('li');

  const imageDiv = document.createElement('div');
  imageDiv.className = 'cards-profile-card-image';
  if (record.image) {
    imageDiv.append(createOptimizedPicture(record.image, record.name || '', false, [{ width: '400' }]));
  }

  const body = document.createElement('div');
  body.className = 'cards-profile-card-body';
  if (record.name) {
    const h3 = document.createElement('h3');
    h3.textContent = record.name;
    body.append(h3);
  }
  if (record.role) {
    const h5 = document.createElement('h5');
    h5.textContent = record.role;
    body.append(h5);
  }
  // one <p><a> per platform present; decorateSocial() groups them into the strip
  [['facebook', record.facebook], ['twitter', record.twitter], ['instagram', record.instagram]]
    .forEach(([platform, href]) => {
      if (!href) return;
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = platform.charAt(0).toUpperCase() + platform.slice(1);
      p.append(a);
      body.append(p);
    });

  li.append(imageDiv, body);
  return li;
}

/**
 * Render the block from the authored block table (fallback when the sheet is
 * unavailable or the section heading matches no sheet, so existing authored
 * content still works).
 * @param {Element} block
 */
function decorateAuthored(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-profile-card-image';
      else div.className = 'cards-profile-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
  decorateSocial(ul);
}

/**
 * loads and decorates the block
 *
 * Each profile grid renders dynamically from an author-editable data sheet
 * chosen by its section heading ("Our Contributors" -> contributors.json,
 * "WKND Guides" -> guides.json): one row per person with name, role, image and
 * facebook/twitter/instagram links. Authors add or remove a row in the sheet
 * and that section updates — no code, no page. Blocks whose heading matches no
 * sheet, or when a sheet is unavailable, fall back to authored block-table
 * content.
 *
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const sheet = sheetForBlock(block);
  if (!sheet) {
    decorateAuthored(block);
    return;
  }

  try {
    const resp = await fetch(resolveSheet(sheet), { cache: 'no-cache' });
    if (!resp.ok) throw new Error(`profile sheet ${resp.status}`);
    const json = await resp.json();
    const records = json.data || [];
    if (!records.length) throw new Error('no profile records');

    const ul = document.createElement('ul');
    records.forEach((record) => ul.append(buildCard(record)));

    block.textContent = '';
    block.append(ul);
    decorateSocial(ul);
  } catch (e) {
    // graceful fallback: render authored cards if the sheet is unavailable
    // eslint-disable-next-line no-console
    console.warn('cards-profile: falling back to authored cards —', e.message);
    decorateAuthored(block);
  }
}
