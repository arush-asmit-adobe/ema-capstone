/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-banner.
 * Base block: hero
 * Source: https://wknd.site/us/en.html (.teaser.cmp-teaser--hero.cmp-teaser--imagebottom)
 * Generated: 2026-08-05
 *
 * Library convention (hero): 1 column, 3 rows.
 *   - Row 1: block name (added by createBlock)
 *   - Row 2: background image (optional) — single cell
 *   - Row 3: title (heading), subheading, CTA (optional) — single cell
 *
 * This is a SINGLE-COLUMN block: every row is [oneCell]. Content in row 3 is
 * collected into one contentCell array pushed as cells.push([contentCell]).
 */
export default function parse(element, { document }) {
  const content = element.querySelector('.cmp-teaser__content') || element;
  const title = content.querySelector('.cmp-teaser__title, h1, h2, h3, [class*="title"]:not([class*="pretitle"])');
  const description = content.querySelector('.cmp-teaser__description, [class*="description"], p');
  const ctaLinks = Array.from(
    content.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a, a[class*="action"]'),
  );
  const bgImage = element.querySelector('.cmp-teaser__image img, .cmp-image img, img');

  // Empty-block guard.
  if (!title && !description && !bgImage && !ctaLinks.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: background image (single cell). Only add if present.
  if (bgImage) cells.push([bgImage]);

  // Row 3: text content (single cell holding heading, subheading, CTA).
  const contentCell = [];
  if (title) contentCell.push(title);
  if (description) contentCell.push(description);
  contentCell.push(...ctaLinks);
  if (contentCell.length) cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
