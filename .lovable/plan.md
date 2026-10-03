# Reorganize Tasks menu

## Changes
- Rename the existing cards to **Simple Tasks** and **Advanced Tasks**.
- Remove user-facing OpenRouter references while keeping the current provider integration internal and retaining the API Key field.
- Add a third **Transcripts** card to Tasks containing transcript fetching, language, display, connection, and diagnostic options.
- Remove those transcript controls from Settings so they have one clear home.
- Update Dashboard roadmap navigation so transcript actions open and highlight the new Transcripts card.
- Keep all existing saved values and import behavior unchanged.

## Technical notes
- Export a reusable transcript section from the importer settings module and render it in Tasks.
- Continue enforcing Pro access in both React and PHP.
- Keep model discovery and provider routing as internal implementation details, with neutral user-facing labels.

## Verification
- Verify all three cards render in Pro mode and Tasks remains hidden in Free mode.
- Verify transcript controls update the same configuration fields and roadmap highlighting targets the new card.
- Check desktop layout, TypeScript, PHP syntax, and preview build status.
