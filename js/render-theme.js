(function () {
  const model = window.LAB_CONTENT;
  const app = document.querySelector("[data-render-theme]");
  if (!model || !app) return;

  const page = document.body.dataset.page || "home";
  const themeKey = document.body.dataset.themeName || "Theme preview";
  const availableLanguages = Object.keys(model.languages);

  function storedLanguage() {
    try {
      const value = window.localStorage.getItem(model.languageStorageKey);
      return availableLanguages.includes(value) ? value : model.defaultLanguage;
    } catch (_error) {
      return model.defaultLanguage;
    }
  }

  function saveLanguage(language) {
    try {
      window.localStorage.setItem(model.languageStorageKey, language);
    } catch (_error) {
      // Local storage can be unavailable in restricted browser contexts.
    }
  }

  function languageSwitch(currentLanguage) {
    return `
      <div class="language-switch" role="group" aria-label="Language">
        ${availableLanguages.map((language) => `
          <button type="button" data-language="${language}" aria-pressed="${language === currentLanguage}">
            ${language.toUpperCase()}
          </button>
        `).join("")}
      </div>
    `;
  }

  function html(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function inlineMarkdown(text) {
    return html(text)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>");
  }

  function assetSrc(src) {
    if (!src || /^(https?:|data:|\/)/.test(src)) {
      return src;
    }

    if (src.startsWith("../")) {
      return src;
    }

    return `../../${encodeURI(src)}`;
  }

  function render(language) {
    const content = model.languages[language] || model.languages[model.defaultLanguage];
    const theme = model.themes.find((item) => item.key === themeKey);
    const themeName = theme ? theme.title[language] : themeKey;
    const labels = content.sectionLabels;
    const placeholders = content.placeholders;

    document.documentElement.lang = language;
    document.title = `${content.labName} - ${themeName}`;

    const nav = content.sections
      .filter((section) => section.key !== "research" && section.href !== "research.html")
      .map((section) => `<a href="${section.href}" aria-current="${page === section.key ? "page" : "false"}">${section.title}</a>`)
      .join("");

    function newsBlock() {
      return `
        <section class="section section-news">
          <div class="section-head">
            <p class="kicker">${labels.newsKicker}</p>
            <h2>${labels.newsTitle}</h2>
          </div>
          <div class="news-list">
            ${content.newsItems.map((item) => `
              <article class="news-item">
                <time>${item.date}</time>
                <h3>${item.title}</h3>
                <p>${item.text}</p>
              </article>
            `).join("")}
          </div>
        </section>
      `;
    }

    function researchBlock() {
      return `
        <section class="section section-research">
          <div class="section-head">
            <p class="kicker">${labels.researchKicker}</p>
            <h2>${labels.researchTitle}</h2>
          </div>
          <div class="interest-list">
            ${content.researchInterests.map((item) => `
              <article class="${item.images && item.images.length ? "has-image" : ""}">
                ${item.images && item.images.length ? `
                  <img class="interest-image" src="${assetSrc(item.images[0].src)}" alt="${html(item.images[0].alt || item.title)}">
                ` : ""}
                <h3>${html(item.title)}</h3>
                <p>${inlineMarkdown(item.text)}</p>
              </article>
            `).join("")}
          </div>
        </section>
      `;
    }

    function projectsBlock() {
      return `
        <section class="section section-projects">
          <div class="section-head">
            <p class="kicker">${labels.projectsKicker}</p>
            <h2>${labels.projectsTitle}</h2>
          </div>
          <div class="project-list">
            ${content.projects.map((project) => `
              <article class="project">
                <h3>${project.title}</h3>
                <p>${project.text}</p>
              </article>
            `).join("")}
          </div>
        </section>
      `;
    }

    function peopleBlock() {
      function personName(person) {
        return typeof person === "string" ? person : person.name;
      }

      function personDescription(person) {
        return typeof person === "string" ? "" : person.description;
      }

      function personPhoto(person, name) {
        if (typeof person === "string" || !person.photo) {
          return `<div class="photo-placeholder" aria-hidden="true"></div>`;
        }

        return `<img class="photo-placeholder" src="${person.photo}" alt="${name}">`;
      }

      function personContacts(person) {
        if (typeof person === "string" || !person.contacts || !person.contacts.length) {
          return [
            { label: placeholders.email, value: placeholders.value },
            { label: placeholders.orcid, value: placeholders.value },
            { label: placeholders.scholar, value: placeholders.value },
            { label: placeholders.profile, value: placeholders.value }
          ];
        }

        return person.contacts.map((contact) => ({
          label: contact.label,
          value: contact.value || placeholders.value
        }));
      }

      return `
        <section class="section">
          <div class="section-head">
            <p class="kicker">${labels.peopleKicker}</p>
            <h2>${labels.peopleTitle}</h2>
          </div>
          ${content.peopleGroups.map((group, groupIndex) => `
            <section class="people-group people-group-${groupIndex + 1}" aria-label="${group.title}">
              <div class="group-head">
                <h3>${group.title}</h3>
                <span>${group.people.length}</span>
              </div>
              <div class="people-list">
                ${group.people.map((person) => {
                  const name = personName(person);
                  const description = personDescription(person);
                  return `
                  <article class="person">
                    ${personPhoto(person, name)}
                    <p class="person-role">${group.title}</p>
                    <h4>${name}</h4>
                    ${description ? `<p class="person-bio">${description}</p>` : ""}
                    <dl class="profile-list">
                      ${personContacts(person).map((contact) => `<dt>${contact.label}</dt><dd>${contact.value}</dd>`).join("")}
                    </dl>
                  </article>
                `;
                }).join("")}
              </div>
            </section>
          `).join("")}
        </section>
      `;
    }

    function studentsBlock() {
      return `
        <section class="section section-students">
          <div class="section-head">
            <p class="kicker">${labels.studentsKicker}</p>
            <h2>${labels.studentsTitle}</h2>
            <p class="student-lead">${content.studentOffer.lead}</p>
          </div>
          <div class="student-steps">
            ${content.studentOffer.steps.map((step, index) => `
              <article class="student-step">
                <span>${index + 1}</span>
                <h3>${step.title}</h3>
                <p>${step.text}</p>
              </article>
            `).join("")}
          </div>
          <div class="student-tracks" aria-label="${labels.studentsKicker}">
            ${content.studentOffer.tracks.map((track) => `<article>${track}</article>`).join("")}
          </div>
        </section>
      `;
    }

    function publicationsBlock() {
      const publicationContent = content.publicationContent || {
        lead: "",
        sections: (content.publicationSections || []).map((title) => ({
          title,
          text: "",
          items: [],
          groups: []
        }))
      };

      function publicationItems(items) {
        if (!items || !items.length) return "";

        return `
          <ul class="publication-items">
            ${items.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}
          </ul>
        `;
      }

      return `
        <section class="section section-publications">
          <div class="section-head">
            <p class="kicker">${labels.publicationsKicker}</p>
            <h2>${labels.publicationsTitle}</h2>
            ${publicationContent.lead ? `<p>${inlineMarkdown(publicationContent.lead)}</p>` : ""}
          </div>
          <div class="publication-list">
            ${publicationContent.sections.map((section) => `
              <article class="publication-section">
                <div class="publication-section-head">
                  <h3>${html(section.title)}</h3>
                  ${section.text ? `<p>${inlineMarkdown(section.text)}</p>` : ""}
                </div>
                <div class="publication-section-body">
                  ${publicationItems(section.items)}
                  ${(section.groups || []).map((group) => `
                    <section class="publication-year">
                      <h4>${html(group.title)}</h4>
                      ${publicationItems(group.items)}
                    </section>
                  `).join("")}
                </div>
              </article>
            `).join("")}
          </div>
        </section>
      `;
    }

    function mediaBlock() {
      return `
        <section class="section">
          <div class="section-head">
            <p class="kicker">${labels.mediaKicker}</p>
            <h2>${labels.mediaTitle}</h2>
          </div>
          <div class="media-list">
            ${content.mediaSections.map((title) => `
              <article class="media-placeholder">
                <div aria-hidden="true"></div>
                <h3>${title}</h3>
                <p>${placeholders.media}</p>
              </article>
            `).join("")}
          </div>
        </section>
      `;
    }

    const pages = {
      home: researchBlock(),
      news: newsBlock(),
      projects: projectsBlock(),
      people: peopleBlock(),
      students: studentsBlock(),
      publications: publicationsBlock(),
      media: mediaBlock()
    };

    app.innerHTML = `
      <header class="site-header">
        <div class="topbar">
          <a class="back-link" href="../../index.html">${content.themeSelector}</a>
          ${languageSwitch(language)}
        </div>
        <div class="brand">
          <img src="labicon.png" alt="${content.labName}">
          <div>
            <p class="theme-label">${themeName}</p>
            <h1>${content.labName}</h1>
            <p>${content.tagline}</p>
          </div>
        </div>
        <nav class="site-nav" aria-label="${labels.peopleTitle}">
          <a href="index.html" aria-current="${page === "home" ? "page" : "false"}">${content.home}</a>${nav}
        </nav>
      </header>
      <main class="page page-${page}">${pages[page] || pages.home}</main>
    `;

    app.querySelectorAll("[data-language]").forEach((button) => {
      button.addEventListener("click", () => {
        const nextLanguage = button.dataset.language;
        saveLanguage(nextLanguage);
        render(nextLanguage);
      });
    });
  }

  render(storedLanguage());
})();
