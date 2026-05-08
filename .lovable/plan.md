## Goal

Make the archive page reliably render inside the active theme's normal layout (header, menu, sidebar, footer all intact), regardless of which theme the site uses, plus a small UI tweak to the admin header.

## Why the archive currently breaks

Today the plugin tries to "guess" where to inject its toolbar/grid by walking the DOM at runtime:

- **Custom layouts (Magazine / List)** call `findArchiveAnchor()` and `getSlot()`, then fall back to `document.querySelector('main') || document.body` and physically `removeChild` the original `<article>` nodes. On themes whose article wrappers also contain header/footer/sidebar siblings (or where `<main>` doesn't exist), this rips out parts of the page chrome — that's why "only the toolbar and articles" remain.
- **Theme default mode** inserts the toolbar before the first `<article>`. On themes that render the site logo/menu inside the same parent as the first article, the toolbar lands among the header items.

There is no per-theme knowledge of where the post loop actually lives, so the same code can't be safe everywhere.

## Approach: a one-time Theme Structure Scan

Add a lightweight scanner that detects the active theme's archive structure *once* (on activation, on theme switch, or on demand), stores the resulting selectors as plugin options, and then uses those exact selectors on the public archive instead of guessing.

### What gets detected and stored

A new option `videosow_theme_map` (per active theme stylesheet slug) containing:

- `loop_container` — the element that holds the post loop (e.g. `main .site-main`, `#primary .content-area`, `.elementor-posts-container`).
- `article_selector` — the selector that matches each post card inside the loop.
- `article_wrapper` — the *parent of* `<article>` when the theme wraps cards in column DIVs (Bootstrap/Foundation/Elementor grids), so the right node is removed/replaced.
- `pagination_selector` — native pagination element to hide.
- `header_end_anchor` — last element of the site header, used so the toolbar is never injected above it in theme-default mode.
- `footer_start_anchor` — first element of the site footer, used as a hard stop so DOM cleanup never crosses into the footer.
- `sidebar_selector` — theme widget area, used by the existing "Show sidebar" toggles.
- `theme_slug`, `scanned_at`, `confidence` (high/medium/low).

### How the scan works

A new admin-side AJAX endpoint `videosow_ajax_scan_theme` opens the public sermon archive URL via `wp_remote_get()` (with a logged-in admin nonce so any private theme markup still renders), parses the returned HTML server-side using `DOMDocument`, and walks it with a prioritized selector list:

```text
loop:        main .site-main, #primary, #content .content-area,
             .elementor-posts-container, .ast-row, .fl-post-grid, body
article:     article.post, article[id^="post-"], .elementor-post,
             .ast-article-post, .fl-post
wrapper:     closest column ancestor (.col-*, .elementor-column,
             .wp-block-column, .ast-grid-common-col, etc.)
header end:  header#masthead :last-child, .site-header :last-child
footer start:footer#colophon :first-child, .site-footer :first-child
pagination:  .nav-links, .pagination, .page-navigation
sidebar:     #secondary, aside.widget-area, .sidebar
```

Each candidate gets a confidence score; the best match for each role is saved. If no `<article>` is matched (rare/odd themes), `confidence = low` and the public layout falls back to "Theme default" automatically.

### When the scan runs

1. **Plugin activation** — `register_activation_hook` schedules a one-shot scan on next admin load.
2. **Theme switch** — `switch_theme` action triggers a re-scan.
3. **Manual** — new tile in *Settings → Diagnostic tools* (the 6th tile) called **"Scan theme structure"** with a "Re-scan now" button, status badge (e.g. "Last scan: today, confidence: high"), and a collapsible details view showing the saved selectors.

### How the public archive uses the map

`videosow.php` archive script gets a new `THEME_MAP` JSON injected (already does this for `CONFIG_LAYOUT` / `CONFIG_EXCERPT_WORDS`). The init code is rewritten to:

- **Theme default**: insert the toolbar inside `loop_container`, before its first child — never above it. If `loop_container` is missing, do nothing destructive (toolbar still appears, but no DOM moves into the header).
- **Custom layouts**: build the synthetic grid, insert it inside `loop_container`, then remove only nodes matched by `article_selector` *and* contained within `loop_container`. Never touch nodes outside that container, so header/menu/footer/sidebar are guaranteed safe.
- **Confidence = low**: silently force theme-default behavior even if the user picked Magazine/List, and surface a small admin notice ("Couldn't reliably detect your theme's structure — using theme default. Re-run the scan from Settings → Diagnostic tools.").

### Diagnostic tools — 6th tile

Add to `src/components/importer/ImporterSettings.tsx` (after "Test playlist YouTube"):

- Title: **Scan theme structure**
- Description: "Detects where your active theme renders its post loop so the archive page can be inserted without breaking your site's header, menu or footer. Re-run after switching themes or installing a major theme update."
- Shows: active theme name, last scan date, confidence badge, summary of detected `loop_container` and `article_selector`.
- Buttons: **Re-scan now** (calls `videosow_ajax_scan_theme`), **View details** (collapsible JSON of the saved map).

## Admin header tweak

In `src/pages/Index.tsx` line 73, change `gap-3` to `gap-2` so the plugin name sits a little closer to the icon. (Visual-only change.)

## Version + docs

- Bump `PLUGIN_VERSION` and `VIDEOSOW_VERSION` to **1.2.6**.
- Add a `readme.txt` changelog entry covering the theme scanner, the new diagnostic tile, and the layout-safety fixes.

## Files to modify

- `videosow.php` — new scan AJAX, `videosow_theme_map` option, switch_theme hook, rewritten archive `init()` using `THEME_MAP`, version bump.
- `src/components/importer/ImporterSettings.tsx` — 6th diagnostic tile.
- `src/components/importer/ImporterWidget.tsx` — wire scan handler/state if needed.
- `src/pages/Index.tsx` — `gap-3` → `gap-2`.
- `src/config/pluginIdentity.ts` — version bump.
- `readme.txt` — changelog.

## Answer to "Is this doable?"

Yes. Server-side HTML parsing with `DOMDocument` against a prioritized selector list is a standard technique and runs in well under a second per scan. It will not be 100% perfect on every exotic page builder, but with the "low confidence → safe fallback" rule the archive will never again wipe out the site chrome — the worst case becomes "looks like the theme default", which is always safe.