// ============================================================================
// UTILITIES
// ============================================================================

const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);

const querySelector = (selector) => document.querySelector(selector);
const querySelectorAll = (selector) => Array.from(document.querySelectorAll(selector));

const createAnchorId = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

const toggleClass = (element, className, condition) => {
  element.classList.toggle(className, condition);
};

const insertHTML = (element, position, html) => {
  element.insertAdjacentHTML(position, html);
};

// ============================================================================
// DARK MODE
// ============================================================================

const createDarkModeToggle = () => `
  <input type="checkbox" id="darkmode">
  <label for="darkmode" class="toggle">
    <span>Toggle dark mode</span>
  </label>
`;

const applyTheme = (isDark) => {
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
};

const initDarkModeToggler = () => {
  const toggler = querySelector(".dark-mode-toggler");
  if (!toggler) return;

  insertHTML(toggler, "afterbegin", createDarkModeToggle());

  const checkbox = toggler.querySelector("#darkmode");
  applyTheme(checkbox.checked);
  checkbox.addEventListener("change", (e) => applyTheme(e.target.checked));
};

// ============================================================================
// MENU AUTOCOMPLETE
// ============================================================================

const createChapterMenuItem = (chapter, chapterId) => `
  <details>
    <summary>
      <a href="#${chapterId}" data-target="${chapterId}">
        ${chapter.textContent}
      </a>
    </summary>
    <ul></ul>
  </details>
`;

const createSectionMenuItem = (section, sectionId) => `
  <li>
    <a href="#${sectionId}" data-target="${sectionId}">
      ${section.textContent}
    </a>
  </li>
`;

const buildSections = (menu, chapterIndex) => {
  const sections = querySelectorAll(
    `.auto-list > section:nth-of-type(${chapterIndex + 1}) > h2`
  );
  const detailsList = menu.querySelector(`details:nth-of-type(${chapterIndex + 1}) > ul`);

  sections.forEach((section) => {
    const sectionId = createAnchorId(section.textContent);
    section.id = sectionId;
    insertHTML(detailsList, "beforeend", createSectionMenuItem(section, sectionId));
  });
};

const buildChapter = (menu) => (chapter, index) => {
  const chapterId = createAnchorId(chapter.textContent);
  chapter.id = chapterId;
  insertHTML(menu, "beforeend", createChapterMenuItem(chapter, chapterId));
  buildSections(menu, index);
};

const buildMenu = (menu) => {
  const chapters = querySelectorAll(".auto-list > h1");
  chapters.forEach(buildChapter(menu));
};

const initMenuAutocomplete = () => {
  const menus = querySelectorAll("nav.auto-complete");
  if (menus.length === 0) return;
  menus.forEach(buildMenu);
};

// ============================================================================
// CHAPTER DISPLAY
// ============================================================================

const getFirstChapterId = () => querySelector(".auto-list > h1:first-of-type")?.id || "";

const getCurrentAnchor = (defaultId) =>
  window.location.hash ? window.location.hash.substring(1) : defaultId;

const getChapterSelectors = (anchor) => [
  `.auto-list > h1#${anchor} + section`,
  `.auto-list > h1#${anchor}`,
  `.auto-list > h1 + section:has(#${anchor})`,
  `.auto-list > h1:has(+ section > #${anchor})`,
].join(", ");

const updateChapterVisibility = (anchor) => {
  const allChapters = querySelectorAll(".auto-list > h1 + section, .auto-list > h1");
  if (allChapters.length === 0) return;

  const selectedChapters = querySelectorAll(getChapterSelectors(anchor));

  allChapters.forEach((chapter) => {
    toggleClass(chapter, "collapsed", !selectedChapters.includes(chapter));
  });
};

const updateDetailsState = (anchor) => {
  querySelectorAll(".auto-complete > details").forEach((details) => {
    details.removeAttribute("open");
  });

  const targetDetails = querySelector(`[data-target="${anchor}"]`)?.closest("details");
  if (targetDetails) {
    targetDetails.setAttribute("open", true);
  }
};

