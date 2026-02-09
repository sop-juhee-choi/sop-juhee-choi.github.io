/* =========================================================
 * helper.js
 * =========================================================
 * Shared helper utilities for DOM construction, rendering,
 * internationalization, and small UI interactions.
 *
 * This file intentionally contains:
 *   - Low-level DOM helpers (element creation, text insertion)
 *   - Safe text / HTML handling utilities
 *   - Minimal i18n state and resolvers
 *   - Small, reusable UI behaviors that do not belong
 *     to any specific page or renderer
 *
 * Design principles:
 *   - No page-specific logic
 *   - No hard dependency on markup structure
 *   - Safe-by-default DOM manipulation
 *   - Progressive enhancement (features fail gracefully)
 *
 * NOTE:
 * - This file is loaded globally.
 * - Functions here should remain generic and reusable.
 * ========================================================= */

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
 * Append HTML content to a parent element, optionally wrapped in a hyperlink.
 *
 * This is a controlled alternative to appendLinkedText() that allows
 * a very small, explicitly whitelisted subset of inline HTML markup
 * (currently: <em> only).
 *
 * Intended use cases:
 * - Titles or labels where light semantic emphasis is needed
 *   (e.g. italicized work titles in performance lists).
 * - JSON/XML data that may contain limited inline markup.
 *
 * IMPORTANT:
 * - The input is always sanitized.
 * - All HTML tags are escaped by default.
 * - Only <em> and </em> are re-enabled explicitly.
 *
 * @param {HTMLElement} parent - Element to append content to
 * @param {string} html - Raw text that may contain limited inline markup
 * @param {string|null} href - Optional URL for hyperlink
 */
function appendLinkedHTML(parent, html, href) {
  if (href) {
    const a = document.createElement("a");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.innerHTML = sanitizeAllowEm(html);
    parent.appendChild(a);
  } else {
    const span = document.createElement("span");
    span.innerHTML = sanitizeAllowEm(html);
    parent.appendChild(span);
  }
}

/**
 * Sanitize a string while allowing <em> tags only.
 *
 * This function performs the following steps:
 * 1. Escapes all HTML special characters to neutralize markup.
 * 2. Re-enables <em> and </em> tags explicitly (case-insensitive).
 *
 * The result is safe to insert via innerHTML *only* for the
 * narrowly defined allowed tag set.
 *
 * This mirrors a common XSLT pattern where emphasis was encoded
 * structurally and must now be reconstructed in HTML.
 *
 * @param {string} raw - Raw input string (possibly containing markup)
 * @returns {string} - Sanitized HTML string with <em> preserved
 */
function sanitizeAllowEm(raw) {
  raw = String(raw ?? "");
  const escaped = raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .replace(/&lt;em&gt;/gi, "<em>")
    .replace(/&lt;\/em&gt;/gi, "</em>");
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

/**
 * Email copy-to-clipboard interaction.
 *
 * This attaches a click handler to elements with the
 * `.email-copy` class and performs the following:
 *
 * 1. Reconstructs the email address from data attributes
 *    (`data-user` + `data-domain`) to avoid exposing the
 *    full address in the DOM.
 * 2. Copies the reconstructed email address to the clipboard.
 * 3. Temporarily toggles the `copied` CSS class to provide
 *    visual feedback (e.g. "✓" indicator).
 *
 * This implementation is intentionally:
 * - Minimal and dependency-free
 * - Resistant to naive email scraping
 * - Non-intrusive (no alerts or blocking UI)
 *
 * The visual feedback timing is controlled purely via
 * CSS + a short timeout, keeping logic simple.
 */
document.querySelectorAll(".email-copy").forEach(btn => {
  let timer = null;

  btn.addEventListener("click", async () => {
    const user = btn.dataset.user;
    const domain = btn.dataset.domain;
    const email = `${user}@${domain}`;

    try {
      await navigator.clipboard.writeText(email);

      btn.classList.add("copied");

      clearTimeout(timer);
      timer = setTimeout(() => {
        btn.classList.remove("copied");
      }, 1500);

    } catch (e) {
      // Clipboard API may fail in older browsers
      // or restricted contexts (e.g. non-HTTPS).
      console.error("Clipboard failed", e);
    }
  });
});