/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import quotePullParser from './parsers/quote-pull.js';
import cardsProfileParser from './parsers/cards-profile.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

/**
 * Article-page-specific cleanup: strip auxiliary chrome that only appears on
 * magazine article detail pages and is auto-populated (not authorable content).
 * Verified against migration-work/cleaned.html for western-australia:
 *   - .breadcrumb                     — "Magazine > Western Australia" nav crumb
 *   - .cmp-contentfragment__title     — redundant H3 title (duplicates the H1)
 *   - aside.cmp-layoutcontainer--sidebar — right sidebar: SHARE THIS STORY +
 *                                          share buttons + UP NEXT related list
 */
function articleCleanupTransformer(hookName, element) {
  if (hookName !== 'beforeTransform') return;
  // eslint-disable-next-line no-undef
  WebImporter.DOMUtils.remove(element, [
    '.breadcrumb',
    '.cmp-contentfragment__title',
    'aside.cmp-layoutcontainer--sidebar',
  ]);
}

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'article-page',
  description: 'WKND magazine article detail page: full-width masthead lead photo, article body (title, byline, intro, a grey pull-quote callout, and three underlined-H2 + image + paragraph units), and an author byline profile card at the end.',
  urls: [
    'https://wknd.site/us/en/magazine/western-australia.html',
  ],
  blocks: [
    {
      name: 'quote-pull',
      instances: ['.cmp-text:has(blockquote)'],
    },
    {
      name: 'cards-profile',
      instances: ['.cmp-byline'],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Masthead Lead Image',
      selector: '#image-de01fa9d3f',
      style: null,
      blocks: [],
      defaultContent: ['#image-de01fa9d3f'],
    },
    {
      id: 'section-2',
      name: 'Article Body',
      selector: '#container-fc6c2f500a',
      style: null,
      blocks: ['quote-pull'],
      defaultContent: ['#title-6782e190a5', '#title-57a780e4c1', '#title-4fc4680be1', '#title-90a292b7fd', '#title-7b99fe2b49'],
    },
    {
      id: 'section-3',
      name: 'Author Byline Card',
      selector: '.cmp-byline',
      style: null,
      blocks: ['cards-profile'],
      defaultContent: [],
    },
  ],
};

// PARSER REGISTRY - Map parser names to functions
const parsers = {
  'quote-pull': quotePullParser,
  'cards-profile': cardsProfileParser,
};

// TRANSFORMER REGISTRY - article cleanup + site cleanup run first, sections after
const transformers = [
  articleCleanupTransformer,
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform (typically document.body)
 * @param {Object} payload - The payload containing { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // already replaced/removed by earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section breaks)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path (full localized path without extension)
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
