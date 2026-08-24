# tools/INDEX.md

Reusable project tools.

## `tools/build-content.js`

- Purpose: Generate `js/lab-content.js` from human-readable Markdown in
  `content/**/*.md`.
- Parameters: None.
- Example:

```powershell
node tools/build-content.js
```

- Dependencies: Node.js built-in `fs`, `path`, and `child_process` modules;
  internet access for the configured translation provider when English files are
  missing.
- Notes:
  - Required after changing `content/` or the parser itself.
  - Does not use network translation by default.
  - Set `LAB_AUTO_TRANSLATE=1` to auto-generate missing English Markdown during
    the build.
  - Set `LAB_TRANSLATE_PROVIDER=libre` to use LibreTranslate when automatic
    translation is enabled.

## `setup-theme-showcase.ps1`

- Purpose: Regenerate shared content, sync the root `labicon.png` into theme
  preview folders, and ensure required preview pages exist.
- Parameters: None.
- Example:

```powershell
powershell -ExecutionPolicy Bypass -File .\setup-theme-showcase.ps1
```

- Dependencies: PowerShell, Node.js.

## `tools/new-theme-page.ps1`

- Purpose: Create the same page across all four theme preview folders from
  `tools/theme-page.template.html`.
- Parameters: See script source before use.
- Example:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\new-theme-page.ps1
```

- Dependencies: PowerShell.

## `tools/update-cache-version.ps1`

- Purpose: Update CSS/JS query-string cache versions across working HTML files.
- Parameters: See script source before use.
- Example:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\update-cache-version.ps1
```

- Dependencies: PowerShell.

## `tools/codex-check.ps1`

- Purpose: Agent smoke-check for repository status, generated content, theme
  showcase structure, and JavaScript validity.
- Parameters:
  - `-Serve`: optionally start a local static server after checks.
  - `-Port <number>`: server port when `-Serve` is used; default is `8080`.
- Example:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\codex-check.ps1
```

- Dependencies: PowerShell, Git, Node.js; Python only when `-Serve` is used.

## `tools/translate-ru-to-en.js`

- Purpose: Translate Russian Markdown content to paired English Markdown using
  ordinary translation APIs, not agent/LLM APIs.
- Parameters:
  - `--source <path>`: translate one Russian Markdown file.
  - `--target <path>`: target English Markdown path; defaults to sibling `en.md`.
  - `--all`: translate all `content/**/ru.md` files.
  - `--write`: write files; otherwise print translation to stdout.
  - `--force`: overwrite non-empty targets.
  - `--if-source-newer`: write only when the English target is missing, empty,
    or older than the Russian source.
  - `--provider mymemory|libre`: choose provider; default is `mymemory`.
- Example:

```powershell
node tools/translate-ru-to-en.js --source content\news\items\001-laboratory-news\ru.md
```

- Dependencies: Node.js with built-in `fetch`, internet access for MyMemory, or
  a reachable LibreTranslate instance.
- Notes: MyMemory works without a key but has free-tier limits. LibreTranslate
  can run for free as a self-hosted local API.
