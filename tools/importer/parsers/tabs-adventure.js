/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-adventure.
 * Base block: tabs
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html (.cmp-tabs)
 * Generated: 2026-08-10
 *
 * Library convention (tabs): 2 columns, multiple rows; row 1 = block name (added
 * by createBlock). Each subsequent row = one tab:
 *   cell 1: Tab Label (mandatory)
 *   cell 2: Tab Content (mandatory) — the rich content shown when the tab is active.
 *
 * Source structure (validated against source.html):
 *   .cmp-tabs
 *     ol.cmp-tabs__tablist
 *       li.cmp-tabs__tab (one per tab, in order: Overview / Itinerary / What to Bring)
 *     .cmp-tabs__tabpanel (one per tab, in the SAME order as the tablist)
 *       .contentfragment > article.cmp-contentfragment
 *         h3.cmp-contentfragment__title           (repeated fragment title — chrome, dropped)
 *         .cmp-contentfragment__elements          (the rich panel body)
 *           <p>, in-body <img> (.cmp-image), <b> sub-headings, <ul> bullet list,
 *           plus empty .aem-Grid spacer divs (dropped)
 *
 * Labels are paired to panels by index. Nested empty aem-Grid spacer divs and the
 * duplicated fragment title are skipped so only meaningful rich content is kept.
 */
export default function parse(element, { document }) {
  const labels = Array.from(
    element.querySelectorAll('.cmp-tabs__tablist .cmp-tabs__tab'),
  );
  const panels = Array.from(
    element.querySelectorAll(':scope > .cmp-tabs__tabpanel'),
  );

  const cells = [];

  labels.forEach((labelEl, i) => {
    const label = (labelEl.textContent || '').trim();
    const panel = panels[i];

    // Collect the meaningful rich content from the matching panel. Prefer the
    // content-fragment body; fall back to the panel itself if markup varies.
    const contentCell = [];
    if (panel) {
      const body = panel.querySelector('.cmp-contentfragment__elements') || panel;

      // Walk all descendants and keep only leaf content nodes (paragraphs,
      // headings, images, lists), dropping the repeated fragment title and the
      // empty aem-Grid layout spacer wrappers.
      //
      // Content-fragment rich text sometimes wraps a paragraph in a bare <div>
      // instead of a <p> (e.g. the cycling-tuscany "What to Bring" intro). We
      // include such text-bearing leaf <div>s and normalise them to <p> so no
      // prose is dropped — but only "leaf" divs (no element children other than
      // inline formatting), to avoid re-capturing layout/grid wrappers whose
      // real content we already collect separately.
      const nodes = Array.from(
        body.querySelectorAll('p, img, ul, ol, h1, h2, h3, h4, h5, h6, b, strong, div'),
      );

      const seen = new Set();
      nodes.forEach((node) => {
        // Skip the duplicated content-fragment title.
        if (node.classList && node.classList.contains('cmp-contentfragment__title')) return;

        // Normalise the image node: use the <img> element itself (with src/alt).
        if (node.tagName === 'IMG') {
          if (seen.has(node)) return;
          seen.add(node);
          contentCell.push(node);
          return;
        }

        // Handle <div>s: keep only text-bearing "leaf" divs (no block-level
        // element children), and rewrite them as <p> so they import as prose.
        // This skips empty aem-Grid spacers and outer layout wrappers.
        if (node.tagName === 'DIV') {
          if (node.querySelector('div, p, ul, ol, img, h1, h2, h3, h4, h5, h6')) return;
          const divText = (node.textContent || '').replace(/ /g, ' ').trim();
          if (!divText) return;
          const p = document.createElement('p');
          p.innerHTML = node.innerHTML;
          seen.add(node);
          contentCell.push(p);
          return;
        }

        // For inline emphasis (<b>/<strong>) that is wrapped in a <p>, the
        // parent <p> is already captured — skip the standalone inline node to
        // avoid duplicating its text.
        if ((node.tagName === 'B' || node.tagName === 'STRONG')
          && node.closest('p')) return;

        // Skip empty text-only nodes (e.g. whitespace-only wrappers).
        const text = (node.textContent || '').replace(/ /g, ' ').trim();
        const hasImg = node.querySelector && node.querySelector('img');
        if (!text && !hasImg) return;

        // Avoid double-capturing a node whose content is already inside a node
        // we pushed (e.g. an <img> inside a <p> we also keep). Only push if no
        // already-pushed ancestor contains it.
        const alreadyCaptured = contentCell.some(
          (kept) => kept.nodeType === 1 && kept.contains && kept.contains(node),
        );
        if (alreadyCaptured) return;

        seen.add(node);
        contentCell.push(node);
      });
    }

    // Skip fully empty tabs.
    if (!label && !contentCell.length) return;

    // 2-column row: [label, content]. Pad missing content cell to keep rows even.
    cells.push([label, contentCell.length ? contentCell : '']);
  });

  // Empty-block guard: unwrap rather than emit an empty block.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-adventure', cells });
  element.replaceWith(block);
}
