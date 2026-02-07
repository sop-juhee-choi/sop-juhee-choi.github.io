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

/* bio.xsl equivalent */
function renderBio(xmlDoc, container) {
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

    const ulItemsWrapper = el("ul", "outlined-text no-bullets");

    const itemS = childrenNS(entry, ATOM_NS, "item_s")[0] || null;
    const items = itemS ? childrenNS(itemS, ATOM_NS, "item") : [];

    items.forEach((item) => {
      const ulItem = el("ul", "outlined-text no-bullets");
      const li = el("li");

      const itemTitle = nodeTextNS(item, ATOM_NS, "title");
      const itemTitleLink = nodeLinkAttrNS(item, ATOM_NS, "title");
      appendLinkedText(li, itemTitle, itemTitleLink);

      ulItem.appendChild(li);
      ulItemsWrapper.appendChild(ulItem);
    });

    ulOuter.appendChild(ulItemsWrapper);
  });

  container.appendChild(ulOuter);
}

/* honor.xsl equivalent */
function renderHonor(xmlDoc, container) {
  const feed = firstNS(xmlDoc, ATOM_NS, "feed");
  if (!feed) return;

  const entries = childrenNS(feed, ATOM_NS, "entry");
  const ulOuter = el("ul", "outlined-text no-bullets");

  entries.forEach((entry) => {
    const title = nodeTextNS(entry, ATOM_NS, "title");

    const liTitle = el("li", "outlined-text-semibig");
    appendStrongText(liTitle, title);
    ulOuter.appendChild(liTitle);

    const ulDetail = el("ul", "no-bullets");

    const titleJpLi = el("li");
    titleJpLi.textContent = nodeTextNS(entry, ATOM_NS, "title_jp");
    ulDetail.appendChild(titleJpLi);

    const locationLi = el("li");
    locationLi.textContent = nodeTextNS(entry, ATOM_NS, "location");
    ulDetail.appendChild(locationLi);

    const dateLi = el("li");
    dateLi.textContent = nodeTextNS(entry, ATOM_NS, "date");
    ulDetail.appendChild(dateLi);

    ulOuter.appendChild(ulDetail);
    ulOuter.appendChild(document.createElement("br"));
  });

  container.appendChild(ulOuter);
}

/* perf.xsl equivalent */
function renderPerf(xmlDoc, container) {
  const feed = firstNS(xmlDoc, ATOM_NS, "feed");
  if (!feed) return;

  const entries = childrenNS(feed, ATOM_NS, "entry");
  const ulOuter = el("ul", "outlined-text no-bullets");

  entries.forEach((entry) => {
    const title = nodeTextNS(entry, ATOM_NS, "title");

    const liTitle = el("li", "outlined-text-semibig");
    appendStrongText(liTitle, title);
    ulOuter.appendChild(liTitle);

    const ulPerfWrapper = el("ul", "no-bullets");

    const perfS = childrenNS(entry, ATOM_NS, "perf_s")[0] || null;
    const perfs = perfS ? childrenNS(perfS, ATOM_NS, "perf") : [];

    perfs.forEach((perf) => {
      const ulPerf = el("ul", "no-bullets");

      const liPerfTitle = el("li");
      appendLinkedText(
        liPerfTitle,
        nodeTextNS(perf, ATOM_NS, "title"),
        nodeLinkAttrNS(perf, ATOM_NS, "title")
      );
      ulPerf.appendChild(liPerfTitle);

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

      ulPerfWrapper.appendChild(ulPerf);
    });

    ulOuter.appendChild(ulPerfWrapper);
    ulOuter.appendChild(document.createElement("br"));
  });

  container.appendChild(ulOuter);
}

/* ---------- Loader ---------- */

async function loadAndRenderXML(xmlUrl, containerId, renderer) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const resp = await fetch(xmlUrl);
    if (!resp.ok) throw new Error(`Failed to load XML: ${resp.status} ${resp.statusText}`);

    const xmlText = await resp.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "application/xml");

    container.innerHTML = "";
    renderer(xmlDoc, container);

    if (window.MathJax && typeof window.MathJax.typeset === "function") {
      window.MathJax.typeset();
    }
  } catch (err) {
    console.error("Error rendering XML:", err);
    container.textContent = "Error loading and rendering XML.";
  }
}

/* ---------- Hook up your XML files here ---------- */

loadAndRenderXML("xml/bio.xml", "bio-j-container", renderBio);
loadAndRenderXML("xml/perf.xml", "edu-j-container", renderPerf);
loadAndRenderXML("xml/honor.xml", "honor-j-container", renderHonor);
loadAndRenderXML("xml/perf.xml", "perf-container", renderPerf);