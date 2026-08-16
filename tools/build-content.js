const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const contentRoot = path.join(root, "content");
const languages = ["ru", "en"];

const kickerDefaults = {
  ru: {
    home: "Научные направления",
    people: "Команда лаборатории",
    students: "Для студентов",
    projects: "Текущая работа",
    publications: "Результаты",
    media: "Медиа",
    news: "Новости лаборатории"
  },
  en: {
    home: "Research Interests",
    people: "Laboratory Team",
    students: "For Students",
    projects: "Current Work",
    publications: "Outputs",
    media: "Media",
    news: "Laboratory News"
  }
};

const placeholderDefaults = {
  ru: {
    email: "Email",
    orcid: "ORCID",
    scholar: "Google Scholar",
    profile: "Внешний профиль",
    value: "заглушка",
    todo: "TODO",
    media: "Заглушка"
  },
  en: {
    email: "Email",
    orcid: "ORCID",
    scholar: "Google Scholar",
    profile: "External profile",
    value: "placeholder",
    todo: "TODO",
    media: "Placeholder"
  }
};

function readMarkdown(filePath) {
  return fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n").trim();
}

function stripComment(line) {
  return line.replace(/<!--[\s\S]*?-->/g, "").trim();
}

function keyValue(line) {
  const match = stripComment(line).match(/^([^:]+):\s*(.+)$/);
  return match ? [match[1].trim(), match[2].trim()] : null;
}

