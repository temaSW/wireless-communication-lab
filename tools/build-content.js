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
  return sectionsFromLines(bodyAfterTitle(markdown), level);
}

function topSections(markdown) {
  return sectionsFromLines(markdown.split("\n"), 1);
}

function contentSections(markdown) {
  const roots = topSections(markdown);
  return roots.length > 1 ? roots : sections(markdown);
}

function sectionsFromLines(lines, level = 2) {
  const heading = "#".repeat(level);
  const result = [];
  let current = null;

  lines.forEach((line) => {
    const headingMatch = headingMatchOf(line);

    if (headingMatch && headingMatch[1].length < level) {
      current = null;
      return;
    }

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

function headingMatchOf(line) {
  return stripComment(line).match(/^(#{1,6})\s+(.+)$/);
}

function textFromLines(lines, options = {}) {
  return lines
    .filter((line) => !headingMatchOf(line) && (options.includeBullets || !line.startsWith("- ")) && (options.includeKeyValues || !keyValue(line)) && !imageFromLine(line))
    .map((line) => {
      const text = options.includeBullets ? line.replace(/^-\s+/, "").trim() : line;
      const pair = keyValue(text);
      if (options.includeKeyValues && pair) {
        return `${pair[0]}: ${pair[1]}`;
      }

      return text;
    })
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

function imageFromLine(line) {
  const trimmed = stripComment(line);
  const markdownImage = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
  const obsidianImage = trimmed.match(/^!\[\[([^\]|]+)(?:\|([^\]]+))?\]\]$/);

  if (markdownImage) {
    return {
      alt: markdownImage[1].trim(),
      src: markdownImage[2].trim()
    };
  }

  if (obsidianImage) {
    const src = obsidianImage[1].trim();
    return {
      alt: (obsidianImage[2] || path.basename(src, path.extname(src))).trim(),
      src
    };
  }

  return null;
}

function imagesFromLines(lines) {
  return lines
    .map(imageFromLine)
    .filter(Boolean);
}

function headingTitle(line, level) {
  const prefix = `${"#".repeat(level)} `;
  return line.startsWith(prefix) ? line.slice(prefix.length).trim() : null;
}

function firstSubheadingBeforeSection(lines, level = 3) {
  for (const line of lines) {
    if (line.startsWith("## ")) return null;
    const title = headingTitle(line, level);
    if (title) return title;
  }

  return null;
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
  const homeSections = parseHomeSections(markdown);
  const researchSection = homeSections.find((section) => section.cards.length);

  if (researchSection) {
    return {
      ...labelData(lang, "home", researchSection.title, meta),
      homeSections: homeSections.map((section) => ({
        title: section.title,
        text: section.text,
        images: section.images,
        cards: section.cards,
        type: section === researchSection ? "research" : "text"
      })),
      researchInterests: researchSection.cards
    };
  }

  return {
    ...labelData(lang, "home", title, meta),
    researchInterests: parseSectionCards(markdown)
  };
}

function parseHomeSections(markdown) {
  return topSections(markdown).map((section) => ({
    title: section.title,
    text: textFromLines(section.lines, { includeBullets: true, includeKeyValues: true }),
    images: imagesFromLines(section.lines),
    cards: parseNestedCards(section.lines, 2)
  }));
}

function parseSectionCards(markdown) {
  const roots = topSections(markdown);
  const sectionLevel = roots.length > 1 ? 1 : 2;
  const cardLevel = sectionLevel + 1;

  return (roots.length > 1 ? roots : sections(markdown)).flatMap((section) => {
    const cards = parseNestedCards(section.lines, cardLevel);

    if (cards.length) {
      return cards;
    }

    return [{
      title: section.title,
      text: textFromLines(section.lines),
      images: imagesFromLines(section.lines)
    }];
  });
}

function parseNestedCards(lines, level = 3) {
  const cards = [];
  let current = null;

  lines.forEach((line) => {
    const headingMatch = headingMatchOf(line);

    if (headingMatch && headingMatch[1].length < level) {
      current = null;
      return;
    }

    const cardTitle = headingTitle(line, level);

    if (cardTitle) {
      current = {
        title: cardTitle,
        lines: []
      };
      cards.push(current);
      return;
    }

    if (current) {
      current.lines.push(line);
    }
  });

  return cards.map((card) => ({
    title: card.title,
    text: textFromLines(card.lines),
    images: imagesFromLines(card.lines)
  }));
}

function parsePeople(lang) {
  const { filePath, markdown } = readPage(lang, "people");
  const title = titleOf(markdown, filePath);
  const bodyLines = bodyAfterTitle(markdown).map(stripComment).filter(Boolean);
  const meta = metadata(bodyLines);
  const kicker = firstSubheadingBeforeSection(bodyLines) || meta["надзаголовок"] || meta.kicker;

  return {
    ...labelData(lang, "people", title, { ...meta, kicker, "надзаголовок": kicker }),
    peopleGroups: sections(markdown).map((section) => ({
      title: section.title,
      people: parsePeopleEntries(section.lines)
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

function parsePeopleEntries(lines) {
  const hasCards = lines.some((line) => line.startsWith("### "));
  const people = [];
  let current = null;

  function startPerson(name) {
    current = {
      name: name.trim(),
      photo: "",
      description: "",
      contacts: []
    };
    people.push(current);
  }

  function appendPersonLine(line) {
    const listItem = line.match(/^-\s+(.+)$/);
    const markdownLink = line.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    const bracketNote = line.match(/^\[([^\]]+)\]$/);
    const image = imageFromLine(line);

    if (!current) return;

    if (image) {
      current.photo = image.src;
      current.photoAlt = image.alt;
      return;
    }

    if (markdownLink) {
      current.photo = markdownLink[2].trim();
      current.photoAlt = markdownLink[1].trim();
      return;
    }

    if (bracketNote) {
      current.photoLabel = bracketNote[1].trim();
      return;
    }

    if (listItem) {
      const [label, ...valueParts] = listItem[1].split(":");
      current.contacts.push({
        label: label.trim(),
        value: valueParts.join(":").trim()
      });
      return;
    }

    current.description = `${current.description} ${line}`.trim();
  }

  if (hasCards) {
    lines.forEach((line) => {
      const cardTitle = headingTitle(line, 3);
      if (cardTitle) {
        startPerson(cardTitle);
        return;
      }

      appendPersonLine(line);
    });

    return people;
  }

  lines.forEach((line) => {
    const listItem = line.match(/^-\s+(.+)$/);

    if (listItem) {
      startPerson(listItem[1]);
      return;
    }

    appendPersonLine(line);
  });

  return people;
}

function parseStudents(lang) {
  const { filePath, markdown } = readPage(lang, "students");
  const title = titleOf(markdown, filePath);
  const allLines = bodyAfterTitle(markdown).map(stripComment).filter(Boolean);
  const meta = metadata(allLines);
  const pageSections = contentSections(markdown);
  const tracksSection = pageSections.find((section) => {
    const titleLower = section.title.toLowerCase();
    return titleLower === "направления" || titleLower === "tracks";
  });
  const stepSections = pageSections.filter((section) => section !== tracksSection);
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
    projects: parseSectionCards(markdown)
  };
}

function parseSimpleList(lang, sectionName, outputKey, placeholderKey) {
  const { filePath, markdown } = readPage(lang, sectionName);
  const title = titleOf(markdown, filePath);
  const lines = bodyAfterTitle(markdown).map(stripComment).filter(Boolean);
  const meta = metadata(lines);
  const items = bullets(lines);
  const sectionTitles = sections(markdown).map((section) => section.title);

  return {
    ...labelData(lang, sectionName, title, meta),
    [outputKey]: items.length ? items : sectionTitles,
    placeholders: {
      [placeholderKey]: placeholderDefaults[lang][placeholderKey]
    }
  };
}

function leadBeforeSections(markdown) {
  const leadLines = [];

  for (const line of bodyAfterTitle(markdown).map(stripComment).filter(Boolean)) {
    if (line.startsWith("## ")) break;
    if (!keyValue(line)) leadLines.push(line);
  }

  return textFromLines(leadLines);
}

function parsePublicationSection(section) {
  const sectionLead = [];
  const items = [];
  const groups = [];
  let currentGroup = null;

  section.lines.forEach((line) => {
    const groupTitle = headingTitle(line, 3);

    if (groupTitle) {
      currentGroup = {
        title: groupTitle,
        items: []
      };
      groups.push(currentGroup);
      return;
    }

    if (line.startsWith("- ")) {
      const item = line.replace(/^-\s+/, "").trim();
      if (currentGroup) {
        currentGroup.items.push(item);
      } else {
        items.push(item);
      }
      return;
    }

    if (!keyValue(line)) {
      sectionLead.push(line);
    }
  });

  return {
    title: section.title,
    text: textFromLines(sectionLead),
    items,
    groups: groups.filter((group) => group.items.length)
  };
}

function parsePublications(lang) {
  const { filePath, markdown } = readPage(lang, "publications");
  const title = titleOf(markdown, filePath);
  const lines = bodyAfterTitle(markdown).map(stripComment).filter(Boolean);
  const meta = metadata(lines);

  return {
    ...labelData(lang, "publications", title, meta),
    publicationContent: {
      lead: leadBeforeSections(markdown),
      sections: sections(markdown).map(parsePublicationSection)
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
    parsePublications(lang),
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
