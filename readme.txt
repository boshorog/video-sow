=== Video Sow – Turn YouTube Playlists into WordPress Articles ===
Contributors: kindpixels
Plugin URI: https://kindpixels.dev/plugins/video-sow/
Tags: youtube, playlist, importer, articles, transcripts
Requires at least: 5.8
Tested up to: 6.9
Stable tag: 1.1.3
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
