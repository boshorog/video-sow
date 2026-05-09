=== Video Sow – Turn YouTube Playlists into WordPress Articles ===
Contributors: kindpixels
Plugin URI: https://kindpixels.dev/plugins/video-sow/
Tags: youtube, playlist, importer, articles, transcripts
Requires at least: 5.8
Tested up to: 6.9
Stable tag: 1.2.12
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Automatically convert YouTube playlist videos into WordPress articles, with optional transcript extraction and per-video draft generation.

== Description ==

Video Sow watches one or more YouTube playlists and turns every video into a WordPress article: title, description, embedded player, and (in Pro) the full transcript for SEO. Set an interval, paste a YouTube Data API v3 key, and Video Sow handles the rest in the background.

= Key Features =

* **Playlist Import** – Paste any YouTube playlist URL or ID and import each video as a WordPress post.
* **Automatic Sync** – Schedule fetches by minutes, hours, or days; relaxed-mode pauses keep you within the YouTube quota.
* **Per-Video Article** – Title, description, thumbnail, and embedded YouTube player are generated automatically.
* **Archive View** – See every imported article with its source video, status, and last sync time.
* **Diagnostic Tools** – Test API keys, scan playlists, and inspect transcript availability without leaving the admin.
* **YouTube Data API v3** – Uses the official Google API for reliable, quota-aware fetching.

= Free vs Pro =

**Free version includes:**
* One YouTube playlist
* Automatic sync with custom interval, batch size, and relaxed pauses
* Per-video WordPress article generation
* Archive of imported articles
* Diagnostic tools

**Pro version adds:**
* Unlimited playlists with drag-to-reorder priority
* Per-playlist statistics and switcher on the Import page
* Transcript extraction (multi-language) for SEO-rich article bodies
* YouTube OAuth as a transcript backup source
* Tasks workflow for content automation
* Priority support

