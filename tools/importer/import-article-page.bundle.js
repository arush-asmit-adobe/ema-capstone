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

  // tools/importer/import-article-page.js
  var import_article_page_exports = {};
  __export(import_article_page_exports, {
    default: () => import_article_page_default
  });

  // tools/importer/parsers/quote-pull.js
  function parse(element, { document }) {
    const quote = element.querySelector("blockquote");
    const attribution = element.querySelector("p");
    if (!quote && !attribution) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (quote) cells.push([quote]);
    if (attribution) cells.push([attribution]);
    const wrapper = element.closest(".text") || element.parentElement || element;
    const isGreyBox = element.classList.contains("cmp-text--quote") || wrapper && wrapper.classList && wrapper.classList.contains("cmp-text--quote");
    const name = isGreyBox ? "quote-pull" : "quote-pull (plain)";
    const block = WebImporter.Blocks.createBlock(document, { name, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-profile.js
  var CARD_SELECTOR = ".cmp-experience-fragment--contributor";
  function isCard(node) {
    return !!node && node.nodeType === 1 && node.matches && node.matches(CARD_SELECTOR);
  }
  function buildContributorRow(card, document) {
    const img = card.querySelector(".cmp-image__image, img");
    const body = [];
    const name = card.querySelector(".cmp-title:not(.cmp-title--black) h3, h3");
    const role = card.querySelector(".cmp-title--black h5, h5");
    if (name) {
      const h3 = document.createElement("h3");
      h3.textContent = name.textContent.trim();
      body.push(h3);
    }
    if (role) {
      const h5 = document.createElement("h5");
      h5.textContent = role.textContent.trim();
      body.push(h5);
    }
    const links = Array.from(card.querySelectorAll(".cmp-buildingblock--btn-list a, a.cmp-button"));
    links.forEach((a) => {
      const link = document.createElement("a");
      link.href = a.getAttribute("href") || "#";
      const txt = (a.querySelector(".cmp-button__text") || a).textContent.trim();
      link.textContent = txt || "Link";
      body.push(link);
    });
    return [img || "", body.length ? body : ""];
  }
  function buildBylineRow(byline, document) {
    const img = byline.querySelector("img");
    const body = [];
    const name = byline.querySelector(".cmp-byline__name");
    const role = byline.querySelector(".cmp-byline__occupations");
    if (name) {
      const h3 = document.createElement("h3");
      h3.textContent = name.textContent.trim();
      body.push(h3);
    }
    if (role) {
      const h5 = document.createElement("h5");
      h5.textContent = role.textContent.trim();
      body.push(h5);
    }
    const scope = byline.closest(".cmp-experiencefragment, .cmp-container") || byline.parentElement;
    const links = Array.from((scope || byline).querySelectorAll(".cmp-buildingblock--btn-list a, a.cmp-button"));
    links.forEach((a) => {
      const link = document.createElement("a");
      link.href = a.getAttribute("href") || "#";
      const txt = (a.querySelector(".cmp-button__text") || a).textContent.trim();
      link.textContent = txt || "Link";
      body.push(link);
    });
    return [img || "", body.length ? body : ""];
  }
  function parse2(element, { document }) {
    if (element.matches && element.matches(".cmp-byline")) {
      const cells2 = [buildBylineRow(element, document)];
      const block2 = WebImporter.Blocks.createBlock(document, { name: "cards-profile", cells: cells2 });
      const target = element.closest(".cmp-experiencefragment") || element;
      target.replaceWith(block2);
      return;
    }
    if (isCard(element.previousElementSibling)) {
      element.remove();
      return;
    }
    const run = [element];
    let next = element.nextElementSibling;
    while (next) {
      if (isCard(next)) {
        run.push(next);
        next = next.nextElementSibling;
      } else if (!next.textContent.trim()) {
        next = next.nextElementSibling;
      } else {
        break;
      }
    }
    const cells = run.map((card) => buildContributorRow(card, document));
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-profile", cells });
    element.replaceWith(block);
    run.slice(1).forEach((card) => card.remove());
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

  // tools/importer/import-article-page.js
  function articleCleanupTransformer(hookName, element) {
    if (hookName !== "beforeTransform") return;
    WebImporter.DOMUtils.remove(element, [
      ".breadcrumb",
      ".cmp-contentfragment__title",
      "aside.cmp-layoutcontainer--sidebar"
    ]);
  }
  var PAGE_TEMPLATE = {
    name: "article-page",
    description: "WKND magazine article detail page: full-width masthead lead photo, article body (title, byline, intro, a grey pull-quote callout, and three underlined-H2 + image + paragraph units), and an author byline profile card at the end.",
    urls: [
      "https://wknd.site/us/en/magazine/western-australia.html"
    ],
    blocks: [
      {
        name: "quote-pull",
        instances: [".cmp-text:has(blockquote)"]
      },
      {
        name: "cards-profile",
        instances: [".cmp-byline"]
      }
    ],
    // Section selectors are class/tag-based so they match ANY article in this
    // template (western-australia, arctic-surfing, …), not page-specific IDs.
    // The section transformer places an <hr> before each section's first element:
    //   - section 1 (masthead) is the first section, so it gets no break;
    //   - section 2 (article body) breaks before the article <h1>, splitting the
    //     full-width masthead image off into its own section.
    sections: [
      {
        id: "section-1",
        name: "Masthead Lead Image",
        selector: ".cmp-image",
        style: null,
        blocks: [],
        defaultContent: [".cmp-image"]
      },
      {
        id: "section-2",
        name: "Article Body",
        selector: "h1",
        style: null,
        blocks: ["quote-pull"],
        defaultContent: ["h1"]
      },
      {
        id: "section-3",
        name: "Author Byline Card",
        selector: ".cmp-byline",
        style: null,
        blocks: ["cards-profile"],
        defaultContent: []
      }
    ]
  };
  var parsers = {
    "quote-pull": parse,
    "cards-profile": parse2
  };
  var transformers = [
    articleCleanupTransformer,
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
  var import_article_page_default = {
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
  return __toCommonJS(import_article_page_exports);
})();
