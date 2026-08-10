/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-profile.
 * Base block: cards
 * Sources:
 *   - https://wknd.site/us/en/about-us.html (.cmp-experience-fragment--contributor) — contributor/guide grids
 *   - https://wknd.site/us/en/magazine/western-australia.html (.cmp-byline) — single author byline card
 *
 * People/profile cards. Follows the "cards" convention: a 2-column table where
 * the first row is the block name and each subsequent row is one card with an
 * image cell (mandatory) and a text-content cell (name heading + role + socials).
 *
 * Two source shapes are supported:
 *  A) About Us contributor/guide card — section.cmp-experience-fragment--contributor:
 *       .cmp-image img.cmp-image__image          (portrait)
 *       .cmp-title h3                             (name)
 *       .cmp-title--black h5                      (role)
 *       .cmp-buildingblock--btn-list a.cmp-button (x3 social links)
 *     These are flat sibling cards in one grid, so a run of consecutive cards is
 *     collapsed into a single block (see run logic below).
 *  B) Article byline card — .cmp-byline (inside .cmp-experiencefragment--*):
 *       .cmp-byline__image img                    (portrait)
 *       h2.cmp-byline__name                        (name)
 *       p.cmp-byline__occupations                  (role)
 *       sibling .cmp-buildingblock--btn-list a.cmp-button (x3 social links)
 *     A single card → a one-row block.
 */

const CARD_SELECTOR = '.cmp-experience-fragment--contributor';

function isCard(node) {
  return !!node
    && node.nodeType === 1
    && node.matches
    && node.matches(CARD_SELECTOR);
}

/**
 * Build a row from an About Us contributor/guide card.
 */
function buildContributorRow(card, document) {
  const img = card.querySelector('.cmp-image__image, img');

  const body = [];
  const name = card.querySelector('.cmp-title:not(.cmp-title--black) h3, h3');
  const role = card.querySelector('.cmp-title--black h5, h5');

  if (name) {
    const h3 = document.createElement('h3');
    h3.textContent = name.textContent.trim();
    body.push(h3);
  }
  if (role) {
    const h5 = document.createElement('h5');
    h5.textContent = role.textContent.trim();
    body.push(h5);
  }

  const links = Array.from(card.querySelectorAll('.cmp-buildingblock--btn-list a, a.cmp-button'));
  links.forEach((a) => {
    const link = document.createElement('a');
    link.href = a.getAttribute('href') || '#';
    const txt = (a.querySelector('.cmp-button__text') || a).textContent.trim();
    link.textContent = txt || 'Link';
    body.push(link);
  });

  return [img || '', body.length ? body : ''];
}

/**
 * Build a row from an article .cmp-byline card. Social links live in a sibling
 * button-list column, so search the enclosing experience-fragment for them.
 */
function buildBylineRow(byline, document) {
  const img = byline.querySelector('img');

  const body = [];
  const name = byline.querySelector('.cmp-byline__name');
  const role = byline.querySelector('.cmp-byline__occupations');

  if (name) {
    const h3 = document.createElement('h3');
    h3.textContent = name.textContent.trim();
    body.push(h3);
  }
  if (role) {
    const h5 = document.createElement('h5');
    h5.textContent = role.textContent.trim();
    body.push(h5);
  }

  // Social links are outside .cmp-byline — reach up to the fragment/container.
  const scope = byline.closest('.cmp-experiencefragment, .cmp-container') || byline.parentElement;
  const links = Array.from((scope || byline).querySelectorAll('.cmp-buildingblock--btn-list a, a.cmp-button'));
  links.forEach((a) => {
    const link = document.createElement('a');
    link.href = a.getAttribute('href') || '#';
    const txt = (a.querySelector('.cmp-button__text') || a).textContent.trim();
    link.textContent = txt || 'Link';
    body.push(link);
  });

  return [img || '', body.length ? body : ''];
}

export default function parse(element, { document }) {
  // Shape B: article byline card (single card).
  if (element.matches && element.matches('.cmp-byline')) {
    const cells = [buildBylineRow(element, document)];
    const block = WebImporter.Blocks.createBlock(document, { name: 'cards-profile', cells });
    // Replace the whole enclosing fragment so leftover byline wrappers/rules are dropped.
    const target = element.closest('.cmp-experiencefragment') || element;
    target.replaceWith(block);
    return;
  }

  // Shape A: contributor/guide grid. Skip cards already consumed by a run head.
  if (isCard(element.previousElementSibling)) {
    element.remove();
    return;
  }

  const run = [element];
  let next = element.nextElementSibling;
  while (next) {
    if (isCard(next)) {
      run.push(next);
      next = next.nextElementSibling;
    } else if (!next.textContent.trim()) {
      next = next.nextElementSibling; // skip empty spacer nodes within the run
    } else {
      break; // a real non-card element (e.g. the "WKND Guides" title) ends the run
    }
  }

  const cells = run.map((card) => buildContributorRow(card, document));

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-profile', cells });
  element.replaceWith(block);

  run.slice(1).forEach((card) => card.remove());
}
