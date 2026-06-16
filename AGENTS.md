# AGENTS.md

## Cursor Cloud specific instructions

This repository is a **GitHub profile README repo** (`safann/safann`). Its only content is
`README.md`, which GitHub renders on the user's profile page. There is no application source
code, no package manifest, no automated tests, no linter, and no build step.

The "product" is the rendered Markdown. The local dev workflow is previewing the
GitHub-flavored Markdown exactly as GitHub renders it, using [`grip`](https://github.com/joeyespo/grip).

- A Python virtualenv lives at `.venv/` (git-ignored). Activate it with `source .venv/bin/activate`.
- Preview server (live reload): `grip README.md 0.0.0.0:6419`, then open `http://localhost:6419/`.
- Export to a static HTML file: `grip README.md --export /tmp/readme_preview.html`.
- `grip` renders by calling GitHub's Markdown API, so network access is required. Unauthenticated
  requests are rate-limited; set `GRIP_GITHUB_API_URL`/a token (`grip --user ... --pass ...`) only if
  you hit rate limits.
- There is nothing to lint, test, or build. Editing `README.md` is the only development task.
