/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-featured.
 * Base block: columns
 * Source: https://wknd.site/us/en.html (.teaser.cmp-teaser--featured)
 * Generated: 2026-08-05
 *
 * Library convention (columns): multiple columns/rows; row 1 is the block name
 * (added by createBlock). Column count is driven by the natural visual grouping
 * of the source. This "featured" teaser groups content into two columns:
 *   - cell 1: text content (pretitle, title, description, CTA)
 *   - cell 2: featured image
 */
export default function parse(element, { document }) {
  const content = element.querySelector('.cmp-teaser__content') || element;
  const pretitle = content.querySelector('.cmp-teaser__pretitle, [class*="pretitle"]');
  // Exclude pretitle: `[class*="title"]` alone would match `cmp-teaser__pretitle`.
  const title = content.querySelector('.cmp-teaser__title, h1, h2, h3, [class*="title"]:not([class*="pretitle"])');
  const description = content.querySelector('.cmp-teaser__description, [class*="description"], p:not([class*="pretitle"])');
  const ctaLinks = Array.from(
    content.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a, a[class*="action"]'),
  );
  const image = element.querySelector('.cmp-teaser__image img, .cmp-image img, img');

  // Empty-block guard: no meaningful content to place in columns.
  if (!title && !description && !image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const textCell = [];
  if (pretitle) textCell.push(pretitle);
  if (title) textCell.push(title);
  if (description) textCell.push(description);
  textCell.push(...ctaLinks);

  // 2-column layout: text content beside the featured image.
  // Pad missing cells with '' so the row keeps a consistent column count.
  const cells = [
    [textCell.length ? textCell : '', image || ''],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-featured', cells });
  element.replaceWith(block);
}
