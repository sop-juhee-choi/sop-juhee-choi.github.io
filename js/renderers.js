/**
 * Create a DOM element with an optional className.
 *
 * Why this exists:
 * - Keeps the renderer code short and consistent.
 * - Avoids repeating `document.createElement()` + `className` boilerplate.
 *
 * @param {string} tag - HTML tag name (e.g., "ul", "li", "div").
 * @param {string} [className] - Optional class string to apply.
 * @returns {HTMLElement} Newly created element.
 */
function el(tag, className) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  return e;
}

/**
 * Append either:
 * - an <a> link (if href is provided), or
 * - a plain text node (if href is empty / missing)
 *
 * Why this exists:
 * - Your JSON often has "title" + optional "link".
 * - The original XSL used <xsl:choose> to decide whether to wrap in <a>.
 * - This helper reproduces that behavior exactly and consistently.
 *
 * Security note:
 * - rel="noopener noreferrer" prevents the new tab from controlling the opener window.
 *
 * @param {Node} parent - The DOM node to append into.
 * @param {string} text - Visible text.
 * @param {string} href - URL for the link. If falsy, plain text is appended.
 */
function appendLinkedText(parent, text, href) {
  if (href) {
    const a = document.createElement("a");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = text;
    parent.appendChild(a);
  } else {
    parent.appendChild(document.createTextNode(text));
  }
}

/**
 * Append a <b>text</b> node into parent.
 *
 * Why this exists:
 * - Some sections (e.g., Honor in your original XSL) used bold styling in the title line.
 * - This helper makes that intent explicit.
 *
 * @param {Node} parent - The DOM node to append into.
 * @param {string} text - Text to be bold.
 */
function appendStrongText(parent, text) {
  const b = document.createElement("b");
  b.textContent = text;
  parent.appendChild(b);
}

/**
 * Render "bio" section JSON into DOM (XSL-equivalent).
 *
 * Expected JSON shape:
 * {
 *   "feed": {
 *     "entries": [
 *       { "title": "...", "link": "https://..." },
 *       ...
 *     ]
 *   }
 * }
 *
 * Output structure (matches your XSL-derived DOM):
 * <ul class="outlined-text no-bullets">
 *   <li class="outlined-text"><a ...>Title</a></li>  (or plain text)
 *   ...
 * </ul>
 *
 * @param {object} data - Parsed JSON object (bio.json).
 * @param {HTMLElement} container - DOM node where the content is inserted.
 */
function renderBio(data, container) {
  // Defensive: if feed/container is missing, do nothing silently.
  const feed = data && data.feed ? data.feed : null;
  if (!feed || !container) return;

  // Outer list container (same classes as your site styling expects).
  const ulOuter = el("ul", "outlined-text no-bullets");

  // Normalize entries to a safe array.
  const entries = Array.isArray(feed.entries) ? feed.entries : [];
  entries.forEach((entry) => {
    // Each entry becomes one <li class="outlined-text">...</li>
    const li = el("li", "outlined-text");

    // Normalize title/link to strings (and trim whitespace).
    const titleText = (entry && entry.title ? String(entry.title) : "").trim();
    const titleLink = (entry && entry.link ? String(entry.link) : "").trim();

    // If link exists -> <a>, otherwise plain text.
    appendLinkedText(li, titleText, titleLink);

    ulOuter.appendChild(li);
  });

  // Append the finished list into the target container.
  container.appendChild(ulOuter);
}

/**
 * Render "honor" section JSON into DOM (XSL-equivalent).
 *
 * Expected JSON shape:
 * {
 *   "feed": {
 *     "entries": [
 *       {
 *         "title": "...",
 *         "link": "https://...",     // optional
 *         "descs": [
 *           { "title": "...", "link": "https://..." },  // optional link
 *           ...
 *         ]
 *       },
 *       ...
 *     ]
 *   }
 * }
 *
 * Output structure (matches your XSL-derived DOM):
 * <ul class="outlined-text no-bullets">
 *   <li class="outlined-text-semibig">Title (maybe linked)</li>
 *   <ul class="no-bullets"><li>desc (maybe linked)</li></ul>
 *   <ul class="no-bullets"><li>desc (maybe linked)</li></ul>
 *   <br>
 *   ...
 * </ul>
 *
 * @param {object} data - Parsed JSON object (honor.json).
 * @param {HTMLElement} container - DOM node where the content is inserted.
 */
