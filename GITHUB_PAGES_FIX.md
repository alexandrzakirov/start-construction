# GitHub Pages fix

This version is prepared for GitHub Pages project URL:

`https://YOUR_USERNAME.github.io/start-construction/`

## What was fixed

- `vite.config.js` now has `base: '/start-construction/'`.
- Removed `minify: 'terser'` because `terser` was not installed.
- `index.html`, `manifest.json`, and `sw.js` now use safe relative paths.
- Added `.github/workflows/deploy.yml` for automatic deployment to GitHub Pages.

## How to update GitHub

1. Replace the files in your repository with these files.
2. Commit and push to the `main` branch.
3. In GitHub: Settings → Pages → Source → GitHub Actions.
4. Open the site at:

`https://YOUR_USERNAME.github.io/start-construction/`

If your repository has a different name, change this line in `vite.config.js`:

```js
base: '/start-construction/',
```

to:

```js
base: '/YOUR_REPOSITORY_NAME/',
```
