/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-profile.
 * Base block: cards
 * Source: https://wknd.site/us/en/about-us.html (.cmp-experience-fragment--contributor)
 * Generated: 2026-08-09
 *
 * People/team cards. Follows the "cards" convention: a 2-column table where the
 * first row is the block name and each subsequent row is one card with an image
 * cell (mandatory) and a text-content cell (name heading + role + social links).
 *
 * Each source card is a flat sibling <section> in a single grid; the
 * "Our Contributors" (4 cards) and "WKND Guides" (3 cards) groups are separated
 * only by an intervening title/text column. The block selector matches EVERY
 * card individually, so the import script calls this parser once per card. To
 * emit ONE cards-profile block per run of consecutive cards, we:
 *   - detect the first card of a run (no immediately-preceding sibling card),
 *   - gather that card plus all following consecutive sibling cards,
 *   - build a single block, then remove the trailing cards so later parser
 *     invocations for them become no-ops.
 * A card whose previous sibling is also a card is skipped (already consumed).
 *
 * Source card structure (validated against source.html):
 *   section.cmp-experience-fragment--contributor
 *     .cmp-image img.cmp-image__image          (portrait)
 *     .cmp-title h3                             (name)
 *     .cmp-title--black h5                      (role, pipe-separated)
 *     .cmp-buildingblock--btn-list a.cmp-button (x3 social links w/ icon spans)
 */

const CARD_SELECTOR = '.cmp-experience-fragment--contributor';

function isCard(node) {
  return !!node
    && node.nodeType === 1
    && node.matches
    && node.matches(CARD_SELECTOR);
}

function buildRow(card, document) {
  // Cell 1: portrait image (mandatory).
  const img = card.querySelector('.cmp-image__image, img');

  // Cell 2: text content — name (heading), role, and social links.
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

  // Social links: keep the anchors (icon label preserved) with their hrefs.
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

export default function parse(element, { document }) {
  // Skip cards that are part of a run already handled by an earlier card.
  if (isCard(element.previousElementSibling)) {
    element.remove();
    return;
  }

  // Gather this card + all consecutive following sibling cards.
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

  const cells = run.map((card) => buildRow(card, document));

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-profile', cells });
  element.replaceWith(block);

  // Remove the remaining cards in this run so their later parser calls no-op.
  run.slice(1).forEach((card) => card.remove());
}
