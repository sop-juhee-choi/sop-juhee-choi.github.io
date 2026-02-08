/**
 * Load an external HTML fragment and inject it into a target container.
 *
 * @param {string} filePath - Path to the HTML file
 * @param {string} divId - Target container ID
 * @returns {Promise<boolean>} Resolves true if loaded OK, false otherwise
 */
function loadExternalHTML(filePath, divId) {
  return fetch(filePath)
    .then((response) => {
      if (!response.ok) return false;
      return response.text();
    })
    .then((data) => {
      if (data === false) return false;

      const target = document.getElementById(divId);
      if (!target) return false;

      target.innerHTML = data;

      if (window.MathJax) {
        MathJax.typeset();
      }
      return true;
    })
    .catch((error) => {
      console.error("Error loading external HTML:", error);
      return false;
    });
}

/**
 * Load statement fragment according to current language (with KO fallback).
 *
 * Assumes:
 * - I18N.current exists ("ko"|"en")
 */
function loadStatement() {
  const lang = (typeof I18N !== "undefined" && I18N.current === "en") ? "en" : "ko";
  const primary = `statement.${lang}.html`;
  const fallback = "statement.ko.html";

  return loadExternalHTML(primary, "self-state").then((ok) => {
    if (ok) return true;
    if (primary === fallback) return false;
    return loadExternalHTML(fallback, "self-state");
  });
}

/**
 * Initial load after window load.
 * Also sync toggle emoji if needed.
 */
window.addEventListener("load", () => {
  loadStatement().then(() => {
    if (typeof syncLanguageToggleUI === "function") {
      syncLanguageToggleUI();
    }
  });
});