function renderHonor(data, container) {
  const feed = data && data.feed ? data.feed : null;
  if (!feed || !container) return;

  const ulOuter = el("ul", "outlined-text no-bullets");

  const entries = Array.isArray(feed.entries) ? feed.entries : [];
  entries.forEach((entry) => {
    // 1) Title line for the entry (semibig)
    const liTitle = el("li", "outlined-text-semibig");

    const titleText = (entry && entry.title ? String(entry.title) : "").trim();
    const titleLink = (entry && entry.link ? String(entry.link) : "").trim();

    // Keep XSL logic: title may be a link or plain text.
    appendLinkedText(liTitle, titleText, titleLink);
    ulOuter.appendChild(liTitle);

    // 2) For each desc, create: <ul class="no-bullets"><li>...</li></ul>
    const descs = Array.isArray(entry && entry.descs) ? entry.descs : [];
    descs.forEach((desc) => {
      const ulDetail = el("ul", "no-bullets");
      const li = el("li");

      const descTitleText = (desc && desc.title ? String(desc.title) : "").trim();
      const descTitleLink = (desc && desc.link ? String(desc.link) : "").trim();

      appendLinkedText(li, descTitleText, descTitleLink);

      ulDetail.appendChild(li);
      ulOuter.appendChild(ulDetail);
    });

    // 3) Entry-level line break (mirrors <br/> in XSL)
    ulOuter.appendChild(document.createElement("br"));
  });

  container.appendChild(ulOuter);
}

/**
 * Render "perf" OR "edu" section JSON into DOM (they share the same structure).
 *
 * Expected JSON shape (both perf.json and edu.json):
 * {
 *   "feed": {
 *     "entries": [
 *       {
 *         "title": "...",
 *         "link": "https://...",    // optional
 *         "perfs": [
 *           {
 *             "title": "...",
 *             "link": "https://...",  // optional
 *             "locs": [
 *               { "text": "...", "link": "https://..." },  // link optional
 *               ...
 *             ]
 *           },
 *           ...
 *         ]
 *       },
 *       ...
 *     ]
 *   }
 * }
 *
 * Output structure (matches your XSL-derived DOM):
 * <ul class="outlined-text no-bullets">
 *   <li class="outlined-text-semibig">Entry title</li>
 *   <ul class="no-bullets">
 *     <li>Perf title</li>
 *     <ul class="no-bullets"><li>Loc</li></ul>
 *     <ul class="no-bullets"><li>Loc</li></ul>
 *   </ul>
 *   <br>
 *   ...
 *   <br>   (feed-level <br/> kept to match your current renderer behavior)
 * </ul>
 *
 * @param {object} data - Parsed JSON object (perf.json or edu.json).
 * @param {HTMLElement} container - DOM node where the content is inserted.
 */
function renderPerf(data, container) {
  const feed = data && data.feed ? data.feed : null;
  if (!feed || !container) return;

  const ulOuter = el("ul", "outlined-text no-bullets");

  const entries = Array.isArray(feed.entries) ? feed.entries : [];
  entries.forEach((entry) => {
    // 1) Entry title (semibig)
    const liTitle = el("li", "outlined-text-semibig");

    const titleText = (entry && entry.title ? String(entry.title) : "").trim();
    const titleLink = (entry && entry.link ? String(entry.link) : "").trim();

    appendLinkedText(liTitle, titleText, titleLink);
    ulOuter.appendChild(liTitle);

    // 2) Each "perf" block becomes one <ul class="no-bullets"> ... </ul>
    const perfs = Array.isArray(entry && entry.perfs) ? entry.perfs : [];
    perfs.forEach((perf) => {
      const ulPerf = el("ul", "no-bullets");

      // 2a) Perf title line
      const liPerf = el("li");
      const perfTitleText = (perf && perf.title ? String(perf.title) : "").trim();
      const perfTitleLink = (perf && perf.link ? String(perf.link) : "").trim();
      appendLinkedText(liPerf, perfTitleText, perfTitleLink);
      ulPerf.appendChild(liPerf);

      // 2b) Perf locations list (each loc is wrapped as its own <ul><li>...</li></ul>)
      const locs = Array.isArray(perf && perf.locs) ? perf.locs : [];
      locs.forEach((loc) => {
        const ulLoc = el("ul", "no-bullets");
        const liLoc = el("li");

        // Loc objects are { text, link } in your JSON.
        const text = (loc && loc.text ? String(loc.text) : "").trim();
        const href = (loc && loc.link ? String(loc.link) : "").trim();

        appendLinkedText(liLoc, text, href);

        ulLoc.appendChild(liLoc);
        ulPerf.appendChild(ulLoc);
      });

      // Add this perf block to the outer list, then a <br/> after each perf.
      ulOuter.appendChild(ulPerf);
      ulOuter.appendChild(document.createElement("br"));
    });
  });

  // Feed-level <br/> (kept because your current renderer adds it)
  ulOuter.appendChild(document.createElement("br"));

  container.appendChild(ulOuter);
}