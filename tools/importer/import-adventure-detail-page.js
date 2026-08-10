/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselMiniParser from './parsers/carousel-mini.js';
import tableFactsParser from './parsers/table-facts.js';
import tabsAdventureParser from './parsers/tabs-adventure.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

// Per-adventure taxonomy the source exposes only via its category tabs (not in
// page <meta>). Keyed by URL slug. `category` drives the Current Adventures
// category tabs; `featured` (1-based rank) drives the homepage "Where do you
// want to go?" curated order. These are emitted as page metadata below so the
// published query index carries them.
const ADVENTURE_META = {
  'bali-surf-camp': { category: 'Surfing', featured: '' },
  'beervana-portland': { category: 'Travel', featured: '' },
  'climbing-new-zealand': { category: 'Climbing', featured: '' },
  'colorado-rock-climbing': { category: 'Climbing', featured: '' },
  'cycling-southern-utah': { category: '', featured: '' },
  'cycling-tuscany': { category: 'Cycling, Travel', featured: '' },
  'downhill-skiing-wyoming': { category: 'Skiing', featured: '' },
  'gastronomic-marais-tour': { category: 'Travel', featured: '' },
  'napa-wine-tasting': { category: 'Travel', featured: '' },
  'riverside-camping-australia': { category: 'Travel', featured: '' },
  'ski-touring-mont-blanc': { category: 'Skiing', featured: '' },
  'surf-camp-costa-rica': { category: 'Surfing', featured: '' },
  'tahoe-skiing': { category: 'Skiing', featured: '4' },
  'west-coast-cycling': { category: 'Cycling', featured: '3' },
  'whistler-mountain-biking': { category: 'Cycling', featured: '2' },
  'yosemite-backpacking': { category: 'Travel', featured: '1' },
};

/**
 * Append Category / Featured rows to the page's Metadata block so they land in
 * <head> as <meta> tags and are picked up by helix-query.yaml. Runs after
 * WebImporter.rules.createMetadata has created the block.
 * @param {Element} main
 * @param {Document} document
 * @param {string} slug URL slug of the adventure (e.g. 'bali-surf-camp')
 */
function appendAdventureMetadata(main, document, slug) {
  const meta = ADVENTURE_META[slug];
  if (!meta) return;

  // Find the Metadata block createMetadata just appended (last table whose
  // first cell reads "Metadata").
  const tables = [...main.querySelectorAll('table')];
  const metaTable = tables.reverse().find((t) => {
    const first = t.querySelector('tr td, tr th');
    return first && /^metadata$/i.test((first.textContent || '').trim());
  });
  if (!metaTable) return;
  const tbody = metaTable.querySelector('tbody') || metaTable;

  const addRow = (key, value) => {
    if (value === undefined || value === null || `${value}`.trim() === '') return;
    const tr = document.createElement('tr');
    const k = document.createElement('td');
    k.textContent = key;
    const v = document.createElement('td');
    v.textContent = value;
    tr.append(k, v);
    tbody.append(tr);
  };

  addRow('category', meta.category);
  addRow('featured', meta.featured);
}

/**
 * Adventure-detail-page-specific cleanup: strip auxiliary chrome that only
 * appears on adventure detail pages and is auto-populated (not authorable
 * content). Verified against migration-work/cleaned.html for bali-surf-camp:
 *   - .breadcrumb  — "Adventures > Bali Surf Camp" nav crumb
 *   - .sharing     — Facebook/Pinterest share button column
 *   - the "Share this Adventure" .cmp-title heading that labels the share
 *     column (page-specific id, so matched by heading text to work across all
 *     adventure detail pages).
 * Runs in beforeTransform, ahead of block parsing, mirroring the article-page
 * import's inline cleanup pattern.
 */
