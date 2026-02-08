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
}

/**
 * Read initial language from URL query (?lang=ko|en) or localStorage.
 *
 * Priority:
 * 1) URL query parameter `lang`
 * 2) localStorage key "lang"
 * 3) default "ko"
 */
function initLanguage() {
  let langFromURL = null;

  try {
    const params = new URLSearchParams(window.location.search || "");
    langFromURL = params.get("lang");
  } catch (_) {
    // Ignore URL parsing errors
  }

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
  } catch (_) {
    // Ignore storage access errors
  }

  // Default
  setLanguage("ko");
}

/**
 * Sync ALL language toggle UIs (emoji) to match current I18N state.
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

    if (I18N.current === "en") {
      flagSpan.classList.add("fi-us");
    } else {
      flagSpan.classList.add("fi-kr");
    }
  });

  // Optional: update aria-label for all buttons too
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
    const btn = ev.target && ev.target.closest
      ? ev.target.closest(".lang-toggle")
      : null;
    if (!btn) return;

    const next = (I18N.current === "en") ? "ko" : "en";
    setLanguage(next);

    // Update visual flag
    syncLanguageToggleUI();

    // Update accessibility label (important)
    btn.setAttribute(
      "aria-label",
      I18N.current === "en"
        ? "Switch language to Korean"
        : "Switch language to English"
    );

    // Re-render content
    if (typeof renderAll === "function") renderAll();
  });

  syncLanguageToggleUI();
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

// /**
//  * Fetches a JSON file and renders its contents into a container
//  * using the provided renderer function.
//  *
//  * @param {string} url - URL of the JSON data to fetch
//  * @param {string} containerId - ID of the DOM element to render into
//  * @param {Function} renderer - Rendering function (json, container) => void
//  */
// async function loadAndRender(url, containerId, renderer) {
//   // Locate the target container in the DOM
//   const container = document.getElementById(containerId);
//   if (!container) return; // Abort silently if container does not exist

//   try {
//     // Fetch JSON data
//     const resp = await fetch(url);
//     if (!resp.ok) {
//       throw new Error(`Failed to load: ${resp.status}`);
//     }

//     // Parse response as JSON
//     const json = await resp.json();

//     // Clear existing content before rendering
//     container.innerHTML = "";

//     // Delegate actual DOM construction to the renderer
//     renderer(json, container);

//     // Re-run MathJax if present (needed after dynamic DOM insertion)
//     if (window.MathJax && typeof window.MathJax.typeset === "function") {
//       window.MathJax.typeset();
//     }
//   } catch (e) {
//     // Log error for debugging
//     console.error(e);

//     // Fallback user-visible error message
//     container.textContent = "Error loading data.";
//   }
// }

// loadAndRender("json/bio.json",   "bio-j-container",   renderBio);
// loadAndRender("json/edu.json",   "edu-j-container",   renderPerf);
// loadAndRender("json/honor.json", "honor-j-container", renderHonor);
// loadAndRender("json/perf.json",  "perf-container",    renderPerf);