For a complete comparison, see [the full feature table](https://kindpixels.dev/plugins/video-sow#comparison).

== Installation ==

1. In your WordPress dashboard, go to "Plugins → Add New" and search for "Video Sow", then click "Install Now" and "Activate".
2. Alternatively, upload the `video-sow` folder to `/wp-content/plugins/` via FTP, then activate it from the "Plugins" menu.
3. Open the new "Video Sow" admin menu and paste a YouTube Data API v3 key in Settings.
4. Add a playlist in Settings, configure the sync interval, then run your first import from the Import page.

== Frequently Asked Questions ==

= Where do I get a YouTube Data API v3 key? =

Generate one in Google Cloud Console → APIs & Services → Credentials, after enabling the YouTube Data API v3 for your project.

= Does Video Sow change my existing posts? =

No. Each imported video becomes a new WordPress post. Re-running the sync skips videos that have already been imported.

= Can I import multiple playlists? =

The Free version supports one playlist. Video Sow Pro supports unlimited playlists with drag-to-reorder priority and a per-playlist switcher on the Import page.

= How do transcripts work? =

In Pro, Video Sow fetches the transcript for each video (when available on YouTube) and embeds it in the post body to boost SEO. An optional YouTube OAuth connection can act as a backup source for transcripts that require authentication.

= What if I have more questions? =

Open the Documentation tab inside the plugin — it covers every setting, the diagnostic tools, and the Pro workflow.

== Changelog ==

= 1.2.12 =
* Dashboard "To do" card redesigned: single vertical timeline with large round icons, soft gradient background and a perfectly centered connector line with equal top/bottom gaps.
* Each step button now jumps to the relevant Settings/Tasks/Import section and pulses a highlight ring so it's instantly visible (theme scanner, API key, playlist, auto-sync, AI prompts, transcripts, first import).

= 1.2.11 =
* Archive toolbar polished: pill-shaped search input ("Search articles..."), no-wrap "Sort:" label, tighter alignment.
* Removed remaining blank space above archive toolbar/grid (collapses theme page-header/spacer wrappers).
* Article cards now include a "Read more" link with arrow icon after the excerpt on every layout.
* Wide list layout: vertically centered title/excerpt stack and full-height thumbnail (no more blank gaps above/below the cover).
* 2 / 3 column layouts: added breathing room between the cover image and the title.
* Breadcrumb separators on the archive page now match the spacing used elsewhere in the theme.

= 1.2.10 =
* Theme scanner now digs into linked theme CSS assets and inline styles, storing richer style rules, spacing hints, content wrappers, and breadcrumb selectors.
* Archive layout cleanup removes leftover theme spacers above the toolbar/grid and normalizes card ordering so thumbnails start at the top consistently.
* Custom archive cards now add safer title/image/excerpt spacing and stronger single-title/breadcrumb fixes for themes and SEO breadcrumb plugins.

= 1.2.9 =
* New Dashboard "To do" card: visual setup roadmap with check-off steps, progress bar, and per-step buttons (Scan theme → API key → Playlist → AI prompts → First import → Pro).
* Theme scanner now auto-runs before the first backfill / sync if it hasn't been done yet — no more empty layouts on themes that were never scanned.
* Import card shows a status banner indicating whether the theme structure has been scanned.

= 1.2.8 =
* Wide list layout now renders the thumbnail on the LEFT and the meta/title/excerpt stacked on the RIGHT (was stacking everything vertically).
* Toolbar tightened: shorter, slimmer search input; reduced bar padding; removed the empty top space above the toolbar/grid.
* Single article page: forces the FULL post title in the H1 (overrides theme/Elementor title length crops).
* Breadcrumb: configured archive title is now exposed via `post_type_archive_title` so themes & breadcrumb plugins (Yoast, RankMath, NavXT) show "Home › Funny" instead of just "Home".

= 1.2.7 =
* Theme scanner is now much deeper: probes multiple URLs (video archive, blog page, home, category) and picks the richest result.
* New generic card-pattern detector recognises post loops on themes that render cards as `<div>`s rather than `<article>` (e.g. Masco, Elementor, custom block themes).
* Theme styling registration: scanner now captures the theme's card / title / thumbnail / excerpt / meta class chains plus key CSS custom properties, and our custom layouts apply them so they inherit the theme's appearance.
* Diagnostic tile shows cards-found, scan-attempts log, and the captured styling hints.

= 1.2.6 =
* New: Theme structure scanner detects where your active theme renders its post loop and uses those exact selectors on the archive page, so layouts no longer wipe out your site header, menu or footer.
* Auto-runs on plugin activation and on theme switch; can be re-run manually from Settings → Diagnostic tools (6th tile).
* Custom archive layouts now restrict all DOM cleanup to the detected loop container — guaranteed safe fallback to "Theme default" when confidence is low.
* Theme default mode inserts the toolbar inside the loop container, never above the site header.
* Slightly tighter spacing between plugin icon and name in the admin header.

= 1.2.5 =
* Fixed plugin header version (build was still reporting 1.2.3).
* Import → Archive: view counts now read the correct meta key (no more zero views).
* Import → Archive: Edit post and View public post action buttons are now wired to real URLs.

= 1.2.4 =
* Default archive layout is now Magazine · 2 cols.
* Theme default layout keeps the theme's article rendering and shows the toolbar above it (no duplication).
* Custom layouts now physically remove the original theme article wrappers to prevent duplicates appearing under the footer.
* Slightly larger plugin logo in the admin header.

= 1.2.3 =
* Fixed archive toolbar rendering and live excerpt-length settings.
* Relaxed imports now show and honor Coffee break pauses between steps.
* Replaced remaining Romanian UI/status strings with English.

= 1.2.2 =
* Archive layout presets (Theme default, Magazine 2/3 cols, Wide list) that override theme styling.
* Truncated long video titles in admin Archive table.
* Updated playlist field placeholder.

= 1.2.1 =
* Import → Archive card now shows real imported articles (no longer falls back to sample data once imports exist)
* Deleting an imported article also removes its featured image attachment from the Media Library
* New: choose 1, 2, or 3 columns for the article cards layout on the archive page
* Single article page now enforces a proper 16:9 aspect ratio for the YouTube video embed
* Slug card on the Import page now uses the same large font as the other stat cards

= 1.1.8 =
* Admin sidebar reorganized: Dashboard (first), Articles, Tags
* Dashboard stats and Recent Activity now wired to live data
* Full English localization pass; sidebar settings moved under SEO; full-width content when sidebar is disabled

= 1.1.7 =
* Articles CPT now lives as a submenu of the Video Sow admin menu (renamed Videos → Articles)
* New: toggle to show/hide the theme sidebar on the archive page and on single article pages (hidden by default)

= 1.1.6 =
* Activation redirects to the Video Sow dashboard
* Playlist validator with green check in Settings; channel name shown above playlist on Import
* Slug change now flushes rewrite rules so the archive URL updates immediately
* Cancelled imports finalize cleanly; Archive card on Import page now shows live data

= 1.1.5 =
* Save button works in the WordPress admin context
* Pro build no longer reports as Free after upload-over install

= 1.1.4 =
* Packaging aligned with the standard build flow (`npm run package` produces Free and Pro ZIPs in `releases/`)
* Removed stale reference source file from the imported plugin

= 1.1.3 =
* Plugin slug standardized to `video-sow` for WordPress.org compliance
* Documentation and readme rewritten for the Video Sow workflow
* Minor stability improvements

= 1.1.2 =
* New: Per-playlist tracking — Total imported and Last sync update when switching playlists
* Improved: Import page first-run state is now per-playlist

= 1.1.1 =
* New: Drag-to-reorder playlists in Settings (Pro)
* Improved: Trimmed Archive sample data and removed redundant counter text

= 1.1.0 =
* Major cleanup: removed legacy gallery components in favor of the Video Sow workflow
* Rewrote Documentation and Pro pages for Video Sow
* Maintained Freemius licensing integration

= 1.0.3 =
* New: Settings tips card to better use horizontal space
* Improved: Archive placeholder now indicates real data appears after first import

= 1.0.2 =
* Free vs Pro split: Tasks menu and transcript extraction are now Pro-only
* Pro: multi-playlist support with add/remove from Settings

= 1.0.0 =
* Initial release

== Upgrade Notice ==

= 1.1.4 =
Packaging now matches the standard Free/Pro flow. Safe upgrade.

= 1.1.3 =
Standardized plugin slug to `video-sow` and refreshed documentation. Safe upgrade.

= 1.1.0 =
Major cleanup. Please review your settings after upgrading.

== Additional Information ==

= Source Code =

The full source code for this plugin is available on GitHub:
https://github.com/boshorog/video-sow

= Support =

For support, please use the WordPress.org support forum:
https://wordpress.org/support/plugin/video-sow/

= Privacy =

Video Sow communicates with the YouTube Data API v3 (and, in Pro, optionally with YouTube transcript endpoints) using the API key you provide. No data is sent to KindPixels servers. Imported article content is stored on your WordPress installation only.
