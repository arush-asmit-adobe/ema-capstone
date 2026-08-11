/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-adventures-page.js
  var import_adventures_page_exports = {};
  __export(import_adventures_page_exports, {
    default: () => import_adventures_page_default
  });

  // tools/importer/parsers/hero-intro.js
  function parse(element, { document }) {
    const content = element.querySelector(".cmp-teaser__content") || element;
    const title = content.querySelector('.cmp-teaser__title, h1, h2, h3, [class*="title"]:not([class*="pretitle"])');
    const description = content.querySelector('.cmp-teaser__description, [class*="description"], p');
    const bgImage = element.querySelector(".cmp-teaser__image img, .cmp-image img, img");
    if (!title && !description && !bgImage) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (bgImage) cells.push([bgImage]);
    const contentCell = [];
    if (title) contentCell.push(title);
    if (description) contentCell.push(description);
    if (contentCell.length) cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-intro", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-index.js
  function parse2(element, { document }) {
    const activePanel = element.querySelector(".cmp-tabs__tabpanel--active");
    const scope = activePanel || element;
    let items = Array.from(scope.querySelectorAll(".cmp-image-list__item"));
    if (!items.length) {
      items = Array.from(scope.querySelectorAll(":scope > li, .cmp-image-list__item-content"));
    }
    const cells = [];
    items.forEach((item) => {
      const image = item.querySelector(".cmp-image-list__item-image img, .cmp-image img, img");
      const titleLink = item.querySelector('.cmp-image-list__item-title-link, a[class*="title"]');
      const titleText = item.querySelector('.cmp-image-list__item-title, [class*="item-title"]:not(a)');
      const description = item.querySelector('.cmp-image-list__item-description, [class*="description"]');
      const textCell = [];
      if (titleLink) {
        const heading = document.createElement("h3");
        const link = document.createElement("a");
        link.href = titleLink.getAttribute("href") || "#";
        link.textContent = (titleText || titleLink).textContent.trim();
        heading.append(link);
        textCell.push(heading);
      } else if (titleText) {
        const heading = document.createElement("h3");
        heading.textContent = titleText.textContent.trim();
        textCell.push(heading);
      }
      if (description) textCell.push(description);
      if (!image && !textCell.length) return;
      cells.push([image || "", textCell.length ? textCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-index", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#destination_publishing_iframe_wkndsite_0",
        "#toggleNav",
        "#mobileNav"
      ]);
      element.querySelectorAll(".cmp-image .cmp-image__title").forEach((cap) => {
        const text = (cap.textContent || "").trim();
        if (!text) {
          cap.remove();
          return;
        }
        const wrapper = cap.closest(".cmp-image") || cap.parentElement;
        const p = element.ownerDocument.createElement("p");
        const em = element.ownerDocument.createElement("em");
        em.textContent = text;
        p.append(em);
        wrapper.after(p);
        cap.remove();
      });
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.cmp-experiencefragment--header",
        "footer.cmp-experiencefragment--footer"
      ]);
      WebImporter.DOMUtils.remove(element, [".separator"]);
      WebImporter.DOMUtils.remove(element, ["meta", "iframe"]);
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("data-cmp-data-layer");
        el.removeAttribute("data-cmp-hook-image");
        el.removeAttribute("data-cmp-hook-teaser");
        el.removeAttribute("data-cmp-clickable");
        el.removeAttribute("data-cmp-lazy");
      });
    }
  }

  // tools/importer/transformers/wknd-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function findFirstSectionElement(root, section) {
    const selectors = [];
    if (section.selector) selectors.push(section.selector);
    (section.defaultContent || []).forEach((sel) => selectors.push(sel));
    const candidates = selectors.map((sel) => root.querySelector(sel)).filter((el) => el);
    if (!candidates.length) return null;
    return candidates.reduce((first, cur) => {
      if (!first) return cur;
      const preceding = first.compareDocumentPosition(cur) & Node.DOCUMENT_POSITION_PRECEDING;
      return preceding ? cur : first;
    }, null);
  }
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const template = payload && payload.template;
      const sections = template && template.sections || [];
      if (sections.length < 2) return;
      const doc = element.ownerDocument;
      WebImporter.DOMUtils.remove(element, [".separator"]);
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const firstEl = findFirstSectionElement(element, section);
        if (!firstEl) continue;
        if (section.style) {
          const block = WebImporter.Blocks.createBlock(doc, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          firstEl.parentElement.insertBefore(block, firstEl.nextSibling);
        }
        if (i > 0) {
          const hr = doc.createElement("hr");
          firstEl.before(hr);
        }
      }
    }
  }

  // tools/importer/import-adventures-page.js
  var PAGE_TEMPLATE = {
    name: "adventures-page",
    description: "WKND adventures landing page: intro hero with overlaid white card, and a tabbed Current Adventures listing.",
    urls: [
      "https://wknd.site/us/en/adventures.html"
    ],
    blocks: [
      {
        name: "hero-intro",
        instances: [".teaser.cmp-teaser--hero:not(.cmp-teaser--imagebottom)"]
      },
      {
        // Current Adventures: the full listing lives in the active "All" tab
        // panel. Map that single panel to the unified cards-index block so the
        // adventures grid uses the same card component (and dynamic query-index
        // rendering) as the homepage/magazine grids. The category tabs are
        // rebuilt at runtime from the query index's `category` field.
        name: "cards-index",
        instances: [".cmp-tabs"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Intro Hero",
        selector: ".teaser.cmp-teaser--hero:not(.cmp-teaser--imagebottom)",
        style: null,
        blocks: ["hero-intro"],
        defaultContent: ["#title-e8e3276d1e"]
      },
      {
        id: "section-2",
        name: "Current Adventures",
        selector: ".cmp-tabs",
        style: null,
        blocks: ["cards-index"],
        defaultContent: ["#title-dffa0ffaf3"]
      }
    ]
  };
  var parsers = {
    "hero-intro": parse,
    "cards-index": parse2
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_adventures_page_default = {
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_adventures_page_exports);
})();
