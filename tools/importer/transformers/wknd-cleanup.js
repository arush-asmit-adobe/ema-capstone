/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND site-wide cleanup.
 *
 * Removes non-authorable site chrome (header, footer, tracking iframe, mobile
 * nav) and presentational separators so the import contains only page-level
 * authorable content.
 *
 * All selectors below were verified against migration-work/cleaned.html for the
 * WKND homepage (https://wknd.site/us/en.html). None are guessed.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Elements that would interfere with block parsing / block matching.
    // Verified in cleaned.html:
    //   - iframe#destination_publishing_iframe_wkndsite_0 (line 566): Adobe
    //     demdex ID-sync tracking iframe, non-authorable.
    //   - #toggleNav (line 568): mobile nav toggle button, part of site shell.
    //   - #mobileNav (line 574): mobile navigation menu, part of site shell.
    WebImporter.DOMUtils.remove(element, [
      '#destination_publishing_iframe_wkndsite_0',
      '#toggleNav',
      '#mobileNav',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome. Verified in cleaned.html:
    //   - header.cmp-experiencefragment--header (line 5): sign-in buttons,
    //     language navigation, logo, main navigation, and search.
    //   - footer.cmp-experiencefragment--footer (line 471): footer logo, nav,
    //     social buttons, and copyright.
    // Both are AEM experience fragments (global chrome), not page content.
    WebImporter.DOMUtils.remove(element, [
      'header.cmp-experiencefragment--header',
      'footer.cmp-experiencefragment--footer',
    ]);

    // Presentational separators used only as visual dividers between content
    // regions. Verified in cleaned.html: .separator wrappers around
    //   - #separator-bd766ae5bf (lines 351-355)
    //   - #separator-e8e691c190 (lines 460-464)
    // These are superseded by EDS section breaks (added by the section
    // transformer), so removing them avoids stray <hr>/tables in the import.
    WebImporter.DOMUtils.remove(element, ['.separator']);

    // Strip leftover non-authorable safe elements. Verified in cleaned.html:
    //   - <meta> tags nested inside cmp-image blocks (e.g. lines 183, 204).
    //   - <iframe> (any remaining).
    WebImporter.DOMUtils.remove(element, ['meta', 'iframe']);

    // Clean AEM data-layer / accessibility attributes that are not authorable.
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('data-cmp-data-layer');
      el.removeAttribute('data-cmp-hook-image');
      el.removeAttribute('data-cmp-hook-teaser');
      el.removeAttribute('data-cmp-clickable');
      el.removeAttribute('data-cmp-lazy');
    });
  }
}
