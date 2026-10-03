# Project architecture rules

- Premium importer Tasks must be gated in both React and PHP; UI-only license checks are not authorization.
- The advanced-processing provider is an internal implementation detail; credentials stay in WordPress settings and requests run only through server-side PHP.