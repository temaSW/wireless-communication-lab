# Tools

Use these helpers before copying repeated theme HTML by hand.

- `theme-page.template.html` is the shared template for theme pages.
- `new-theme-page.ps1` creates the same page for all four theme previews.
- `update-cache-version.ps1` updates CSS/JS query versions across working HTML files.
- `build-content.js` generates `js/lab-content.js` from `content/*.md`.

Generated theme pages still use the shared content source in `js/lab-content.js`
and the shared renderer in `js/render-theme.js`.

Site content belongs in `content/*.md`. Do not edit generated
`js/lab-content.js` by hand.
