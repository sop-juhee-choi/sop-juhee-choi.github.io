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
 * Notes for i18n (A-style):
 * - `title` (and optional `link`) may be either:
 *   - string
 *   - { ko: "...", en: "..." }
 * - The resolver helpers `t()` and `thref()` must exist in scope.
 *
 * @param {object} data - Parsed JSON object (bio.json).
 * @param {HTMLElement} container - DOM node where the content is inserted.
 */
function renderBio(data, container) {
  // Defensive: if feed/container is missing, do nothing silently.
  const feed = data && data.feed ? data.feed : null;
  if (!feed || !container) return;

  // Clear container to support re-rendering (e.g., language toggle) without duplication.
  container.textContent = "";

  // Outer list container (same classes as your site styling expects).
  const ulOuter = el("ul", "outlined-text no-bullets");

  // Normalize entries to a safe array.
  const entries = Array.isArray(feed.entries) ? feed.entries : [];
  entries.forEach((entry) => {
    // Each entry becomes one <li class="outlined-text">...</li>
    const li = el("li", "outlined-text");

    // Resolve localized title/link safely.
    const titleText = t(entry && entry.title);
    const titleLink = thref(entry && entry.link);

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
 * Notes for i18n (A-style):
 * - `title` fields (entry.title, desc.title) and optional links may be either:
 *   - string
 *   - { ko: "...", en: "..." }
 * - The resolver helpers `t()` and `thref()` must exist in scope.
 *
 * @param {object} data - Parsed JSON object (honor.json).
 * @param {HTMLElement} container - DOM node where the content is inserted.
 */
function renderHonor(data, container) {
  const feed = data && data.feed ? data.feed : null;
  if (!feed || !container) return;

  // Clear container to support re-rendering (e.g., language toggle) without duplication.
  container.textContent = "";

  const ulOuter = el("ul", "outlined-text no-bullets");

  const entries = Array.isArray(feed.entries) ? feed.entries : [];
  entries.forEach((entry) => {
    // 1) Title line for the entry (semibig)
    const liTitle = el("li", "outlined-text-semibig");

    const titleText = t(entry && entry.title);
    const titleLink = thref(entry && entry.link);

    // Keep XSL logic: title may be a link or plain text.
    appendLinkedText(liTitle, titleText, titleLink);
    ulOuter.appendChild(liTitle);

    // 2) For each desc, create: <ul class="no-bullets"><li>...</li></ul>
    const descs = Array.isArray(entry && entry.descs) ? entry.descs : [];
    descs.forEach((desc) => {
      const ulDetail = el("ul", "no-bullets");
      const li = el("li");

      const descTitleText = t(desc && desc.title);
      const descTitleLink = thref(desc && desc.link);

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
 * Notes for i18n (A-style):
 * - `title` and `text` fields (entry.title, perf.title, loc.text) and optional links
 *   may be either:
 *   - string
 *   - { ko: "...", en: "..." }
 * - The resolver helpers `t()` and `thref()` must exist in scope.
 *
 * @param {object} data - Parsed JSON object (perf.json or edu.json).
 * @param {HTMLElement} container - DOM node where the content is inserted.
 */
function renderPerf(data, container) {
  const feed = data && data.feed ? data.feed : null;
  if (!feed || !container) return;

  // Clear container to support re-rendering (e.g., language toggle) without duplication.
  container.textContent = "";

  const ulOuter = el("ul", "outlined-text no-bullets");

  const entries = Array.isArray(feed.entries) ? feed.entries : [];
  entries.forEach((entry) => {
    // 1) Entry title (semibig)
    const liTitle = el("li", "outlined-text-semibig");

    const titleText = t(entry && entry.title);
    const titleLink = thref(entry && entry.link);

    appendLinkedText(liTitle, titleText, titleLink);
    ulOuter.appendChild(liTitle);

    // 2) Each "perf" block becomes one <ul class="no-bullets"> ... </ul>
    const perfs = Array.isArray(entry && entry.perfs) ? entry.perfs : [];
    perfs.forEach((perf) => {
      const ulPerf = el("ul", "no-bullets");

      // 2a) Perf title line
      const liPerf = el("li");
      const perfTitleText = t(perf && perf.title);
      const perfTitleLink = thref(perf && perf.link);
      appendLinkedText(liPerf, perfTitleText, perfTitleLink);
      ulPerf.appendChild(liPerf);

      // 2b) Perf locations list (each loc is wrapped as its own <ul><li>...</li></ul>)
      const locs = Array.isArray(perf && perf.locs) ? perf.locs : [];
      locs.forEach((loc) => {
        const ulLoc = el("ul", "no-bullets");
        const liLoc = el("li");

        // Loc objects are { text, link } in your JSON (text/link may be localized).
        const text = t(loc && loc.text);
        const href = thref(loc && loc.link);

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