#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const contentRoot = path.join(root, "content");

const labelMap = new Map([
  ["Дата", "Date"],
  ["Надзаголовок", "Kicker"],
  ["Название лаборатории", "Lab name"],
  ["Подзаголовок", "Tagline"],
  ["Главная", "Home"],
  ["Надзаголовок выбора темы", "Theme selector eyebrow"],
  ["Описание выбора темы", "Theme selector lead"],
  ["Ссылка выбора темы", "Theme selector link"],
  ["Ссылка", "Href"],
  ["Название ru", "Title ru"],
  ["Название en", "Title en"],
  ["Описание ru", "Description ru"],
  ["Описание en", "Description en"]
]);

function usage() {
  console.log(`Usage:
  node tools/translate-ru-to-en.js --source <ru.md> [--target <en.md>] [--write]
  node tools/translate-ru-to-en.js --all [--write]

Options:
  --all                 Translate every content/**/ru.md file to paired en.md.
  --source <path>       Russian Markdown source file.
  --target <path>       English Markdown target file. Defaults to sibling en.md.
  --write               Write target files. Without this, print to stdout.
  --force               Allow overwriting a non-empty target file.
  --if-source-newer     Write only when target is missing, empty, or older than source.
  --provider <name>     mymemory or libre. Default: mymemory.
  --delay-ms <number>   Delay between API calls. Default: 250.
  --help                Show this help.

Environment:
  MYMEMORY_EMAIL        Optional. MyMemory raises free daily quota when email is supplied.
  LIBRETRANSLATE_URL    Optional. Default: http://127.0.0.1:5000
  LIBRETRANSLATE_KEY    Optional. Needed only for instances configured with API keys.
`);
}

function parseArgs(argv) {
  const args = {
    all: false,
    source: null,
    target: null,
    write: false,
    force: false,
    ifSourceNewer: false,
    help: false,
    provider: "mymemory",
    delayMs: 250
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--all") args.all = true;
    else if (arg === "--write") args.write = true;
    else if (arg === "--force") args.force = true;
    else if (arg === "--if-source-newer") args.ifSourceNewer = true;
    else if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--source") args.source = argv[++index];
    else if (arg === "--target") args.target = argv[++index];
    else if (arg === "--provider") args.provider = argv[++index];
    else if (arg === "--delay-ms") args.delayMs = Number(argv[++index]);
    else throw new Error(`Unknown argument: ${arg}`);
  }

  if (!["mymemory", "libre"].includes(args.provider)) {
    throw new Error("--provider must be mymemory or libre.");
  }

  if (!Number.isFinite(args.delayMs) || args.delayMs < 0) {
    throw new Error("--delay-ms must be a non-negative number.");
  }

  return args;
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(entryPath) : [entryPath];
  });
}

function pairedTarget(source) {
  return path.join(path.dirname(source), "en.md");
}

function collectJobs(args) {
  if (args.all) {
    return walk(contentRoot)
      .filter((file) => path.basename(file) === "ru.md")
      .sort()
      .map((source) => ({ source, target: pairedTarget(source) }));
  }

  if (!args.source) {
    throw new Error("Use --source <ru.md> or --all.");
  }

  const source = path.resolve(root, args.source);
  const target = args.target ? path.resolve(root, args.target) : pairedTarget(source);
  return [{ source, target }];
}

