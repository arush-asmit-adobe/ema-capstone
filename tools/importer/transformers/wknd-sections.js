/* eslint-disable */
/* global WebImporter, Node */

/**
 * Transformer: WKND section breaks and section metadata.
 *
 * Runs in afterTransform only. Uses payload.template.sections to insert an
 * EDS section break (<hr>) before every section except the first, and a
 * "Section Metadata" block for any section that declares a style.
 *
 * For the WKND home-page template all 5 sections have style: null, so this
 * inserts 4 section breaks (sections.length - 1) and 0 metadata blocks.
 *
 * Section selectors and defaultContent selectors are taken from
 * tools/importer/page-templates.json (verified against
 * migration-work/cleaned.html). Several sections begin with a default-content
 * title that precedes the block in document order, so the break is placed
 * before whichever candidate element appears first in the DOM.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

/**
 * Find the first element (in document order) that belongs to a section,
 * considering both the block selector and any defaultContent selectors.
 */
function findFirstSectionElement(root, section) {
  const selectors = [];
  if (section.selector) selectors.push(section.selector);
  (section.defaultContent || []).forEach((sel) => selectors.push(sel));

  const candidates = selectors
    .map((sel) => root.querySelector(sel))
    .filter((el) => el);

  if (!candidates.length) return null;

  return candidates.reduce((first, cur) => {
    if (!first) return cur;
    // If cur precedes first in the document, cur is the earlier element.
    const preceding = first.compareDocumentPosition(cur) & Node.DOCUMENT_POSITION_PRECEDING;
    return preceding ? cur : first;
  }, null);
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const template = payload && payload.template;
    const sections = (template && template.sections) || [];
    if (sections.length < 2) return;

    const doc = element.ownerDocument;

    // Remove pre-existing presentational separators so their <hr> elements are
    // not confused with EDS section breaks. Verified in cleaned.html:
    // .separator wrappers at #separator-bd766ae5bf (line 351) and
    // #separator-e8e691c190 (line 460), each containing an
    // hr.cmp-separator__horizontal-rule. These dividers are superseded by the
    // section breaks inserted below.
    WebImporter.DOMUtils.remove(element, ['.separator']);

    // Process sections in reverse so DOM mutations for later sections do not
    // shift earlier ones.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const firstEl = findFirstSectionElement(element, section);
      if (!firstEl) continue;

      // Section Metadata block for sections that declare a style.
      if (section.style) {
        const block = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        firstEl.parentElement.insertBefore(block, firstEl.nextSibling);
      }

      // Section break before every section except the first.
      if (i > 0) {
        const hr = doc.createElement('hr');
        firstEl.before(hr);
      }
    }
  }
}
