# Project architecture rules

- Premium importer Tasks must be gated in both React and PHP; UI-only license checks are not authorization.
- OpenRouter credentials are saved in WordPress settings and used only by server-side PHP requests.