function readMarkdown(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing source file: ${filePath}`);
  }

  return fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n").trimEnd();
}

function shouldSkipTarget(source, target, args) {
  if (!args.write || args.force || !fs.existsSync(target)) {
    return false;
  }

  if (fs.readFileSync(target, "utf8").trim().length === 0) {
    return false;
  }

  if (args.ifSourceNewer) {
    const sourceMtime = fs.statSync(source).mtimeMs;
    const targetMtime = fs.statSync(target).mtimeMs;
    return targetMtime >= sourceMtime;
  }

  return true;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function byteLength(text) {
  return Buffer.byteLength(text, "utf8");
}

function splitLongText(text, maxBytes) {
  if (byteLength(text) <= maxBytes) return [text];

  const words = text.split(/(\s+)/);
  const chunks = [];
  let current = "";

  for (const word of words) {
    if (byteLength(current + word) > maxBytes && current.trim()) {
      chunks.push(current.trim());
      current = word.trimStart();
    } else {
      current += word;
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

async function translateMyMemory(text) {
  const chunks = splitLongText(text, 450);
  const translated = [];

  for (const chunk of chunks) {
    const url = new URL("https://api.mymemory.translated.net/get");
    url.searchParams.set("q", chunk);
    url.searchParams.set("langpair", "ru|en");
    if (process.env.MYMEMORY_EMAIL) {
      url.searchParams.set("de", process.env.MYMEMORY_EMAIL);
    }

    const response = await fetch(url);
    const body = await response.json().catch(() => ({}));

    if (!response.ok || body.responseStatus >= 400) {
      throw new Error(`MyMemory request failed: ${body.responseDetails || response.statusText}`);
    }

    translated.push(body.responseData && body.responseData.translatedText
      ? body.responseData.translatedText
      : "");
  }

  return translated.join(" ").trim();
}

async function translateLibre(text) {
  const baseUrl = process.env.LIBRETRANSLATE_URL || "http://127.0.0.1:5000";
  const payload = {
    q: text,
    source: "ru",
    target: "en",
    format: "text"
  };

  if (process.env.LIBRETRANSLATE_KEY) {
    payload.api_key = process.env.LIBRETRANSLATE_KEY;
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`LibreTranslate request failed: ${body.error || response.statusText}`);
  }

  return String(body.translatedText || "").trim();
}

async function translateText(text, args) {
  const trimmed = text.trim();
  if (!trimmed) return text;

  const result = args.provider === "libre"
    ? await translateLibre(trimmed)
    : await translateMyMemory(trimmed);

  if (args.delayMs) await sleep(args.delayMs);
  return result;
}

function isPreservedLine(line) {
  return [
    /^```/,
    /^<!--/,
    /^\[[^\]]+\]$/,
    /^\[.*\]\(.*\)$/,
    /^-\s*(E-?mail|Email|Scholar|ORCID|Scopus|ResearchGate|GitHub|Profile|Профиль)\s*:/i
  ].some((pattern) => pattern.test(line.trim()));
}

async function translateLine(line, args, state) {
  if (!line.trim()) return line;

  if (line.trim().startsWith("```")) {
    state.inCode = !state.inCode;
    return line;
  }

  if (state.inCode || isPreservedLine(line)) {
    return line;
  }

  const metadata = line.match(/^([^:]+):\s*(.*)$/);
  if (metadata && !line.trim().startsWith("- ")) {
    const sourceLabel = metadata[1].trim();
    const label = labelMap.get(sourceLabel) || await translateText(sourceLabel, args);
    const rawValue = metadata[2].trim();
    const value = sourceLabel === "Дата" && /^\d{4}-\d{2}-\d{2}$/.test(rawValue)
      ? rawValue
      : await translateText(rawValue, args);
    return `${label}: ${value}`;
  }

  const heading = line.match(/^(#{1,6}\s+)(.+)$/);
  if (heading) {
    return `${heading[1]}${await translateText(heading[2], args)}`;
  }

  const listItem = line.match(/^(\s*-\s+)(.+)$/);
  if (listItem) {
    return `${listItem[1]}${await translateText(listItem[2], args)}`;
  }

  return translateText(line, args);
}

async function translateMarkdown(markdown, args) {
  const state = { inCode: false };
  const lines = markdown.split("\n");
  const result = [];

  for (const line of lines) {
    result.push(await translateLine(line, args, state));
  }

  return `${result.join("\n").trimEnd()}\n`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    usage();
    return;
  }

  const jobs = collectJobs(args);

  for (const job of jobs) {
    const sourceMarkdown = readMarkdown(job.source);

    if (shouldSkipTarget(job.source, job.target, args)) {
      console.log(`Skipping non-empty target: ${path.relative(root, job.target)} (use --force to overwrite)`);
      continue;
    }

    console.error(`Translating ${path.relative(root, job.source)} -> ${path.relative(root, job.target)} via ${args.provider}`);
    const translated = await translateMarkdown(sourceMarkdown, args);

    if (args.write) {
      fs.mkdirSync(path.dirname(job.target), { recursive: true });
      fs.writeFileSync(job.target, translated, "utf8");
      console.log(`Wrote ${path.relative(root, job.target)}`);
    } else {
      console.log(`--- ${path.relative(root, job.target)} ---`);
      process.stdout.write(translated);
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
