/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-hero.
 * Base block: carousel
 * Source: https://wknd.site/us/en.html (.carousel.cmp-carousel--hero)
 * Generated: 2026-08-05
 *
 * Library convention (carousel): 2 columns, multiple rows.
 *  - Row 1: block name (+ optional variant) — added by createBlock
 *  - Each subsequent row = one slide:
 *      cell 1: image (mandatory)
 *      cell 2: text content (optional) — title (heading), description, CTA
 */
export default function parse(element, { document }) {
  // Each slide is a carousel item; fall back to teaser panels if item wrapper varies.
  let slides = Array.from(element.querySelectorAll('.cmp-carousel__item'));
  if (!slides.length) {
    slides = Array.from(element.querySelectorAll('.teaser, [class*="teaser"]'));
  }

  const cells = [];

  slides.forEach((slide) => {
    // Image cell (mandatory per convention)
    const image = slide.querySelector('.cmp-teaser__image img, .cmp-image img, img');

    // Text content cell (optional)
    const content = slide.querySelector('.cmp-teaser__content') || slide;
    const title = content.querySelector('h1, h2, h3, .cmp-teaser__title, [class*="title"]');
    const description = content.querySelector('.cmp-teaser__description, [class*="description"], p');
    const ctaLinks = Array.from(
      content.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a, a[class*="action"]'),
    );

    // Skip empty slides (no image and no text) — nothing to render.
    if (!image && !title && !description && !ctaLinks.length) return;

    const contentCell = [];
    if (title) contentCell.push(title);
    if (description) contentCell.push(description);
    contentCell.push(...ctaLinks);

    // 2-column row: [image, textContent]. Pad missing cells so the table stays even.
    cells.push([image || '', contentCell.length ? contentCell : '']);
  });

  // Empty-block guard: if no slides produced content, unwrap rather than emit an empty block.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