const displayChapters = (anchor) => {
  updateChapterVisibility(anchor);
  updateDetailsState(anchor);
};

const initChapterDisplay = () => {
  const firstChapterId = getFirstChapterId();
  const initialAnchor = getCurrentAnchor(firstChapterId);

  displayChapters(initialAnchor);

  window.addEventListener("hashchange", () => {
    const anchor = getCurrentAnchor(firstChapterId);
    displayChapters(anchor);
  });
};

// ============================================================================
// BURGER MENU
// ============================================================================

const createBurgerIcon = () => `
  <li>
    <a class='burger-icon'>
      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="thumb-1"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
    </a>
  </li>
`;

const createBurgerOverlay = () => {
  const overlay = document.createElement("ul");
  overlay.classList.add("burger-menu-overlay");
  insertHTML(
    overlay,
    "afterbegin",
    "<li><a class='burger-close'><svg viewBox='0 0 24 24' width='24' height='24' stroke='currentColor' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round' class='feather'><line x1='18' y1='6' x2='6' y2='18'></line><line x1='6' y1='6' x2='18' y2='18'></line></svg></a></li>"
  );
  return overlay;
};

const setupHeaderBurgerMenu = () => {
  const navLinks = querySelectorAll(
    "body > .container header nav > ul:not(:first-of-type) > li:not(.separator, .dark-mode-toggler)"
  );
  if (navLinks.length === 0) return;

  navLinks.forEach((li) => {
    if (!li.classList.contains("burger-menu")) {
      li.classList.add("phone-burger-menu");
    }
  });

  let overlay = querySelector(".burger-menu-overlay");
  if (!overlay) {
    overlay = createBurgerOverlay();
    querySelectorAll(".burger-menu, .phone-burger-menu").forEach((li) => {
      const item = li.cloneNode(true);
      item.querySelector("a").addEventListener('click', () => {
        li.querySelector("a").click();
        overlay.classList.toggle("open");
    });
      overlay.append(item);
    });
    querySelector("header").append(overlay);
  }

  const firstNav = navLinks[0].parentElement.children[0].children[0];
  if (!firstNav.classList.contains("burger-icon")) {
    insertHTML(navLinks[0], "beforebegin", createBurgerIcon());
  }

  querySelectorAll("header .burger-icon, header .burger-close").forEach((el) => {
    el.addEventListener("click", () => {
      querySelector("header .burger-menu-overlay").classList.toggle("open");
    });
  });
};

const setupSidebarBurgerMenu = () => {
  const breadcrumb = querySelector(".breadcrumb");
  const sidebar = querySelector("body > .container .container.grid > aside");

  if (breadcrumb) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isSticky = entry.intersectionRatio < 1;
        toggleClass(entry.target, "sticky", isSticky);
        if (sidebar) toggleClass(sidebar, "sticky", isSticky);
      },
      { threshold: [1] }
    );

    observer.observe(breadcrumb);

    insertHTML(
      breadcrumb.children[0],
      "beforeend",
      "<li class='breadcrumb-burger-menu'><svg viewBox='0 0 24 24' width='24' height='24' stroke='currentColor' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round' class='thumb-1'><line x1='3' y1='12' x2='21' y2='12'></line><line x1='3' y1='6' x2='21' y2='6'></line><line x1='3' y1='18' x2='21' y2='18'></line></svg>"
    );

    querySelector(".breadcrumb-burger-menu").addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });
  }

  if (sidebar) {
    const links = querySelectorAll("aside li > a");
    links.forEach((el) => {
      el.addEventListener("click", () => sidebar.classList.toggle("open"));
    });
  }
};

const initBurgerMenu = () => {
  setupHeaderBurgerMenu();
  setupSidebarBurgerMenu();
};

// ============================================================================
// MODALS
// ============================================================================

