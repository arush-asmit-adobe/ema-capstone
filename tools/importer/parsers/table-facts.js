/* eslint-disable */
/* global WebImporter */
/**
 * Parser for table-facts.
 * Base block: table (no-header variant)
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html (.contentfragment.cmp-contentfragment--elements)
 * Generated: 2026-08-10
 *
 * Library convention (table, no-header): multiple columns, multiple rows; row 1 =
 * block name (added by createBlock). With the "no header" variant the first data
 * row is content, not a header. This is an adventure spec fact-sheet: 2 columns
 * (label | value), one row per label/value pair.
 *
 * Source structure (validated against source.html):
 *   .contentfragment.cmp-contentfragment--elements
 *     article.cmp-contentfragment
 *       h3.cmp-contentfragment__title            (fragment title — chrome, not a fact)
 *       dl.cmp-contentfragment__elements
 *         .cmp-contentfragment__element (one per fact)
 *           dt.cmp-contentfragment__element-title   (label, e.g. "Activity")
 *           dd.cmp-contentfragment__element-value   (value, e.g. "Surfing")
 *
 * The "Share this Adventure" social widget (.sharing / #title-8348bbe330) is
 * chrome and lives outside .cmp-contentfragment__elements, so scoping extraction
 * to the .cmp-contentfragment__element pairs excludes it automatically.
 */
export default function parse(element, { document }) {
  // Each fact is a label/value element; scope to the definition-list items so the
  // fragment title and any sharing/social chrome are excluded.
  const facts = Array.from(
    element.querySelectorAll('.cmp-contentfragment__element'),
  );

  const cells = [];

  facts.forEach((fact) => {
    const labelEl = fact.querySelector('.cmp-contentfragment__element-title, dt');
    const valueEl = fact.querySelector('.cmp-contentfragment__element-value, dd');

    const label = labelEl ? (labelEl.textContent || '').trim() : '';
    const value = valueEl ? (valueEl.textContent || '').trim() : '';

    // Skip pairs with neither a label nor a value.
    if (!label && !value) return;

    // 2-column row: [label, value]. Pad any missing cell to keep rows even.
    cells.push([label, value]);
  });

  // Empty-block guard: unwrap rather than emit an empty block.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'table-facts', cells });
  element.replaceWith(block);
}
