/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import columnsFeaturedParser from './parsers/columns-featured.js';
import cardsIndexParser from './parsers/cards-index.js';
import cardsPromoParser from './parsers/cards-promo.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'magazine-page',
  description: 'WKND magazine landing page: featured article, all-articles card grid, members-only section, and members-only secure promo teasers.',
  urls: [
    'https://wknd.site/us/en/magazine.html',
  ],
  blocks: [
    {
      name: 'columns-featured',
      instances: ['.teaser.cmp-teaser--featured'],
    },
    {
      name: 'cards-index',
      instances: ['.cmp-image-list'],
    },
    {
      name: 'cards-promo',
      instances: ['.teaser.cmp-teaser--secure'],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Featured Article',
      selector: '.teaser.cmp-teaser--featured',
      style: null,
      blocks: ['columns-featured'],
      defaultContent: ['#title-e83f9afeef'],
    },
    {
      id: 'section-2',
      name: 'All Articles',
      selector: '.image-list.list',
      style: null,
      blocks: ['cards-index'],
      defaultContent: ['#title-0f80375ce9'],
    },
    {
      id: 'section-3',
      name: 'Members Only',
      selector: '#text-bb7bdee5e8',
      style: null,
      blocks: [],
      defaultContent: ['#title-59d441f861', '#text-bb7bdee5e8'],
    },
    {
      id: 'section-4',
      name: 'Members-Only Secure Teasers',
      selector: '.teaser.cmp-teaser--secure',
      style: null,
      blocks: ['cards-promo'],
      defaultContent: [],
    },
  ],
};

// PARSER REGISTRY - Map parser names to functions
const parsers = {
  'columns-featured': columnsFeaturedParser,
  'cards-index': cardsIndexParser,
  'cards-promo': cardsPromoParser,
};

// TRANSFORMER REGISTRY - cleanup runs first, sections runs after (adds <hr> breaks)
const transformers = [
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
      if (!block.element.parentNode) return; // already replaced by earlier parser
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
