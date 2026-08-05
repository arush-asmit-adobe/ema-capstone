/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-article.
 * Base block: cards
 * Source: https://wknd.site/us/en.html (.cmp-image-list)
 * Generated: 2026-08-05
 *
 * Library convention (cards, with images): 2 columns, one row per card.
 *   - cell 1: image (mandatory)
 *   - cell 2: text content — title (heading), description, optional CTA
 * Images are present on every card here, so the "no images" (1-column) variant
 * does not apply.
 *
 * NOTE: the .cmp-image-list selector matches multiple instances on the page
 * (Recent Articles + Adventures grid); this parser runs per matched element.
 */
export default function parse(element, { document }) {
  // Each card is a list item; fall back to article wrappers if the markup varies.
  let items = Array.from(element.querySelectorAll('.cmp-image-list__item'));
  if (!items.length) {
    items = Array.from(element.querySelectorAll(':scope > li, .cmp-image-list__item-content'));
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

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-article', cells });
  element.replaceWith(block);
}
