/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-index.
 * Base block: cards
 * Source: https://wknd.site/us/en.html (.cmp-image-list)
 *
 * Emits a `cards-index` block. Following the cards library convention: a
 * 2-column table, one row per card — cell 1 is the image (mandatory), cell 2
 * is the text content (title heading + description). At runtime the block
 * ignores these authored cards for the magazine/home/adventures grids and
 * builds cards from /query-index.json instead (see
 * blocks/cards-index/cards-index.js); the authored cards remain as a graceful
 * fallback if the index is unavailable.
 *
 * NOTE: the .cmp-image-list selector matches multiple instances on the page
 * (Recent Articles + Adventures grid); this parser runs per matched element.
 */
export default function parse(element, { document }) {
  // When mapped to a tabbed listing (.cmp-tabs), the active ("All") panel holds
  // the full, de-duplicated set of cards — the category panels only repeat a
  // subset. Scope to the active panel so those repeats don't create duplicates.
  // For non-tabbed grids (homepage/magazine .cmp-image-list) there is no active
  // panel, so the scope stays the element itself.
  const activePanel = element.querySelector('.cmp-tabs__tabpanel--active');
  const scope = activePanel || element;

  // Each card is a list item; fall back to article wrappers if the markup varies.
  let items = Array.from(scope.querySelectorAll('.cmp-image-list__item'));
  if (!items.length) {
    items = Array.from(scope.querySelectorAll(':scope > li, .cmp-image-list__item-content'));
  }

  const cells = [];

  items.forEach((item) => {
    const image = item.querySelector('.cmp-image-list__item-image img, .cmp-image img, img');

    // Title is an anchor wrapping a span; preserve heading semantics + the link.
    const titleLink = item.querySelector('.cmp-image-list__item-title-link, a[class*="title"]');
    const titleText = item.querySelector('.cmp-image-list__item-title, [class*="item-title"]:not(a)');
    const description = item.querySelector('.cmp-image-list__item-description, [class*="description"]');

    const textCell = [];
    if (titleLink) {
      // Rebuild as a heading that keeps the link (and its href) intact.
      const heading = document.createElement('h3');
      const link = document.createElement('a');
      link.href = titleLink.getAttribute('href') || '#';
      link.textContent = (titleText || titleLink).textContent.trim();
      heading.append(link);
      textCell.push(heading);
    } else if (titleText) {
      const heading = document.createElement('h3');
      heading.textContent = titleText.textContent.trim();
      textCell.push(heading);
    }
    if (description) textCell.push(description);

    // Skip cards with no meaningful content.
    if (!image && !textCell.length) return;

    // 2-column row: [image, textContent]. Pad any missing cell to keep rows even.
    cells.push([image || '', textCell.length ? textCell : '']);
  });

  // Empty-block guard.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-index', cells });
  element.replaceWith(block);
}