function titleOf(markdown, filePath) {
  const line = markdown.split("\n").find((item) => item.startsWith("# "));

  if (!line) {
    throw new Error(`Missing page title in ${filePath}`);
  }

  return line.replace(/^#\s+/, "").trim();
}

function bodyAfterTitle(markdown) {
  const lines = markdown.split("\n");
  const index = lines.findIndex((line) => line.startsWith("# "));
  return index === -1 ? lines : lines.slice(index + 1);
}

function metadata(lines) {
  const result = {};

  lines.forEach((line) => {
    const pair = keyValue(line);
    if (pair) {
      result[pair[0].toLowerCase()] = pair[1];
    }
  });

  return result;
}

function sections(markdown, level = 2) {
  const heading = "#".repeat(level);
  const result = [];
  let current = null;

  bodyAfterTitle(markdown).forEach((line) => {
    if (line.startsWith(`${heading} `)) {
      current = {
        title: line.replace(new RegExp(`^${heading}\\s+`), "").trim(),
        lines: []
      };
      result.push(current);
      return;
    }

    if (current) {
      current.lines.push(line);
    }
  });

  return result.map((section) => ({
    title: section.title,
    lines: section.lines.map(stripComment).filter(Boolean)
  }));
}

function textFromLines(lines) {
  return lines
    .filter((line) => !line.startsWith("- ") && !keyValue(line))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function bullets(lines) {
  return lines
    .filter((line) => line.startsWith("- "))
    .map((line) => line.replace(/^-\s+/, "").trim())
    .filter(Boolean);
}

function readPage(lang, section) {
  const filePath = path.join(contentRoot, section, `${lang}.md`);
  return {
    filePath,
    markdown: readMarkdown(filePath)
  };
}

function labelData(lang, section, title, meta) {
  const titleKey = section === "home" ? "researchTitle" : `${section}Title`;
  const kickerKey = section === "home" ? "researchKicker" : `${section}Kicker`;

  return {
    sectionLabels: {
      [kickerKey]: meta["надзаголовок"] || meta.kicker || kickerDefaults[lang][section],
      [titleKey]: title
    }
  };
}

function parseSite() {
  const markdown = readMarkdown(path.join(contentRoot, "site.md"));
  const lines = bodyAfterTitle(markdown).map(stripComment).filter(Boolean);
  const meta = metadata(lines);
  const themeSections = sections(markdown, 2);

  return {
    defaultLanguage: meta["язык по умолчанию"] || meta["default language"] || "ru",
    languageStorageKey: meta["ключ языка"] || meta["language storage key"] || "wireless-lab-language",
    themes: themeSections.map((theme) => {
      const themeMeta = metadata(theme.lines);
      return {
        key: theme.title,
        href: themeMeta["ссылка"] || themeMeta.href,
        title: {
          ru: themeMeta["название ru"] || theme.title,
          en: themeMeta["title en"] || themeMeta["название en"] || theme.title
        },
        description: {
          ru: themeMeta["описание ru"] || "",
          en: themeMeta["description en"] || themeMeta["описание en"] || ""
        }
      };
    })
  };
}

function parseNavigation(lang) {
  const { markdown } = readPage(lang, "navigation");
  const lines = bodyAfterTitle(markdown).map(stripComment).filter(Boolean);
  const meta = metadata(lines);
  const tabSection = sections(markdown, 2).find((section) => {
    const title = section.title.toLowerCase();
    return title === "вкладки" || title === "tabs";
  });

  if (!tabSection) {
    throw new Error(`Missing tabs section for ${lang}`);
  }

  return {
    labName: meta["название лаборатории"] || meta["lab name"],
    tagline: meta["подзаголовок"] || meta.tagline,
    rootEyebrow: meta["надзаголовок выбора темы"] || meta["theme selector eyebrow"],
    rootLead: meta["описание выбора темы"] || meta["theme selector lead"],
    themeSelector: meta["ссылка выбора темы"] || meta["theme selector link"],
    home: meta["главная"] || meta.home,
    sections: bullets(tabSection.lines).map((line) => {
      const [key, title, href] = line.split("|").map((part) => part.trim());
      if (!key || !title || !href) {
        throw new Error(`Invalid navigation item: ${line}`);
      }

      return { key, title, href };
    })
  };
}

function parseHome(lang) {
  const { filePath, markdown } = readPage(lang, "home");
  const title = titleOf(markdown, filePath);
  const meta = metadata(bodyAfterTitle(markdown));

  return {
    ...labelData(lang, "home", title, meta),
    researchInterests: sections(markdown).map((section) => ({
      title: section.title,
      text: textFromLines(section.lines)
    }))
  };
}

function parsePeople(lang) {
  const { filePath, markdown } = readPage(lang, "people");
  const title = titleOf(markdown, filePath);
  const meta = metadata(bodyAfterTitle(markdown));

  return {
    ...labelData(lang, "people", title, meta),
    peopleGroups: sections(markdown).map((section) => ({
      title: section.title,
      people: bullets(section.lines)
    })),
    placeholders: {
      email: placeholderDefaults[lang].email,
      orcid: placeholderDefaults[lang].orcid,
      scholar: placeholderDefaults[lang].scholar,
      profile: placeholderDefaults[lang].profile,
      value: placeholderDefaults[lang].value
    }
  };
}

function parseStudents(lang) {
  const { filePath, markdown } = readPage(lang, "students");
  const title = titleOf(markdown, filePath);
  const allLines = bodyAfterTitle(markdown).map(stripComment).filter(Boolean);
  const meta = metadata(allLines);
  const contentSections = sections(markdown);
  const tracksSection = contentSections.find((section) => {
    const titleLower = section.title.toLowerCase();
    return titleLower === "направления" || titleLower === "tracks";
  });
  const stepSections = contentSections.filter((section) => section !== tracksSection);
  const leadLines = [];

  for (const line of allLines) {
    if (line.startsWith("## ")) break;
    if (!keyValue(line)) leadLines.push(line);
  }

  return {
    ...labelData(lang, "students", title, meta),
    studentOffer: {
      lead: textFromLines(leadLines),
      steps: stepSections.map((section) => ({
        title: section.title,
        text: textFromLines(section.lines)
      })),
      tracks: tracksSection ? bullets(tracksSection.lines) : []
    }
  };
}

function parseProjects(lang) {
  const { filePath, markdown } = readPage(lang, "projects");
  const title = titleOf(markdown, filePath);
  const meta = metadata(bodyAfterTitle(markdown));

  return {
    ...labelData(lang, "projects", title, meta),
    projects: sections(markdown).map((section) => ({
      title: section.title,
      text: textFromLines(section.lines)
    }))
  };
}

function parseSimpleList(lang, sectionName, outputKey, placeholderKey) {
  const { filePath, markdown } = readPage(lang, sectionName);
  const title = titleOf(markdown, filePath);
  const lines = bodyAfterTitle(markdown).map(stripComment).filter(Boolean);
  const meta = metadata(lines);

  return {
    ...labelData(lang, sectionName, title, meta),
    [outputKey]: bullets(lines),
    placeholders: {
      [placeholderKey]: placeholderDefaults[lang][placeholderKey]
    }
  };
}

function parseNewsPage(lang) {
  const { filePath, markdown } = readPage(lang, "news");
  const title = titleOf(markdown, filePath);
  const meta = metadata(bodyAfterTitle(markdown));

  return labelData(lang, "news", title, meta);
}

function parseNewsItems(lang) {
  const itemsRoot = path.join(contentRoot, "news", "items");

  if (!fs.existsSync(itemsRoot)) {
    return [];
  }

  return fs.readdirSync(itemsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .map((itemDir) => {
      const filePath = path.join(itemsRoot, itemDir, `${lang}.md`);
      const markdown = readMarkdown(filePath);
      const title = titleOf(markdown, filePath);
      const lines = bodyAfterTitle(markdown).map(stripComment).filter(Boolean);
      const meta = metadata(lines);

      return {
        date: meta["дата"] || meta.date || "",
        title,
        text: textFromLines(lines)
      };
    });
}

function mergeContent(target, source) {
  Object.entries(source).forEach(([key, value]) => {
    if (key === "sectionLabels" || key === "placeholders") {
      target[key] = { ...(target[key] || {}), ...value };
      return;
    }

    target[key] = value;
  });

  return target;
}

function buildLanguage(lang) {
  const data = parseNavigation(lang);

  [
    parseHome(lang),
    parsePeople(lang),
    parseStudents(lang),
    parseProjects(lang),
    parseSimpleList(lang, "publications", "publicationSections", "todo"),
    parseSimpleList(lang, "media", "mediaSections", "media"),
    parseNewsPage(lang)
  ].forEach((section) => mergeContent(data, section));

  data.newsItems = parseNewsItems(lang);

  return data;
}

const site = parseSite();
const content = {
  defaultLanguage: site.defaultLanguage,
  languageStorageKey: site.languageStorageKey,
  themes: site.themes,
  languages: Object.fromEntries(languages.map((lang) => [lang, buildLanguage(lang)]))
};

const output = `// Generated by tools/build-content.js from content/**/*.md. Do not edit by hand.
window.LAB_CONTENT = ${JSON.stringify(content, null, 2)};
`;

fs.writeFileSync(path.join(root, "js", "lab-content.js"), output, "utf8");
console.log("Generated js/lab-content.js from content/**/*.md");
