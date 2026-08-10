/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-mini.
 * Base block: carousel
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html (.carousel.cmp-carousel--mini)
 * Generated: 2026-08-10
 *
 * Library convention (carousel): 2 columns, multiple rows; row 1 = block name
 * (added by createBlock), each subsequent row = one slide (image cell + optional
 * text cell). This is the LIGHT, image-ONLY masthead variant, so every slide has
 * exactly one cell: the slide image. No title/description/CTA is emitted, which
 * makes each row single-column (matches the carousel-mini decorator that classes
 * the sole cell as the slide image). Modeled after carousel-hero.js but simpler.
 *
 * Source structure (validated against source.html):
 *   .carousel.cmp-carousel--mini
 *     .cmp-carousel > .cmp-carousel__content
 *       .cmp-carousel__item (one per slide)
 *         .image > .cmp-image > img.cmp-image__image
 */
export default function parse(element, { document }) {
  // Each slide is a carousel item; fall back to image wrappers if markup varies.
  let slides = Array.from(element.querySelectorAll('.cmp-carousel__item'));
  if (!slides.length) {
    slides = Array.from(element.querySelectorAll('.cmp-image, .image'));
  }

  const cells = [];

  slides.forEach((slide) => {
    // Image is the only content per slide (image-only masthead gallery).
    const image = slide.querySelector('.cmp-image img, .cmp-image__image, img');
    if (!image) return;

    // 1-column row: a single cell holding the slide image.
    cells.push([image]);
  });

  // Empty-block guard: unwrap rather than emit an empty block.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-mini', cells });
  element.replaceWith(block);
}
