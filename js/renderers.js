/* ---------- JSON Renderers (match the same legacy XSL output) ---------- */

// wife site: renderBio (JSON + XML compatible, EXACT pattern from your site)

function renderBio(data, container) {
  if (!container || !data) return;

  if (typeof data === "object" && data.nodeType === 9) {
    const xmlDoc = data;

    const feed = firstNS(xmlDoc, ATOM_NS, "feed");
    if (!feed) return;

    const entries = childrenNS(feed, ATOM_NS, "entry");

    const ulOuter = el("ul", "no-bullets");

    entries.forEach((entry) => {
      const title = nodeTextNS(entry, ATOM_NS, "title");
      const titleLink = nodeLinkAttrNS(entry, ATOM_NS, "title");

      const liTitle = el("li", "outlined-text-semibig");
      appendLinkedText(liTitle, title, titleLink);
      ulOuter.appendChild(liTitle);

      const ulItemsWrap = el("ul", "outlined-text no-bullets");

      const itemS = firstNS(entry, ATOM_NS, "item_s");
      const items = itemS ? childrenNS(itemS, ATOM_NS, "item") : [];

      items.forEach((item) => {
        const ulItem = el("ul", "outlined-text no-bullets");
        const li = el("li");

        const itTitle = nodeTextNS(item, ATOM_NS, "title");
        const itTitleLink = nodeLinkAttrNS(item, ATOM_NS, "title");
        appendLinkedText(li, itTitle, itTitleLink);

        ulItem.appendChild(li);
        ulItemsWrap.appendChild(ulItem);
      });

      ulOuter.appendChild(ulItemsWrap);
    });

    container.appendChild(ulOuter);
    return;
  }

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

  if (typeof data === "object" && data.nodeType === 9) {
    const xmlDoc = data;

    const feed = firstNS(xmlDoc, ATOM_NS, "feed");
    if (!feed) return;

    const entries = childrenNS(feed, ATOM_NS, "entry");
    const ulOuter = el("ul", "outlined-text no-bullets");

    entries.forEach((entry) => {
      // entry title line (semibig)
      const liTitle = el("li", "outlined-text-semibig");
      const title = nodeTextNS(entry, ATOM_NS, "title");
      const titleLink = nodeLinkAttrNS(entry, ATOM_NS, "title");
      appendLinkedText(liTitle, title, titleLink);
      ulOuter.appendChild(liTitle);

      const descS = firstNS(entry, ATOM_NS, "desc_s");
      const descs = descS ? childrenNS(descS, ATOM_NS, "desc") : [];

      descs.forEach((desc) => {
        const ulDetail = el("ul", "no-bullets");
        const li = el("li");

        const dTitle = nodeTextNS(desc, ATOM_NS, "title");
        const dLink = nodeLinkAttrNS(desc, ATOM_NS, "title");
        appendLinkedText(li, dTitle, dLink);

        ulDetail.appendChild(li);
        ulOuter.appendChild(ulDetail);
      });

      ulOuter.appendChild(document.createElement("br"));
    });

    container.appendChild(ulOuter);
    return;
  }

  const feed = data && data.feed ? data.feed : null;
  if (!feed) return;

  const ulOuter = el("ul", "outlined-text no-bullets");

  const entries = Array.isArray(feed.entries) ? feed.entries : [];
  entries.forEach((entry) => {
    const liTitle = el("li", "outlined-text-semibig");
    const titleText = (entry && entry.title ? String(entry.title) : "").trim();
    const titleLink = (entry && entry.link ? String(entry.link) : "").trim();
    appendLinkedText(liTitle, titleText, titleLink);
    ulOuter.appendChild(liTitle);

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

    const entries = childrenNS(feed, ATOM_NS, "entry");
    const ulOuter = el("ul", "outlined-text no-bullets");

    entries.forEach((entry) => {
      const liTitle = el("li", "outlined-text-semibig");
      const title = nodeTextNS(entry, ATOM_NS, "title");
      const titleLink = nodeLinkAttrNS(entry, ATOM_NS, "title");
      appendLinkedText(liTitle, title, titleLink);
      ulOuter.appendChild(liTitle);

      const perfS = firstNS(entry, ATOM_NS, "perf_s");
      const perfs = perfS ? childrenNS(perfS, ATOM_NS, "perf") : [];

      perfs.forEach((perf) => {
        const ulPerf = el("ul", "no-bullets");

        const liPerf = el("li");
        const pTitle = nodeTextNS(perf, ATOM_NS, "title");
        const pLink = nodeLinkAttrNS(perf, ATOM_NS, "title");
        appendLinkedText(liPerf, pTitle, pLink);
        ulPerf.appendChild(liPerf);

        const locS = firstNS(perf, ATOM_NS, "loc_s");
        const locs = locS ? childrenNS(locS, ATOM_NS, "loc") : [];

        locs.forEach((loc) => {
          const ulLoc = el("ul", "no-bullets");
          const liLoc = el("li");

          const text = String(loc.textContent || "").trim();
          const href = String(loc.getAttribute("link") || "").trim();

          appendLinkedText(liLoc, text, href);

          ulLoc.appendChild(liLoc);
          ulPerf.appendChild(ulLoc);
        });

        ulOuter.appendChild(ulPerf);
        ulOuter.appendChild(document.createElement("br"));
      });
    });

    ulOuter.appendChild(document.createElement("br"));
    container.appendChild(ulOuter);
    return;
  }

  // ---------- JSON branch ----------
  const feed = data && data.feed ? data.feed : null;
  if (!feed) return;

  const ulOuter = el("ul", "outlined-text no-bullets");

  const entries = Array.isArray(feed.entries) ? feed.entries : [];
  entries.forEach((entry) => {
    const liTitle = el("li", "outlined-text-semibig");
    const titleText = (entry && entry.title ? String(entry.title) : "").trim();
    const titleLink = (entry && entry.link ? String(entry.link) : "").trim();
    appendLinkedText(liTitle, titleText, titleLink);
    ulOuter.appendChild(liTitle);

    const perfs = Array.isArray(entry && entry.perfs) ? entry.perfs : [];
    perfs.forEach((perf) => {
      const ulPerf = el("ul", "no-bullets");

      const liPerf = el("li");
      const perfTitleText = (perf && perf.title ? String(perf.title) : "").trim();
      const perfTitleLink = (perf && perf.link ? String(perf.link) : "").trim();
      appendLinkedText(liPerf, perfTitleText, perfTitleLink);
      ulPerf.appendChild(liPerf);

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

  ulOuter.appendChild(document.createElement("br"));
  container.appendChild(ulOuter);
}