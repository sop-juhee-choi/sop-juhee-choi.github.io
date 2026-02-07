const ATOM_NS = "http://www.w3.org/2005/Atom";

/* ---------- XML helpers ---------- */

function firstNS(root, ns, localName) {
  return root.getElementsByTagNameNS(ns, localName)[0] || null;
}

function childrenNS(parent, ns, localName) {
  if (!parent) return [];
  return Array.from(parent.childNodes).filter(
    (n) => n.nodeType === 1 && n.namespaceURI === ns && n.localName === localName
  );
}

function nodeTextNS(parent, ns, localName) {
  const n = childrenNS(parent, ns, localName)[0];
  return n ? (n.textContent || "").trim() : "";
}

function nodeLinkAttrNS(parent, ns, localName) {
  const n = childrenNS(parent, ns, localName)[0];
  if (!n) return "";
  return (n.getAttribute("link") || "").trim();
}

function el(tag, className) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  return e;
}

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

function appendStrongText(parent, text) {
  const b = document.createElement("b");
  b.textContent = text;
  parent.appendChild(b);
}

/* ---------- Renderers (match your legacy XSL output) ---------- */

/* bio.xsl equivalent (exact) */

function renderBio(xmlDoc, container) {
  const feed = firstNS(xmlDoc, ATOM_NS, "feed");
  if (!feed || !container) return;

  const ulOuter = el("ul", "outlined-text no-bullets");

  const entries = childrenNS(feed, ATOM_NS, "entry");
  entries.forEach((entry) => {
    const li = el("li", "outlined-text");

    const titleText = nodeTextNS(entry, ATOM_NS, "title");
    const titleLink = nodeLinkAttrNS(entry, ATOM_NS, "title");

    appendLinkedText(li, titleText, titleLink);
    ulOuter.appendChild(li);
  });

  container.appendChild(ulOuter);
}

/* honor.xsl equivalent (faithful to the given XSL, using your helper stack) */

function renderHonor(xmlDoc, container) {
  const feed = firstNS(xmlDoc, ATOM_NS, "feed");
  if (!feed || !container) return;

  // XSL: <ul class="outlined-text no-bullets"><xsl:apply-templates/></ul>
  const ulOuter = el("ul", "outlined-text no-bullets");

  // XSL apply-templates under a:feed -> effectively processes a:entry (text() suppressed)
  const entries = childrenNS(feed, ATOM_NS, "entry");

  entries.forEach((entry) => {
    // XSL: <li class="outlined-text-semibig"> ... choose(title/@link) ... </li>
    const liTitle = el("li", "outlined-text-semibig");
    const titleText = nodeTextNS(entry, ATOM_NS, "title");
    const titleLink = nodeLinkAttrNS(entry, ATOM_NS, "title");
    appendLinkedText(liTitle, titleText, titleLink);
    ulOuter.appendChild(liTitle);

    // XSL: for-each select="a:desc_s/a:desc"
    const descS = childrenNS(entry, ATOM_NS, "desc_s")[0] || null;
    const descList = descS ? childrenNS(descS, ATOM_NS, "desc") : [];

    descList.forEach((desc) => {
      // XSL: <ul class="no-bullets"><li> choose(desc/title/@link) ... </li></ul>
      const ulDetail = el("ul", "no-bullets");
      const li = el("li");

      // IMPORTANT: In XSL, inside this for-each the context node is a:desc,
      // so "a:title" refers to the title child of the current desc.
      const descTitleText = nodeTextNS(desc, ATOM_NS, "title");
      const descTitleLink = nodeLinkAttrNS(desc, ATOM_NS, "title");
      appendLinkedText(li, descTitleText, descTitleLink);

      ulDetail.appendChild(li);
      ulOuter.appendChild(ulDetail);
    });

    // XSL: <br/>
    ulOuter.appendChild(document.createElement("br"));
  });

  container.appendChild(ulOuter);
}

/* perf.xsl equivalent (exact) */

