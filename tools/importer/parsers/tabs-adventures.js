/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-adventures.
 * Base block: tabs
 * Source: https://wknd.site/us/en/adventures.html (.cmp-tabs)
 * Generated: 2026-08-08
 *
 * Library convention (tabs): 2 columns, multiple rows.
 *   - Row 1: block name (added by createBlock)
 *   - Each subsequent row = one tab:
 *       cell 1: tab label (mandatory)
 *       cell 2: tab content (mandatory) — the adventure listing grid
 *
 * Source structure (validated against source.html):
 *   .cmp-tabs
 *     ol.cmp-tabs__tablist > li.cmp-tabs__tab                       (labels, in order)
 *     div.cmp-tabs__tabpanel  (one per tab, same order as tab labels)
 *       .image-list.list > ul.cmp-image-list > li.cmp-image-list__item
 *         a.cmp-image-list__item-image-link > … img
 *         a.cmp-image-list__item-title-link > span.cmp-image-list__item-title
 *         span.cmp-image-list__item-description
 *
 * The adventure cards live INSIDE each tab panel as panel content. Per the
 * authoring analysis, blocks cannot be nested inside blocks, so each item is
 * emitted as grid content (figure with image + linked heading + description)
 * directly into the tab's content cell — NOT as a nested cards block.
 */
export default function parse(element, { document }) {
  // Tab labels, in document order.
  const tabLabels = Array.from(
    element.querySelectorAll('.cmp-tabs__tablist .cmp-tabs__tab, .cmp-tabs__tab'),
  );

  // Tab panels, in document order (parallel to tabLabels).
  const tabPanels = Array.from(
    element.querySelectorAll('.cmp-tabs__tabpanel, [class*="tabpanel"]'),
  );

  // Empty-block guard.
  if (!tabLabels.length || !tabPanels.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Pair each label with its panel by index (both are in the same DOM order).
  const count = Math.min(tabLabels.length, tabPanels.length);
  for (let i = 0; i < count; i += 1) {
    const labelEl = tabLabels[i];
    const panelEl = tabPanels[i];

    // Cell 1: tab label text.
    const labelText = (labelEl.textContent || '').trim();

    // Cell 2: build the adventure grid content from the panel's items.
    const contentCell = [];
    // Use the list item as the unit. Fall back to the inner article wrapper
    // ONLY if no list items exist — the two selectors are nested (li > article),
    // so listing them together would double-select every item.
    let items = Array.from(panelEl.querySelectorAll('.cmp-image-list__item'));
    if (!items.length) {
      items = Array.from(panelEl.querySelectorAll('.cmp-image-list__item-content, :scope > li'));
    }

    items.forEach((item) => {
      const image = item.querySelector('.cmp-image-list__item-image img, .cmp-image img, img');

      // Title is an anchor wrapping a span; preserve heading semantics + the link.
      const titleLink = item.querySelector('.cmp-image-list__item-title-link, a[class*="title"]');
      const titleText = item.querySelector('.cmp-image-list__item-title, [class*="item-title"]:not(a)');
      const description = item.querySelector('.cmp-image-list__item-description, [class*="description"]');

      // Skip empty items.
      if (!image && !titleLink && !titleText && !description) return;

      if (image) contentCell.push(image);

      if (titleLink) {
        // Rebuild as a heading that keeps the link (and its href) intact.
        const heading = document.createElement('h3');
        const link = document.createElement('a');
        link.href = titleLink.getAttribute('href') || '#';
        link.textContent = (titleText || titleLink).textContent.trim();
        heading.append(link);
        contentCell.push(heading);
      } else if (titleText) {
        const heading = document.createElement('h3');
        heading.textContent = titleText.textContent.trim();
        contentCell.push(heading);
      }

      if (description) contentCell.push(description);
    });

    // 2-column row: [label, panel content]. Pad content if empty to keep rows even.
    cells.push([labelText, contentCell.length ? contentCell : '']);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-adventures', cells });
  element.replaceWith(block);
}
