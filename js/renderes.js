function renderBioJSON(data, container) {
  const feed = data && data.feed ? data.feed : null;
  if (!feed || !container) return;

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

function renderHonorJSON(data, container) {
  const feed = data && data.feed ? data.feed : null;
  if (!feed || !container) return;

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

function renderPerfJSON(data, container) {
  const feed = data && data.feed ? data.feed : null;
  if (!feed || !container) return;

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