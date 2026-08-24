# Tools

Use these helpers before copying repeated theme HTML by hand.

- `theme-page.template.html` is the shared template for theme pages.
- `new-theme-page.ps1` creates the same page for all four theme previews.
- `update-cache-version.ps1` updates CSS/JS query versions across working HTML files.
- `build-content.js` generates `js/lab-content.js` from human-readable
  Markdown in `content/**/*.md`.

Generated theme pages still use the shared content source in `js/lab-content.js`
and the shared renderer in `js/render-theme.js`.

Site content belongs in `content/`. Write normal Markdown: page title as `#`,
section titles as `##`, paragraphs as plain text, and lists with `-`.

Each visible page has its own folder:
`home`, `people`, `students`, `projects`, `patents`, `publications`, `media`,
and `news`.
Each folder stores separate `ru.md` and `en.md` files.

News items are sections in `content/news/ru.md` and `content/news/en.md`.
Each `## News title` section becomes one news item. The older
`content/news/items/<item-id>/` folder format remains supported only as a
fallback.

CV pages are separate files in `content/cv/` named `surname_ru.md` and
`surname_en.md`; the `surname` stem is used in links such as
`cv.html?person=kryukov`.

Do not write JSON in content files, and do not edit generated
`js/lab-content.js` by hand.
