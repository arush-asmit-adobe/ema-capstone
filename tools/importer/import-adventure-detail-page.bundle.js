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

  // tools/importer/import-adventure-detail-page.js
  var import_adventure_detail_page_exports = {};
  __export(import_adventure_detail_page_exports, {
    default: () => import_adventure_detail_page_default
  });

  // tools/importer/parsers/carousel-mini.js
  function parse(element, { document }) {
    let slides = Array.from(element.querySelectorAll(".cmp-carousel__item"));
    if (!slides.length) {
      slides = Array.from(element.querySelectorAll(".cmp-image, .image"));
    }
    const cells = [];
    slides.forEach((slide) => {
      const image = slide.querySelector(".cmp-image img, .cmp-image__image, img");
      if (!image) return;
      cells.push([image]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-mini", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/table-facts.js
  function parse2(element, { document }) {
    const facts = Array.from(
      element.querySelectorAll(".cmp-contentfragment__element")
    );
    const cells = [];
    facts.forEach((fact) => {
      const labelEl = fact.querySelector(".cmp-contentfragment__element-title, dt");
      const valueEl = fact.querySelector(".cmp-contentfragment__element-value, dd");
      const label = labelEl ? (labelEl.textContent || "").trim() : "";
      const value = valueEl ? (valueEl.textContent || "").trim() : "";
      if (!label && !value) return;
      cells.push([label, value]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "table-facts", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-adventure.js
  function parse3(element, { document }) {
    const labels = Array.from(
      element.querySelectorAll(".cmp-tabs__tablist .cmp-tabs__tab")
    );
    const panels = Array.from(
      element.querySelectorAll(":scope > .cmp-tabs__tabpanel")
    );
    const cells = [];
    labels.forEach((labelEl, i) => {
      const label = (labelEl.textContent || "").trim();
      const panel = panels[i];
      const contentCell = [];
      if (panel) {
        const body = panel.querySelector(".cmp-contentfragment__elements") || panel;
        const nodes = Array.from(
          body.querySelectorAll("p, img, ul, ol, h1, h2, h3, h4, h5, h6, b, strong, div")
        );
        const seen = /* @__PURE__ */ new Set();
        nodes.forEach((node) => {
          if (node.classList && node.classList.contains("cmp-contentfragment__title")) return;
          if (node.tagName === "IMG") {
            if (seen.has(node)) return;
            seen.add(node);
            contentCell.push(node);
            return;
          }
          if (node.tagName === "DIV") {
            if (node.querySelector("div, p, ul, ol, img, h1, h2, h3, h4, h5, h6")) return;
            const divText = (node.textContent || "").replace(/ /g, " ").trim();
            if (!divText) return;
            const p = document.createElement("p");
            p.innerHTML = node.innerHTML;
            seen.add(node);
            contentCell.push(p);
            return;
          }
          if ((node.tagName === "B" || node.tagName === "STRONG") && node.closest("p")) return;
          const text = (node.textContent || "").replace(/ /g, " ").trim();
          const hasImg = node.querySelector && node.querySelector("img");
          if (!text && !hasImg) return;
          const alreadyCaptured = contentCell.some(
            (kept) => kept.nodeType === 1 && kept.contains && kept.contains(node)
          );
          if (alreadyCaptured) return;
          seen.add(node);
          contentCell.push(node);
        });
      }
      if (!label && !contentCell.length) return;
      cells.push([label, contentCell.length ? contentCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs-adventure", cells });
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

  // tools/importer/import-adventure-detail-page.js
  var ADVENTURE_META = {
    "bali-surf-camp": { category: "Surfing", featured: "" },
    "beervana-portland": { category: "Travel", featured: "" },
    "climbing-new-zealand": { category: "Climbing", featured: "" },
    "colorado-rock-climbing": { category: "Climbing", featured: "" },
    "cycling-southern-utah": { category: "", featured: "" },
    "cycling-tuscany": { category: "Cycling, Travel", featured: "" },
    "downhill-skiing-wyoming": { category: "Skiing", featured: "" },
    "gastronomic-marais-tour": { category: "Travel", featured: "" },
    "napa-wine-tasting": { category: "Travel", featured: "" },
    "riverside-camping-australia": { category: "Travel", featured: "" },
    "ski-touring-mont-blanc": { category: "Skiing", featured: "" },
    "surf-camp-costa-rica": { category: "Surfing", featured: "" },
    "tahoe-skiing": { category: "Skiing", featured: "4" },
    "west-coast-cycling": { category: "Cycling", featured: "3" },
    "whistler-mountain-biking": { category: "Cycling", featured: "2" },
    "yosemite-backpacking": { category: "Travel", featured: "1" }
  };
  function appendAdventureMetadata(main, document, slug) {
    const meta = ADVENTURE_META[slug];
    if (!meta) return;
    const tables = [...main.querySelectorAll("table")];
    const metaTable = tables.reverse().find((t) => {
      const first = t.querySelector("tr td, tr th");
      return first && /^metadata$/i.test((first.textContent || "").trim());
    });
    if (!metaTable) return;
    const tbody = metaTable.querySelector("tbody") || metaTable;
    const addRow = (key, value) => {
      if (value === void 0 || value === null || `${value}`.trim() === "") return;
      const tr = document.createElement("tr");
      const k = document.createElement("td");
      k.textContent = key;
      const v = document.createElement("td");
      v.textContent = value;
      tr.append(k, v);
      tbody.append(tr);
    };
    addRow("category", meta.category);
    addRow("featured", meta.featured);
  }
  function adventureCleanupTransformer(hookName, element) {
    if (hookName !== "beforeTransform") return;
    element.querySelectorAll(".cmp-title").forEach((t) => {
      const heading = t.querySelector("h1, h2, h3, h4, h5, h6");
      if (heading && /share this adventure/i.test(heading.textContent || "")) {
        t.remove();
      }
    });
    WebImporter.DOMUtils.remove(element, [
      ".breadcrumb",
      ".sharing"
    ]);
  }
  var PAGE_TEMPLATE = {
    name: "adventure-detail-page",
    description: 'WKND adventure detail page: full-width image masthead carousel, page title (H1), an adventure spec fact-sheet (label/value table), and an interactive Overview/Itinerary/What to Bring tab switcher. The "Share this Adventure" widget is excluded as chrome.',
    urls: [
      "https://wknd.site/us/en/adventures/bali-surf-camp.html",
      "https://wknd.site/us/en/adventures/beervana-portland.html",
      "https://wknd.site/us/en/adventures/climbing-new-zealand.html",
      "https://wknd.site/us/en/adventures/colorado-rock-climbing.html",
      "https://wknd.site/us/en/adventures/cycling-southern-utah.html",
      "https://wknd.site/us/en/adventures/cycling-tuscany.html",
      "https://wknd.site/us/en/adventures/downhill-skiing-wyoming.html",
      "https://wknd.site/us/en/adventures/gastronomic-marais-tour.html",
      "https://wknd.site/us/en/adventures/napa-wine-tasting.html",
      "https://wknd.site/us/en/adventures/riverside-camping-australia.html",
      "https://wknd.site/us/en/adventures/ski-touring-mont-blanc.html",
      "https://wknd.site/us/en/adventures/surf-camp-costa-rica.html",
      "https://wknd.site/us/en/adventures/tahoe-skiing.html",
      "https://wknd.site/us/en/adventures/west-coast-cycling.html",
      "https://wknd.site/us/en/adventures/whistler-mountain-biking.html",
      "https://wknd.site/us/en/adventures/yosemite-backpacking.html"
    ],
    blocks: [
      {
        name: "carousel-mini",
        instances: [".carousel.cmp-carousel--mini"]
      },
      {
        name: "table-facts",
        instances: [".contentfragment.cmp-contentfragment--elements"]
      },
      {
        name: "tabs-adventure",
        instances: [".cmp-tabs"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Masthead Image Carousel",
        selector: ".carousel.cmp-carousel--mini",
        style: null,
        blocks: ["carousel-mini"],
        defaultContent: []
      },
      {
        // Portable across all adventure detail pages: break before the page H1
        // (page-specific title ids differ per page). This splits the masthead
        // carousel off into its own section, matching the article-page pattern.
        id: "section-2",
        name: "Page Title",
        selector: "h1",
        style: null,
        blocks: [],
        defaultContent: ["h1"]
      },
      {
        id: "section-3",
        name: "Adventure Details Fact-Sheet",
        selector: ".contentfragment.cmp-contentfragment--elements",
        style: null,
        blocks: ["table-facts"],
        defaultContent: []
      },
      {
        id: "section-4",
        name: "Adventure Detail Tabs",
        selector: ".cmp-tabs",
        style: null,
        blocks: ["tabs-adventure"],
        defaultContent: []
      }
    ]
  };
  var parsers = {
    "carousel-mini": parse,
    "table-facts": parse2,
    "tabs-adventure": parse3
  };
  var transformers = [
    adventureCleanupTransformer,
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
  var import_adventure_detail_page_default = {
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
      const slug = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "").split("/").pop();
      appendAdventureMetadata(main, document, slug);
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
  return __toCommonJS(import_adventure_detail_page_exports);
})();
