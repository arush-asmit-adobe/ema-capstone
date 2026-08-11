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

  // tools/importer/import-home-page.js
  var import_home_page_exports = {};
  __export(import_home_page_exports, {
    default: () => import_home_page_default
  });

  // tools/importer/parsers/carousel-hero.js
  function parse(element, { document }) {
    let slides = Array.from(element.querySelectorAll(".cmp-carousel__item"));
    if (!slides.length) {
      slides = Array.from(element.querySelectorAll('.teaser, [class*="teaser"]'));
    }
    const cells = [];
    slides.forEach((slide) => {
      const image = slide.querySelector(".cmp-teaser__image img, .cmp-image img, img");
      const content = slide.querySelector(".cmp-teaser__content") || slide;
      const title = content.querySelector('h1, h2, h3, .cmp-teaser__title, [class*="title"]');
      const description = content.querySelector('.cmp-teaser__description, [class*="description"], p');
      const ctaLinks = Array.from(
        content.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a, a[class*="action"]')
      );
      if (!image && !title && !description && !ctaLinks.length) return;
      const contentCell = [];
      if (title) contentCell.push(title);
      if (description) contentCell.push(description);
      contentCell.push(...ctaLinks);
      cells.push([image || "", contentCell.length ? contentCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-featured.js
  function parse2(element, { document }) {
    const content = element.querySelector(".cmp-teaser__content") || element;
    const pretitle = content.querySelector('.cmp-teaser__pretitle, [class*="pretitle"]');
    const title = content.querySelector('.cmp-teaser__title, h1, h2, h3, [class*="title"]:not([class*="pretitle"])');
    const description = content.querySelector('.cmp-teaser__description, [class*="description"], p:not([class*="pretitle"])');
    const ctaLinks = Array.from(
      content.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a, a[class*="action"]')
    );
    const image = element.querySelector(".cmp-teaser__image img, .cmp-image img, img");
    if (!title && !description && !image) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const textCell = [];
    if (pretitle) textCell.push(pretitle);
    if (title) textCell.push(title);
    if (description) textCell.push(description);
    textCell.push(...ctaLinks);
    const cells = [
      [textCell.length ? textCell : "", image || ""]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-featured", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-index.js
  function parse3(element, { document }) {
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

  // tools/importer/parsers/hero-banner.js
  function parse4(element, { document }) {
    const content = element.querySelector(".cmp-teaser__content") || element;
    const title = content.querySelector('.cmp-teaser__title, h1, h2, h3, [class*="title"]:not([class*="pretitle"])');
    const description = content.querySelector('.cmp-teaser__description, [class*="description"], p');
    const ctaLinks = Array.from(
      content.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a, a[class*="action"]')
    );
    const bgImage = element.querySelector(".cmp-teaser__image img, .cmp-image img, img");
    if (!title && !description && !bgImage && !ctaLinks.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (bgImage) cells.push([bgImage]);
    const contentCell = [];
    if (title) contentCell.push(title);
    if (description) contentCell.push(description);
    contentCell.push(...ctaLinks);
    if (contentCell.length) cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-banner", cells });
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

  // tools/importer/import-home-page.js
  var PAGE_TEMPLATE = {
    name: "home-page",
    description: "WKND homepage: hero carousel, featured article, recent articles card grid, next-adventures banner, and adventures/trips card grid.",
    urls: [
      "https://wknd.site/us/en.html"
    ],
    blocks: [
      {
        name: "carousel-hero",
        instances: [".carousel.cmp-carousel--hero"]
      },
      {
        name: "columns-featured",
        instances: [".teaser.cmp-teaser--featured"]
      },
      {
        name: "cards-index",
        instances: [".cmp-image-list"]
      },
      {
        name: "hero-banner",
        instances: [".teaser.cmp-teaser--hero.cmp-teaser--imagebottom"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Hero Carousel",
        selector: ".carousel.cmp-carousel--hero",
        style: null,
        blocks: ["carousel-hero"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Featured Article",
        selector: ".teaser.cmp-teaser--featured",
        style: null,
        blocks: ["columns-featured"],
        defaultContent: []
      },
      {
        id: "section-3",
        name: "Recent Articles",
        selector: "#container-9c4899b718 .cmp-image-list",
        style: null,
        blocks: ["cards-index"],
        defaultContent: ["#title-c2d2b28d00", "#button-2e6d32893a"]
      },
      {
        id: "section-4",
        name: "Next Adventures",
        selector: ".teaser.cmp-teaser--hero.cmp-teaser--imagebottom",
        style: null,
        blocks: ["hero-banner"],
        defaultContent: ["#title-971080d74b"]
      },
      {
        id: "section-5",
        name: "Where do you want to go? (Adventures Grid)",
        selector: "#container-4d3fed64ff .cmp-image-list",
        style: null,
        blocks: ["cards-index"],
        defaultContent: ["#title-ca6ac0fe65", "#button-b6562c963d"]
      }
    ]
  };
  var parsers = {
    "carousel-hero": parse,
    "columns-featured": parse2,
    "cards-index": parse3,
    "hero-banner": parse4
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
  var import_home_page_default = {
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
  return __toCommonJS(import_home_page_exports);
})();
