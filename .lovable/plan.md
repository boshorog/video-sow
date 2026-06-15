
## SEO Upgrades for Imported Articles

Three improvements to make Video Sow articles index better in Google and surface as rich results.

---

### 1. Crawlable transcript (no `display:none`)

Today the transcript uses a `<details>` element. Google does index `<details>`/`<summary>` content (modern Googlebot expands them), but the more robust pattern is a CSS-only collapse that keeps the text always in the DOM and unhidden.

**Approach:** Replace `videosow_render_transcript_block()` (`videosow.php` ~4224) `details` mode with a checkbox-toggle pattern:

```html
<section class="videosow-transcript" itemprop="transcript">
  <input type="checkbox" id="vs-tr-{post_id}" class="videosow-transcript-toggle" hidden>
  <label for="vs-tr-{post_id}" class="videosow-transcript-summary">Transcript</label>
  <div class="videosow-transcript-body">
     <p>…full transcript paragraphs…</p>
  </div>
</section>
```

CSS uses `max-height:0; overflow:hidden; transition:max-height .3s` on the body by default, and `:checked ~ .videosow-transcript-body { max-height:none }` to expand. No `display:none`, no `visibility:hidden`, no JS. Content remains in the DOM, fully visible to crawlers, while users still see an expandable block. Add `itemprop="transcript"` so it pairs with the VideoObject schema below.

Alternative options I considered (in case you prefer one):
- Keep `<details>` (Google handles it well now but ranking weight is slightly lower).
- Always-expanded transcript with no toggle (best for SEO, worst for UX on long videos).

Recommended: the checkbox-toggle pattern above. It gives the SEO weight of always-visible content with the UX of a collapsible.

---

### 2. VideoObject JSON-LD per article

The biggest opportunity. Inject `<script type="application/ld+json">` in `wp_head` on every single `videosow_video` article.

**Source fields (already stored per post):**
- `name` → post title
- `description` → meta description (see §3) or trimmed excerpt
- `thumbnailUrl` → featured image (multiple sizes)
- `uploadDate` → `_videosow_yt_published` (ISO 8601)
- `contentUrl` / `embedUrl` → `https://www.youtube.com/watch?v={_videosow_yt_video_id}` and `https://www.youtube.com/embed/{id}`
- `interactionStatistic` → `_videosow_yt_views` as `WatchAction` count
- `transcript` → raw text from `_videosow_transcript` (when present)
- `duration` → ISO 8601 (e.g. `PT5M30S`). Not stored today; we'll capture `contentDetails.duration` during import (one extra field on the existing YouTube videos API call) and save to `_videosow_yt_duration`. For already-imported posts, a one-shot backfill action can fill it lazily on first article view.

**Implementation:** New `videosow_single_video_jsonld()` hooked to `wp_head` priority 5, guarded by `is_singular('videosow_video')`. Output via `wp_json_encode( …, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE )`. Skip emission if no `_videosow_yt_video_id`.

---

### 3. Per-article meta description (with SEO plugin auto-detect)

**New Setup Roadmap step** ("SEO integration"), inserted in `buildShowcaseSteps` (`src/components/dashboard/TodoVariants.tsx`) between `playlist` and `firstimport`. The step:

- Runs an auto-detect on load (server-side) and reports:
  - "No SEO plugin detected — Video Sow will write the meta description directly." (done = true, informational)
  - "Detected: Yoast SEO — descriptions will be written to `_yoast_wpseo_metadesc`." (done = true)
  - "Detected: RankMath / AIOSEO / SEOPress / The SEO Framework / Squirrly / Slim SEO" — same pattern.

**Detection** (`videosow_detect_seo_plugin()`):
- Yoast: `defined('WPSEO_VERSION')`
- Rank Math: `class_exists('RankMath')`
- All in One SEO: `defined('AIOSEO_VERSION')`
- SEOPress: `defined('SEOPRESS_VERSION')`
- The SEO Framework: `defined('THE_SEO_FRAMEWORK_PRESENT')`
- Squirrly SEO: `defined('SQ_PLUGIN_NAME')`
- Slim SEO: `defined('SLIM_SEO_VER')`

**Writing the description** (during import, after content is built, in `videosow_import_one_video()` ~3293):
1. Derive `$meta_desc`: first 155 chars of plain-text content (strip transcript + shortcodes + HTML), trimmed on word boundary.
2. Save canonical copy to `_videosow_meta_description` post meta.
3. Mirror to the active SEO plugin's field:
   - Yoast → `_yoast_wpseo_metadesc`
   - Rank Math → `rank_math_description`
   - AIOSEO → `aioseo_posts.description` via `aioseo()->meta->metaData->updatePostMeta()` if available, else postmeta `_aioseo_description` fallback
   - SEOPress → `_seopress_titles_desc`
   - SEO Framework → `_genesis_description`
   - Squirrly → `_sq_post_keywords` description field (or its meta API if loaded)
   - Slim SEO → `slim_seo` array meta
4. **Fallback when no plugin detected:** hook `wp_head` priority 1 on `is_singular('videosow_video')` to emit `<meta name="description" content="{_videosow_meta_description}">`.

A "Re-generate descriptions" button (in Tasks page or this roadmap step) backfills already-imported posts.

---

### Other touch-ups

- Bump plugin version to **1.2.33** in `videosow.php`, `src/config/pluginIdentity.ts`, `readme.txt`.
- Update `readme.txt` changelog.

### Files to change

- `videosow.php` — transcript renderer (§1), new VideoObject JSON-LD (§2), `videosow_detect_seo_plugin()`, meta-description writer + fallback `wp_head`, capture `contentDetails.duration` during import, AJAX handler `videosow_detect_seo` for the new roadmap step, AJAX handler `videosow_regenerate_descriptions` for backfill.
- `src/components/dashboard/TodoVariants.tsx` — new `seo` step.
- `src/components/pages/DashboardPage.tsx` — wire the new step (detection state via existing config/AJAX).
- `src/hooks/useImporter.ts` — add `seoPlugin` field to config and a `detectSeoPlugin()` action.
- `src/config/pluginIdentity.ts`, `readme.txt` — version bump + changelog.

### Out of scope (ask if you want them)

- BreadcrumbList JSON-LD on the archive (separate win).
- XML video sitemap entries.
- OpenGraph `video:*` tags on single articles.
