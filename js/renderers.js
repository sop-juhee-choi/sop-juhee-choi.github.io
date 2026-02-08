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

  // ---------- XML branch ----------
  // XMLDocument 인 경우: XML을 직접 렌더링
  if (typeof data === "object" && data.nodeType === 9) {
    const xmlDoc = data;

    const feed = firstNS(xmlDoc, ATOM_NS, "feed");
    if (!feed) return;

    const entries = childrenNS(feed, ATOM_NS, "entry");

    const ulOuter = el("ul", "outlined-text no-bullets");

    entries.forEach((entry) => {
      const li = el("li", "outlined-text");

      const titleText = nodeTextNS(entry, ATOM_NS, "title");
      const titleLink = nodeLinkAttrNS(entry, ATOM_NS, "title");

      appendLinkedText(li, titleText, titleLink);
      ulOuter.appendChild(li);
    });

    container.appendChild(ulOuter);
    return;
  }

  // ---------- JSON branch (original, unchanged) ----------
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

  // ---------- XML branch ----------
  if (typeof data === "object" && data.nodeType === 9) {
    const xmlDoc = data;

    const feed = firstNS(xmlDoc, ATOM_NS, "feed");
    if (!feed) return;

    const ulOuter = el("ul", "outlined-text no-bullets");
    const entries = childrenNS(feed, ATOM_NS, "entry");

    entries.forEach((entry) => {
      // entry title line (semibig)
      const liTitle = el("li", "outlined-text-semibig");
      const titleText = nodeTextNS(entry, ATOM_NS, "title");
      const titleLink = nodeLinkAttrNS(entry, ATOM_NS, "title");
      appendLinkedText(liTitle, titleText, titleLink);
      ulOuter.appendChild(liTitle);

      // desc list: prefer desc_s/desc, fallback to item_s/item
      const descS =
        firstNS(entry, ATOM_NS, "desc_s") ||
        firstNS(entry, ATOM_NS, "item_s") ||
        null;

      const descs = descS
        ? (childrenNS(descS, ATOM_NS, "desc").length
            ? childrenNS(descS, ATOM_NS, "desc")
            : childrenNS(descS, ATOM_NS, "item"))
        : [];

      descs.forEach((desc) => {
        const ulDetail = el("ul", "no-bullets");
        const li = el("li");

        const descTitleText = nodeTextNS(desc, ATOM_NS, "title");
        const descTitleLink = nodeLinkAttrNS(desc, ATOM_NS, "title");

        appendLinkedText(li, descTitleText, descTitleLink);

        ulDetail.appendChild(li);
        ulOuter.appendChild(ulDetail);
      });

      // entry-level <br/>
      ulOuter.appendChild(document.createElement("br"));
    });

    container.appendChild(ulOuter);
    return;
  }

  // ---------- JSON branch (original logic) ----------
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

  // ---------- XML branch ----------
  if (typeof data === "object" && data.nodeType === 9) {
    const xmlDoc = data;

    const feed = firstNS(xmlDoc, ATOM_NS, "feed");
    if (!feed) return;

    const ulOuter = el("ul", "outlined-text no-bullets");
    const entries = childrenNS(feed, ATOM_NS, "entry");

    entries.forEach((entry) => {
      // entry title (semibig)
      const liTitle = el("li", "outlined-text-semibig");
      const titleText = nodeTextNS(entry, ATOM_NS, "title");
      const titleLink = nodeLinkAttrNS(entry, ATOM_NS, "title");
      appendLinkedText(liTitle, titleText, titleLink);
      ulOuter.appendChild(liTitle);

      // perfs list: prefer perf_s/perf, fallback to item_s/item
      const perfS =
        firstNS(entry, ATOM_NS, "perf_s") ||
        firstNS(entry, ATOM_NS, "perfs") ||
        firstNS(entry, ATOM_NS, "item_s") ||
        null;

      const perfs = perfS
        ? (childrenNS(perfS, ATOM_NS, "perf").length
            ? childrenNS(perfS, ATOM_NS, "perf")
            : childrenNS(perfS, ATOM_NS, "item"))
        : [];

      perfs.forEach((perf) => {
        const ulPerf = el("ul", "no-bullets");

        // perf title (<li> ... </li>)
        const liPerf = el("li");
        const perfTitleText = nodeTextNS(perf, ATOM_NS, "title");
        const perfTitleLink = nodeLinkAttrNS(perf, ATOM_NS, "title");
        appendLinkedText(liPerf, perfTitleText, perfTitleLink);
        ulPerf.appendChild(liPerf);

        // locs list: prefer loc_s/loc, fallback to item_s/item
        const locS =
          firstNS(perf, ATOM_NS, "loc_s") ||
          firstNS(perf, ATOM_NS, "locs") ||
          firstNS(perf, ATOM_NS, "item_s") ||
          null;

        const locs = locS
          ? (childrenNS(locS, ATOM_NS, "loc").length
              ? childrenNS(locS, ATOM_NS, "loc")
              : childrenNS(locS, ATOM_NS, "item"))
          : [];

        locs.forEach((loc) => {
          const ulLoc = el("ul", "no-bullets");
          const liLoc = el("li");

          const text = String((loc && loc.textContent) || "").trim();
          const href =
            loc && loc.getAttribute ? String(loc.getAttribute("link") || "").trim() : "";

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
    return;
  }

  // ---------- JSON branch (original logic) ----------
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

      // locs list
      const locs = Array.isArray(perf && perf.locs) ? perf.locs : [];
      locs.forEach((loc) => {
        const ulLoc = el("ul", "no-bullets");
        const liLoc = el("li");

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