const MODAL_CONFIG = {
  isOpenClass: "modal-is-open",
  openingClass: "modal-is-opening",
  closingClass: "modal-is-closing",
  scrollbarWidthVar: "--pico-scrollbar-width",
  animationDuration: 400,
};

let visibleModal = null;

const getScrollbarWidth = () =>
  window.innerWidth - document.documentElement.clientWidth;

const setScrollbarWidth = (width) => {
  if (width) {
    document.documentElement.style.setProperty(MODAL_CONFIG.scrollbarWidthVar, `${width}px`);
  }
};

const removeScrollbarWidth = () => {
  document.documentElement.style.removeProperty(MODAL_CONFIG.scrollbarWidthVar);
};

const addHtmlClasses = (...classes) => {
  document.documentElement.classList.add(...classes);
};

const removeHtmlClasses = (...classes) => {
  document.documentElement.classList.remove(...classes);
};

const createModalHeader = () => {
  const header = document.createElement("header");
  insertHTML(header, "afterbegin", "<button aria-label='close' rel='prev'></button>");
  return header;
};

const ensureModalStructure = (modal) => {
  let header = modal.querySelector("header");
  if (!header) {
    header = createModalHeader();
    modal.prepend(header);

    const heading = modal.querySelector("h1, h2, h3, hgroup");
    if (heading) {
      heading.parentNode.insertBefore(header, heading);
      header.appendChild(heading);
    }
  }

  let article = modal.querySelector("article");
  if (!article) {
    article = document.createElement("article");
    while (modal.firstChild) {
      article.appendChild(modal.firstChild);
    }
    modal.appendChild(article);
  }
};

const openModal = (modal) => {
  const scrollbarWidth = getScrollbarWidth();
  setScrollbarWidth(scrollbarWidth);

  addHtmlClasses(MODAL_CONFIG.isOpenClass, MODAL_CONFIG.openingClass);

  setTimeout(() => {
    visibleModal = modal;
    removeHtmlClasses(MODAL_CONFIG.openingClass);
  }, MODAL_CONFIG.animationDuration);

  modal.showModal();
  modal.querySelector("button[rel='prev']").blur();
};

const closeModal = (modal) => {
  visibleModal = null;
  addHtmlClasses(MODAL_CONFIG.closingClass);

  setTimeout(() => {
    removeHtmlClasses(MODAL_CONFIG.closingClass, MODAL_CONFIG.isOpenClass);
    removeScrollbarWidth();
    modal.close();
  }, MODAL_CONFIG.animationDuration);
};

const toggleModal = (event, modal) => {
  event.preventDefault();
  if (!modal) return;
  modal.open ? closeModal(modal) : openModal(modal);
};

const setupModalListeners = (modal) => {
  modal.previousElementSibling?.addEventListener("click", (e) => toggleModal(e, modal));
  modal.querySelector("button[rel='prev']")?.addEventListener("click", (e) => toggleModal(e, modal));
};

const setupGlobalModalListeners = () => {
  document.addEventListener("click", (event) => {
    if (!visibleModal) return;

    const modalContent = visibleModal.querySelector("article");
    const isClickInside = modalContent.contains(event.target);
    if (!isClickInside) closeModal(visibleModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && visibleModal) {
      closeModal(visibleModal);
    }
  });
};

const initModals = () => {
  const modals = querySelectorAll("dialog");
  if (modals.length === 0) return;

  modals.forEach((modal) => {
    ensureModalStructure(modal);
    setupModalListeners(modal);
  });

  setupGlobalModalListeners();
};

// ============================================================================
// INITIALIZATION
// ============================================================================

const initializeApp = () => {
  initDarkModeToggler();
  initMenuAutocomplete();
  initChapterDisplay();
  initBurgerMenu();
  initModals();

  if (typeof AOS !== "undefined") AOS.init();
};

document.addEventListener("DOMContentLoaded", initializeApp);