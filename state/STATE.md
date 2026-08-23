# state/STATE.md

## Current Objective

Design and install an agent harness for this static lab website.

## Completed

- Read the existing website structure, README, renderer, and build scripts.
- Read the external harness methodology in
  `A:\PetProjects\UpdateAgentEnviroment`.
- Created root agent documentation split into instruction, architecture,
  environment, tools, state, and feedback subsystems.
- Added `tools/codex-check.ps1` as a repeatable smoke-check.
- Ran `powershell -ExecutionPolicy Bypass -File .\tools\codex-check.ps1`
  successfully.
- Added `tools/translate-ru-to-en.js` for RU to EN Markdown translation through
  ordinary free translation APIs: MyMemory by default and optional LibreTranslate.
- Verified translation tooling with `node --check`, `--help`, and a MyMemory
  dry-run without writing files.
- Re-ran `tools/codex-check.ps1` successfully after adding translation tooling.

## In Progress

- No active harness implementation work.

## Blocked

- Nothing blocked.

## Known Issues

- The working tree had pre-existing modifications before this harness work.
- The generated `js/lab-content.js` may change when checks regenerate content;
  treat pre-existing generated changes separately from harness changes.

## Temporary Decisions

- The harness is stored in repository-level files rather than ignored `codex/`
  files so future agents can discover it reproducibly.

## Next Actions

- Use `AGENTS.md` as the entry point for future agent work.
- Keep `tools/INDEX.md` updated when reusable project tools change.
- For higher translation quality without paid APIs, configure a local or trusted
  LibreTranslate endpoint and use `--provider libre`.

## Update Policy

Update this file after meaningful project-state changes, before long pauses, when
blocked, or when handing work to another agent or human.
