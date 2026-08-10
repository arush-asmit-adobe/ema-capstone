/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-intro.
 * Base block: hero
 * Source: https://wknd.site/us/en/adventures.html (.teaser.cmp-teaser--hero:not(.cmp-teaser--imagebottom))
 * Generated: 2026-08-08
 *
 * Library convention (hero): 1 column, up to 3 rows.
 *   - Row 1: block name (added by createBlock)
 *   - Row 2: background image (optional) — single cell
 *   - Row 3: title (heading) + subheading/description — single cell
 *
 * This variant is a hero WITHOUT a CTA: only a background image, an H2 title,
 * and a one-line description. This is a SINGLE-COLUMN block, so every row is
 * [oneCell] and row 3's content is collected into one contentCell array pushed
 * as cells.push([contentCell]).
 */
export default function parse(element, { document }) {
  const content = element.querySelector('.cmp-teaser__content') || element;

  // Title — validated against source: <h2 class="cmp-teaser__title">. Fallbacks
  // for heading-level / class variations across pages.
  const title = content.querySelector('.cmp-teaser__title, h1, h2, h3, [class*="title"]:not([class*="pretitle"])');

  // Description — validated: <div class="cmp-teaser__description"><p>…</p></div>.
  const description = content.querySelector('.cmp-teaser__description, [class*="description"], p');

  // Background image — validated: .cmp-teaser__image .cmp-image img.cmp-image__image.
  const bgImage = element.querySelector('.cmp-teaser__image img, .cmp-image img, img');

  // Empty-block guard.
  if (!title && !description && !bgImage) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: background image (single cell). Only add if present.
  if (bgImage) cells.push([bgImage]);

  // Row 3: text content (single cell holding heading + description). No CTA.
  const contentCell = [];
  if (title) contentCell.push(title);
  if (description) contentCell.push(description);
  if (contentCell.length) cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-intro', cells });
  element.replaceWith(block);
}
