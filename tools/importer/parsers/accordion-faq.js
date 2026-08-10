/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-faq.
 * Base block: accordion
 * Source: https://wknd.site/us/en/faqs.html (.cmp-accordion)
 * Generated: 2026-08-08
 *
 * Accordion library convention: a 2-column table with multiple rows.
 *   - Row 1: block name only (added by createBlock).
 *   - Each subsequent row = one accordion item, 2 cells:
 *       cell 1 (Title, mandatory): the clickable question/label.
 *       cell 2 (Content, mandatory): the answer body revealed on expand.
 *   When rendered, JS/CSS turns each row into a collapsible panel.
 *
 * Source structure (validated against source.html):
 *   .cmp-accordion
 *     .cmp-accordion__item
 *       h3.cmp-accordion__header > button.cmp-accordion__button
 *         span.cmp-accordion__title   (the question)
 *         span.cmp-accordion__icon
 *       .cmp-accordion__panel
 *         .container.responsivegrid > .cmp-container > .text > .cmp-text
 *           <p> (the answer; occasionally a trailing empty <h3>&nbsp;</h3>)
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('.cmp-accordion__item'));

  // Empty-block guard: unwrap if nothing to decorate.
  if (!items.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  items.forEach((item) => {
    // Cell 1 (Title): the question label.
    const titleEl = item.querySelector('.cmp-accordion__title, .cmp-accordion__button');
    const question = titleEl ? (titleEl.textContent || '').trim() : '';

    // Cell 2 (Content): the answer body. Prefer the innermost rich-text node so
    // the AEM grid/container wrappers are dropped but the paragraph markup is kept.
    const panel = item.querySelector('.cmp-accordion__panel');
    const answer = [];
    if (panel) {
      const textNodes = Array.from(panel.querySelectorAll('.cmp-text'));
      const sources = textNodes.length ? textNodes : [panel];
      sources.forEach((node) => {
        Array.from(node.children).forEach((child) => {
          // Skip spacer-only headings (e.g. <h3>&nbsp;</h3>) and empty nodes.
          if (!(child.textContent || '').replace(/ /g, ' ').trim()) return;
          answer.push(child);
        });
      });
    }

    // Skip fully empty items.
    if (!question && !answer.length) return;

    cells.push([question, answer.length ? answer : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
