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
              <article>
                <h3>${item.title}</h3>
                <p>${item.text}</p>
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
                ${group.people.map((name) => `
                  <article class="person">
                    <div class="photo-placeholder" aria-hidden="true"></div>
                    <p class="person-role">${group.title}</p>
                    <h4>${name}</h4>
                    <dl class="profile-list">
                      <dt>${placeholders.email}</dt><dd>${placeholders.value}</dd>
                      <dt>${placeholders.orcid}</dt><dd>${placeholders.value}</dd>
                      <dt>${placeholders.scholar}</dt><dd>${placeholders.value}</dd>
                      <dt>${placeholders.profile}</dt><dd>${placeholders.value}</dd>
                    </dl>
                  </article>
                `).join("")}
              </div>
            </section>
          `).join("")}
        </section>
      `;
    }

    function publicationsBlock() {
      return `
        <section class="section">
          <div class="section-head">
            <p class="kicker">${labels.publicationsKicker}</p>
            <h2>${labels.publicationsTitle}</h2>
          </div>
          <div class="publication-list">
            ${content.publicationSections.map((title) => `
              <article class="publication-section">
                <h3>${title}</h3>
                <p>${placeholders.todo}</p>
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
