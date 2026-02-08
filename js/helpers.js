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