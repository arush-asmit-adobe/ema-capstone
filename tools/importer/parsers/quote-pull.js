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
 * Two source styles map to two block variants:
 *   - .cmp-text--quote  -> grey callout box   -> "quote-pull"          (default)
 *   - plain .cmp-text    -> inline blockquote   -> "quote-pull (plain)" (variant)
 * The variant token is preserved by createBlock as a `plain` class on the block.
 *
 * Source structure (validated against source.html):
 *   .cmp-text[.cmp-text--quote]
 *     <blockquote> … quotation (may contain <b>/<br>) …
 *     <p> … attribution (optional; e.g. bold/italic/underline "noun") …
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

  // The grey-box style is marked by .cmp-text--quote on the enclosing .text
  // grid column (NOT on the inner .cmp-text element the parser receives). When
  // that class is absent, the source rendered a plain inline blockquote.
  const wrapper = element.closest('.text') || element.parentElement || element;
  const isGreyBox = element.classList.contains('cmp-text--quote')
    || (wrapper && wrapper.classList && wrapper.classList.contains('cmp-text--quote'));
  const name = isGreyBox ? 'quote-pull' : 'quote-pull (plain)';

  const block = WebImporter.Blocks.createBlock(document, { name, cells });
  element.replaceWith(block);
}
