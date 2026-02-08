/**
 * Create a DOM element with an optional CSS class.
 *
 * This is a small helper to reduce repetitive
 * `document.createElement(...)` + `className` boilerplate.
 *
 * @param {string} tag - HTML tag name (e.g. "div", "ul", "li")
 * @param {string} [className] - Optional CSS class name
 * @returns {HTMLElement} The created DOM element
 */
function el(tag, className) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  return e;
}

/**
 * Append text to a parent element.
 * If a URL is provided, the text is wrapped in an <a> tag.
 * Otherwise, plain text is appended.
 *
 * This mirrors the old XSLT behavior where
 * elements sometimes had @link attributes and sometimes not.
 *
 * @param {HTMLElement} parent - Element to append content to
 * @param {string} text - Text content to display
 * @param {string|null} href - Optional URL for hyperlink
 */
function appendLinkedText(parent, text, href) {
  if (href) {
    const a = document.createElement("a");
    a.href = href;
    a.target = "_blank"; // Open external links in a new tab
    a.rel = "noopener noreferrer"; // Security best practice
    a.textContent = text;
    parent.appendChild(a);
  } else {
    parent.appendChild(document.createTextNode(text));
  }
}

/**
 * Append bold text (<b>) to a parent element.
 *
 * This replaces XSLT constructs like:
 *   <li><b><xsl:value-of ... /></b></li>
 *
 * Kept as a helper for clarity and consistency,
 * even though it's a small operation.
 *
 * @param {HTMLElement} parent - Element to append to
 * @param {string} text - Text to be displayed in bold
 */
function appendStrongText(parent, text) {
  const b = document.createElement("b");
  b.textContent = text;
  parent.appendChild(b);
}

/**
 * Global i18n state.
 *
 * - `current`: currently active language code
 * - `fallback`: language used when the current one is missing
 */
const I18N = {
  current: "en",
  fallback: "en",
};

/**
 * Normalize and validate a language code.
 *
 * @param {string|null|undefined} lang
 * @returns {"ko"|"en"} Normalized language
 */
function normalizeLang(lang) {
  return lang === "en" ? "en" : "ko";
}

/**
 * Set the active language and persist it.
 *
 * Notes:
 * - This function only updates state (and storage).
 * - It does NOT trigger any re-render by itself.
 *
 * @param {string} lang - Language code ("ko" or "en")
 */
function setLanguage(lang) {
  I18N.current = normalizeLang(lang);

  // Persist the current language choice (safe in normal browsers).
  try {
    localStorage.setItem("lang", I18N.current);
  } catch (_) {
    // Ignore storage errors (private mode, disabled storage, etc.)
  }
}

/**
 * Resolve a localized text value with development warnings for missing keys.
 *
 * Drop-in replacement for `t()` when you want warnings.
 *
 * @param {string|object|null|undefined} value
 * @returns {string}
 */
function t(value) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value && typeof value === "object") {
    if (!(I18N.current in value) && console && typeof console.warn === "function") {
      console.warn("Missing i18n key:", I18N.current, value);
    }

    const resolved =
      value[I18N.current] ??
      value[I18N.fallback] ??
      "";
    return String(resolved).trim();
  }

  return "";
}

/**
 * Resolve a localized hyperlink value.
 *
 * Accepts either:
 * - string
 * - { ko: "...", en: "..." }
 *
 * @param {string|object|null|undefined} value
 * @returns {string} Resolved URL or empty string
 */
function thref(value) {
  return t(value);
}