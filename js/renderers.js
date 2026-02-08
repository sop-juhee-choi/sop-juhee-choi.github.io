/* =========================================================
 * renderers.js
 * =========================================================
 * Rendering functions.
 *
 * NOTE:
 * - This file is intentionally unchanged.
 * - Renderers operate purely on an XML-like API:
 *     firstNS / childrenNS / nodeTextNS / nodeLinkAttrNS
 * - They work with both real XML DOM documents and
 *   JSON-adapted documents from helper.js.
 * ========================================================= */

// (The content of this file is exactly the same as provided earlier.)
// renderBio, renderEdu, renderPerf, 
// remain completely untouched.

function renderBio(data, container) {
  // guard
  if (!container || !data) return;

  // If XMLDocument is passed, just use the XML renderer directly.
  // (This makes the wife's JSON-only entry point accept XML too.)
  if (typeof data === "object" && data.nodeType === 9) {
    renderBio(data, container);
    return;
  }

  // ---- original JSON-only logic (unchanged) ----
  const feed = data && data.feed ? data.feed : null;
  if (!feed) return;

  const ulOuter = el("ul", "outlined-text no-bullets");

  const entries = Array.isArray(feed.entries) ? feed.entries : [];
  entries.forEach((entry) => {
    const li = el("li", "outlined-text");
    const titleText = (entry && entry.title ? String(entry.title) : "").trim();
    const titleLink = (entry && entry.link ? String(entry.link) : "").trim();

    appendLinkedText(li, titleText, titleLink);
    ulOuter.appendChild(li);
  });

  container.appendChild(ulOuter);
}

function renderHonor(data, container) {
  if (!container || !data) return;

  // XMLDocument passthrough
  if (typeof data === "object" && data.nodeType === 9) {
    renderHonor(data, container);
    return;
  }

  const feed = data && data.feed ? data.feed : null;
  if (!feed) return;

  const ulOuter = el("ul", "outlined-text no-bullets");

  const entries = Array.isArray(feed.entries) ? feed.entries : [];
  entries.forEach((entry) => {
    // entry title line (semibig)
    const liTitle = el("li", "outlined-text-semibig");
    const titleText = (entry && entry.title ? String(entry.title) : "").trim();
    const titleLink = (entry && entry.link ? String(entry.link) : "").trim();
    appendLinkedText(liTitle, titleText, titleLink);
    ulOuter.appendChild(liTitle);

    // desc list (each desc -> ul.no-bullets > li)
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

    // entry-level <br/>
    ulOuter.appendChild(document.createElement("br"));
  });

  container.appendChild(ulOuter);
}

function renderPerf(data, container) {
  if (!container || !data) return;

  // XMLDocument passthrough
  if (typeof data === "object" && data.nodeType === 9) {
    renderPerf(data, container);
    return;
  }

  const feed = data && data.feed ? data.feed : null;
  if (!feed) return;

  const ulOuter = el("ul", "outlined-text no-bullets");

  const entries = Array.isArray(feed.entries) ? feed.entries : [];
  entries.forEach((entry) => {
    // entry title (semibig)
    const liTitle = el("li", "outlined-text-semibig");
    const titleText = (entry && entry.title ? String(entry.title) : "").trim();
    const titleLink = (entry && entry.link ? String(entry.link) : "").trim();
    appendLinkedText(liTitle, titleText, titleLink);
    ulOuter.appendChild(liTitle);

    // perfs list
    const perfs = Array.isArray(entry && entry.perfs) ? entry.perfs : [];
    perfs.forEach((perf) => {
      const ulPerf = el("ul", "no-bullets");

      // perf title (<li> ... </li>)
      const liPerf = el("li");
      const perfTitleText = (perf && perf.title ? String(perf.title) : "").trim();
      const perfTitleLink = (perf && perf.link ? String(perf.link) : "").trim();
      appendLinkedText(liPerf, perfTitleText, perfTitleLink);
      ulPerf.appendChild(liPerf);

      // locs list: each loc -> <ul class="no-bullets"><li>...</li></ul>
      const locs = Array.isArray(perf && perf.locs) ? perf.locs : [];
      locs.forEach((loc) => {
        const ulLoc = el("ul", "no-bullets");
        const liLoc = el("li");

        // loc can be {text, link} in your JSON
        const text = (loc && loc.text ? String(loc.text) : "").trim();
        const href = (loc && loc.link ? String(loc.link) : "").trim();

        appendLinkedText(liLoc, text, href);

        ulLoc.appendChild(liLoc);
        ulPerf.appendChild(ulLoc);
      });

      ulOuter.appendChild(ulPerf);
      ulOuter.appendChild(document.createElement("br"));
    });
  });

  // feed-level <br/> (matches your current renderPerf)
  ulOuter.appendChild(document.createElement("br"));
  container.appendChild(ulOuter);
}