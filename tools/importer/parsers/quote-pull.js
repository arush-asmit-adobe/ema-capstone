/* eslint-disable */
/* global WebImporter */
/**
 * Parser for quote-pull.
 * Base block: quote
 * Source: https://wknd.site/us/en/magazine/western-australia.html (.cmp-text:has(blockquote))
 * Generated: 2026-08-10
 *
 * Quote "with attribution" convention: a 1-column table with the block name in
 * row 1, the quotation in row 2, and the attribution in row 3.
 *
 * Source structure (validated against source.html):
 *   .cmp-text
 *     <blockquote> … quotation (may contain <b>/<br>) …
 *     <p> … attribution (e.g. bold/italic/underline "noun") …
 */
export default function parse(element, { document }) {
  const quote = element.querySelector('blockquote');
  const attribution = element.querySelector('p');

  // Empty-block guard: nothing to decorate.
  if (!quote && !attribution) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  if (quote) cells.push([quote]);
  if (attribution) cells.push([attribution]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'quote-pull', cells });
  element.replaceWith(block);
}
