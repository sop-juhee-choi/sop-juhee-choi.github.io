/**
 * In-memory store for section data.
 * Data is fetched once and reused across re-renders.
 */
const STORE = {
  bio: null,
  honor: null,
  perf: null,
  edu: null,
};

/**
 * Fetch a JSON file and store it under STORE[key].
 *
 * @param {string} key - STORE key ("bio", "honor", "perf", "edu")
 * @param {string} url - JSON file URL
 * @returns {Promise<void>}
 */
function loadSection(key, url) {
  return fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load " + url);
      return res.json();
    })
    .then((json) => {
      STORE[key] = json;
    })
    .catch((err) => {
      // Fail silently in production; log for debugging
      console.error(err);
      STORE[key] = null;
    });
}

/**
 * Re-render all sections from cached STORE data.
 *
 * Assumes:
 * - renderBio, renderHonor, renderPerf exist
 * - Corresponding mount elements exist in DOM
 */
function renderAll() {
  if (STORE.bio) {
    const elBio = document.getElementById("bio-j-container");
    if (elBio) renderBio(STORE.bio, elBio);
  }

  if (STORE.honor) {
    const elHonor = document.getElementById("honor-j-container");
    if (elHonor) renderHonor(STORE.honor, elHonor);
  }

  if (STORE.perf) {
    const elPerf = document.getElementById("perf-container");
    if (elPerf) renderPerf(STORE.perf, elPerf);
  }

  if (STORE.edu) {
    const elEdu = document.getElementById("edu-j-container");
    if (elEdu) renderPerf(STORE.edu, elEdu);
  }

  // After rendering, optionally enable per-line fade-in on generated content.
  applyLineFadeIn();

  // If a fade refresh hook exists (defined in fade.js), call it.
  // This is necessary when fade-in targets are added after DOMContentLoaded.
  if (typeof window.refreshFadeIns === "function") {
    window.refreshFadeIns();
  }
}


/**
 * Initialize language from URL (?lang=ko|en) or localStorage.
 */
function initLanguage() {
  let langFromURL = null;

  try {
    const params = new URLSearchParams(window.location.search || "");
    langFromURL = params.get("lang");
  } catch (_) {}

  if (langFromURL === "ko" || langFromURL === "en") {
    setLanguage(langFromURL);
    return;
  }

  try {
    const saved = localStorage.getItem("lang");
    if (saved === "ko" || saved === "en") {
      setLanguage(saved);
      return;
    }
  } catch (_) {}

  setLanguage("en");
}

/**
 * Sync ALL language toggle UIs (flag icon) to match current I18N state.
 * Safe to call anytime; does nothing if no toggle exists yet.
 */
function syncLanguageToggleUI() {
  const flagSpans = document.querySelectorAll(".lang-toggle .lang-flag");
  if (!flagSpans.length) return;

  flagSpans.forEach((flagSpan) => {
    // Ensure base class exists
    flagSpan.classList.add("fi");

    // Reset both country classes
    flagSpan.classList.remove("fi-kr", "fi-us");

    // If current is English, show Korean flag as "next"
    if (I18N.current === "en") {
      flagSpan.classList.add("fi-kr");
    } else {
      flagSpan.classList.add("fi-us");
    }
  });

  // Update aria-label for all buttons
  const btns = document.querySelectorAll(".lang-toggle");
  btns.forEach((btn) => {
    btn.setAttribute(
      "aria-label",
      I18N.current === "en"
        ? "Switch language to Korean"
        : "Switch language to English"
    );
  });
}

/**
 * Bind language toggle using event delegation.
 * This works even if the button is injected later via HTML fragments.
 */
function bindLanguageToggle() {
  if (bindLanguageToggle._bound) return;
  bindLanguageToggle._bound = true;

  document.addEventListener("click", (ev) => {
    const btn =
      ev.target && ev.target.closest ? ev.target.closest(".lang-toggle") : null;
    if (!btn) return;

    const next = I18N.current === "en" ? "ko" : "en";
    setLanguage(next);

    // Update UI immediately
    syncLanguageToggleUI();

    // Re-render content for the new language
    if (typeof renderAll === "function") renderAll();
    if (typeof loadStatement === "function") loadStatement();
  });

  syncLanguageToggleUI();
}

/**
 * Apply per-line fade-in targets to dynamically rendered content.
 *
 * Strategy:
 * - Target common "line-level" elements inside `.xml-content` blocks.
 * - Add `.fade-in` class to those elements so the observer can animate them.
 *
 * Notes:
 * - This function is intentionally conservative; it only adds a class.
 * - Actual animation is controlled by CSS (`.fade-in` and `.fade-in.visible`).
 */
function applyLineFadeIn() {
  const containers = document.querySelectorAll(".xml-content");
  if (!containers.length) return;

  containers.forEach((container) => {
    // Typical line-level elements produced by renderers
    const lines = container.querySelectorAll("p, li");

    lines.forEach((line) => {
      // Avoid re-adding if already tagged
      if (!line.classList.contains("fade-in")) {
        line.classList.add("fade-in");
      }
    });
  });
}

/**
 * Bootstrap JSON pipeline.
 * Uses DOMContentLoaded to avoid conflicts with other load handlers.
 */
document.addEventListener("DOMContentLoaded", () => {
  initLanguage();
  bindLanguageToggle();

  Promise.all([
    loadSection("bio", "json/bio.json"),
    loadSection("honor", "json/honor.json"),
    loadSection("perf", "json/perf.json"),
    loadSection("edu", "json/edu.json"),
  ]).then(() => {
    renderAll();
    syncLanguageToggleUI();
  });
});