function adventureCleanupTransformer(hookName, element) {
  if (hookName !== 'beforeTransform') return;
  // Remove the share-widget label ("Share this Adventure") by heading text so
  // this is robust to the page-specific title id.
  element.querySelectorAll('.cmp-title').forEach((t) => {
    const heading = t.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading && /share this adventure/i.test(heading.textContent || '')) {
      t.remove();
    }
  });
  // eslint-disable-next-line no-undef
  WebImporter.DOMUtils.remove(element, [
    '.breadcrumb',
    '.sharing',
  ]);
}

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'adventure-detail-page',
  description: 'WKND adventure detail page: full-width image masthead carousel, page title (H1), an adventure spec fact-sheet (label/value table), and an interactive Overview/Itinerary/What to Bring tab switcher. The "Share this Adventure" widget is excluded as chrome.',
  urls: [
    'https://wknd.site/us/en/adventures/bali-surf-camp.html',
    'https://wknd.site/us/en/adventures/beervana-portland.html',
    'https://wknd.site/us/en/adventures/climbing-new-zealand.html',
    'https://wknd.site/us/en/adventures/colorado-rock-climbing.html',
    'https://wknd.site/us/en/adventures/cycling-southern-utah.html',
    'https://wknd.site/us/en/adventures/cycling-tuscany.html',
    'https://wknd.site/us/en/adventures/downhill-skiing-wyoming.html',
    'https://wknd.site/us/en/adventures/gastronomic-marais-tour.html',
    'https://wknd.site/us/en/adventures/napa-wine-tasting.html',
    'https://wknd.site/us/en/adventures/riverside-camping-australia.html',
    'https://wknd.site/us/en/adventures/ski-touring-mont-blanc.html',
    'https://wknd.site/us/en/adventures/surf-camp-costa-rica.html',
    'https://wknd.site/us/en/adventures/tahoe-skiing.html',
    'https://wknd.site/us/en/adventures/west-coast-cycling.html',
    'https://wknd.site/us/en/adventures/whistler-mountain-biking.html',
    'https://wknd.site/us/en/adventures/yosemite-backpacking.html',
  ],
  blocks: [
    {
      name: 'carousel-mini',
      instances: ['.carousel.cmp-carousel--mini'],
    },
    {
      name: 'table-facts',
      instances: ['.contentfragment.cmp-contentfragment--elements'],
    },
    {
      name: 'tabs-adventure',
      instances: ['.cmp-tabs'],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Masthead Image Carousel',
      selector: '.carousel.cmp-carousel--mini',
      style: null,
      blocks: ['carousel-mini'],
      defaultContent: [],
    },
    {
      // Portable across all adventure detail pages: break before the page H1
      // (page-specific title ids differ per page). This splits the masthead
      // carousel off into its own section, matching the article-page pattern.
      id: 'section-2',
      name: 'Page Title',
      selector: 'h1',
      style: null,
      blocks: [],
      defaultContent: ['h1'],
    },
    {
      id: 'section-3',
      name: 'Adventure Details Fact-Sheet',
      selector: '.contentfragment.cmp-contentfragment--elements',
      style: null,
      blocks: ['table-facts'],
      defaultContent: [],
    },
    {
      id: 'section-4',
      name: 'Adventure Detail Tabs',
      selector: '.cmp-tabs',
      style: null,
      blocks: ['tabs-adventure'],
      defaultContent: [],
    },
  ],
};

// PARSER REGISTRY - Map parser names to functions
const parsers = {
  'carousel-mini': carouselMiniParser,
  'table-facts': tableFactsParser,
  'tabs-adventure': tabsAdventureParser,
};

// TRANSFORMER REGISTRY - adventure-specific chrome removal + site cleanup run
// first, sections runs after (adds <hr> breaks)
const transformers = [
  adventureCleanupTransformer,
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

    // 5b. Add per-adventure category / featured metadata (drives the Current
    // Adventures category tabs and the homepage curated order via the query
    // index). Slug is the last path segment of the source URL.
    const slug = new URL(params.originalURL).pathname
      .replace(/\/$/, '').replace(/\.html$/, '').split('/').pop();
    appendAdventureMetadata(main, document, slug);

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