function renderPerf(xmlDoc, container) {
  const feed = firstNS(xmlDoc, ATOM_NS, "feed");
  if (!feed || !container) return;

  const ulOuter = el("ul", "outlined-text no-bullets");

  const entries = childrenNS(feed, ATOM_NS, "entry");
  entries.forEach((entry) => {
    // entry title
    const liTitle = el("li", "outlined-text-semibig");
    const titleText = nodeTextNS(entry, ATOM_NS, "title");
    const titleLink = nodeLinkAttrNS(entry, ATOM_NS, "title");
    appendLinkedText(liTitle, titleText, titleLink);
    ulOuter.appendChild(liTitle);

    // perf loop
    const perfS = childrenNS(entry, ATOM_NS, "perf_s")[0] || null;
    const perfs = perfS ? childrenNS(perfS, ATOM_NS, "perf") : [];

    perfs.forEach((perf) => {
      const ulPerf = el("ul", "no-bullets");

      // perf title
      const liPerf = el("li");
      const perfTitleText = nodeTextNS(perf, ATOM_NS, "title");
      const perfTitleLink = nodeLinkAttrNS(perf, ATOM_NS, "title");
      appendLinkedText(liPerf, perfTitleText, perfTitleLink);
      ulPerf.appendChild(liPerf);

      // loc loop
      const locS = childrenNS(perf, ATOM_NS, "loc_s")[0] || null;
      const locs = locS ? childrenNS(locS, ATOM_NS, "loc") : [];

      locs.forEach((loc) => {
        const ulLoc = el("ul", "no-bullets");
        const liLoc = el("li");

        const href = (loc.getAttribute("link") || "").trim();
        const text = (loc.textContent || "").trim();
        appendLinkedText(liLoc, text, href);

        ulLoc.appendChild(liLoc);
        ulPerf.appendChild(ulLoc);
      });

      ulOuter.appendChild(ulPerf);
      ulOuter.appendChild(document.createElement("br"));
    });
  });

  // feed-level <br/>
  ulOuter.appendChild(document.createElement("br"));
  container.appendChild(ulOuter);
}

/* ---------- JSON Renderers (match the same legacy XSL output) ---------- */

/* bio.json equivalent of renderBio (exact) */
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

/* honor.json equivalent of renderHonor (exact to your XSL-derived DOM) */
function renderHonorJSON(data, container) {
  const feed = data && data.feed ? data.feed : null;
  if (!feed || !container) return;

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

/* perf.json / edu.json equivalent of renderPerf (exact to your XSL-derived DOM)
   - works for both:
     - perf.json: entry.perfs[]
     - edu.json:  entry.perfs[]
*/
function renderPerfJSON(data, container) {
  const feed = data && data.feed ? data.feed : null;
  if (!feed || !container) return;

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

/* ---------- Loader ---------- */

async function loadAndRenderXML(url, containerId, renderer) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Failed to load: ${resp.status}`);

    container.innerHTML = "";

    if (url.endsWith(".xml")) {
      const text = await resp.text();
      const xmlDoc = new DOMParser().parseFromString(text, "application/xml");
      renderer(xmlDoc, container);
    } else if (url.endsWith(".json")) {
      const json = await resp.json();
      renderer(json, container);
    } else {
      throw new Error("Unsupported format");
    }

    if (window.MathJax && typeof MathJax.typeset === "function") {
      MathJax.typeset();
    }
  } catch (e) {
    console.error(e);
    container.textContent = "Error loading data.";
  }
}

/* ---------- Hook up your XML/JSON files here ---------- */

loadAndRenderXML("json/bio.json",   "bio-j-container",   renderBioJSON);
loadAndRenderXML("json/edu.json",   "edu-j-container",   renderPerfJSON);
loadAndRenderXML("json/honor.json", "honor-j-container", renderHonorJSON);
loadAndRenderXML("json/perf.json",  "perf-container",    renderPerfJSON);