# Pro Tasks and OpenRouter

The requested pieces already exist in the current project, so this work will complete and harden them rather than duplicate them.

## Changes

- Keep the existing bottom-right Free / Pro preview switcher, matching the PDF Gallery behavior and only showing it in the development preview.
- Keep **Tasks** immediately after **Import**, visible only when the Pro license is active.
- Complete the existing Tasks workspace with:
  - ordered Simple Tasks;
  - OpenRouter-powered AI Tasks;
  - model presets and advanced model selection;
  - reusable prompt templates, transcript limits, tag restrictions, and AI excerpts;
  - saved settings and English interface text.
- Enforce Pro access in WordPress processing, not only in the visible menu, so Free installations cannot trigger AI Tasks through crafted settings.
- Correct same-page saving for AI templates and preserve the existing toast confirmations.
- Bump the plugin version and update the changelog.

## Verification

- Check Free preview: switcher works and Tasks is hidden.
- Check Pro preview: Tasks appears after Import and all controls save correctly.
- Verify PHP syntax and current preview build status.
- Inspect desktop and mobile layouts for overflow or overlap.

## Technical notes

- OpenRouter keys remain stored in WordPress settings and are used only by server-side PHP requests.
- Existing importer processing order remains: Simple Tasks first, AI Tasks second.
- No Lovable Cloud or additional backend is required for this WordPress plugin flow.
