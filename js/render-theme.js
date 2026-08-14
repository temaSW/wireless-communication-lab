(function () {
  const content = window.LAB_CONTENT;
  const app = document.querySelector("[data-render-theme]");
  if (!content || !app) return;

  const page = document.body.dataset.page || "home";
  const themeName = document.body.dataset.themeName || "Theme preview";

  document.title = `${content.labName} - ${themeName}`;

  const nav = content.sections
    .map((section) => `<a href="${section.href}">${section.title}</a>`)
    .join("");

  function researchBlock() {
    return `
      <section class="section section-research">
        <div class="section-head">
          <p class="kicker">Research Interests</p>
          <h2>Research</h2>
        </div>
        <div class="interest-list">
          ${content.researchInterests.map((item) => `<article>${item}</article>`).join("")}
        </div>
      </section>
    `;
  }

  function projectsBlock() {
    return `
      <section class="section section-projects">
        <div class="section-head">
          <p class="kicker">Current Work</p>
          <h2>Projects</h2>
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
          <p class="kicker">Laboratory Team</p>
          <h2>People</h2>
        </div>
        ${content.peopleGroups.map((group) => `
          <section class="people-group" aria-label="${group.title}">
            <h3>${group.title}</h3>
            <div class="people-list">
              ${group.people.map((name) => `
                <article class="person">
                  <div class="photo-placeholder" aria-hidden="true"></div>
                  <h4>${name}</h4>
                  <dl>
                    <dt>Email</dt><dd>placeholder</dd>
                    <dt>ORCID</dt><dd>placeholder</dd>
                    <dt>Google Scholar</dt><dd>placeholder</dd>
                    <dt>External profile</dt><dd>placeholder</dd>
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
          <p class="kicker">Outputs</p>
          <h2>Publications</h2>
        </div>
        <div class="publication-list">
          ${content.publicationSections.map((title) => `
            <article class="publication-section">
              <h3>${title}</h3>
              <p>TODO</p>
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
          <p class="kicker">Media</p>
          <h2>Media</h2>
        </div>
        <div class="media-list">
          ${content.mediaSections.map((title) => `
            <article class="media-placeholder">
              <div aria-hidden="true"></div>
              <h3>${title}</h3>
              <p>Placeholder</p>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  const pages = {
    home: researchBlock() + projectsBlock(),
    research: researchBlock(),
    projects: projectsBlock(),
    people: peopleBlock(),
    publications: publicationsBlock(),
    media: mediaBlock()
  };

  app.innerHTML = `
    <header class="site-header">
      <a class="back-link" href="../../index.html">Theme selector</a>
      <div class="brand">
        <img src="labicon.png" alt="Wireless Communication Laboratory icon">
        <div>
          <p class="theme-label">${themeName}</p>
          <h1>${content.labName}</h1>
          <p>${content.tagline}</p>
        </div>
      </div>
      <nav class="site-nav" aria-label="Preview sections">
        <a href="index.html">Home</a>${nav}
      </nav>
    </header>
    <main>${pages[page] || pages.home}</main>
  `;
})();
