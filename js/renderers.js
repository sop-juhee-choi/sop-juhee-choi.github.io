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
// renderBio, renderEdu, renderPerf
// remain completely untouched.

function renderBio(xmlDoc, container) {
  if (!container || !xmlDoc) return;

  const feed = firstNS(xmlDoc, ATOM_NS, "feed");
  if (!feed) return;

  const entries = childrenNS(feed, ATOM_NS, "entry");
  const ulOuter = el("ul", "outlined-text no-bullets");

  entries.forEach((entry) => {
    const li = el("li", "outlined-text");

    const title = nodeTextNS(entry, ATOM_NS, "title");
    const link  = nodeLinkAttrNS(entry, ATOM_NS, "title");

    appendLinkedText(li, title, link);
    ulOuter.appendChild(li);
  });

  container.appendChild(ulOuter);
}

function renderHonor(xmlDoc, container) {
  if (!container || !xmlDoc) return;

  const feed = firstNS(xmlDoc, ATOM_NS, "feed");
  if (!feed) return;

  const entries = childrenNS(feed, ATOM_NS, "entry");
  const ulOuter = el("ul", "outlined-text no-bullets");

  entries.forEach((entry) => {
    // entry title
    const liTitle = el("li", "outlined-text-semibig");
    appendLinkedText(
      liTitle,
      nodeTextNS(entry, ATOM_NS, "title"),
      nodeLinkAttrNS(entry, ATOM_NS, "title")
    );
    ulOuter.appendChild(liTitle);

    // desc list
    const descS = firstNS(entry, ATOM_NS, "desc_s");
    const descs = descS ? childrenNS(descS, ATOM_NS, "desc") : [];

    descs.forEach((desc) => {
      const ulDetail = el("ul", "no-bullets");
      const li = el("li");

      appendLinkedText(
        li,
        nodeTextNS(desc, ATOM_NS, "title"),
        nodeLinkAttrNS(desc, ATOM_NS, "title")
      );

      ulDetail.appendChild(li);
      ulOuter.appendChild(ulDetail);
    });

    ulOuter.appendChild(document.createElement("br"));
  });

  container.appendChild(ulOuter);
}

function renderPerf(xmlDoc, container) {
  if (!container || !xmlDoc) return;

  const feed = firstNS(xmlDoc, ATOM_NS, "feed");
  if (!feed) return;

  const entries = childrenNS(feed, ATOM_NS, "entry");
  const ulOuter = el("ul", "outlined-text no-bullets");

  entries.forEach((entry) => {
    // entry title
    const liTitle = el("li", "outlined-text-semibig");
    appendLinkedText(
      liTitle,
      nodeTextNS(entry, ATOM_NS, "title"),
      nodeLinkAttrNS(entry, ATOM_NS, "title")
    );
    ulOuter.appendChild(liTitle);

    // perfs
    const perfS = firstNS(entry, ATOM_NS, "perf_s");
    const perfs = perfS ? childrenNS(perfS, ATOM_NS, "perf") : [];

    perfs.forEach((perf) => {
      const ulPerf = el("ul", "no-bullets");

      const liPerf = el("li");
      appendLinkedText(
        liPerf,
        nodeTextNS(perf, ATOM_NS, "title"),
        nodeLinkAttrNS(perf, ATOM_NS, "title")
      );
      ulPerf.appendChild(liPerf);

      // locs
      const locS = firstNS(perf, ATOM_NS, "loc_s");
      const locs = locS ? childrenNS(locS, ATOM_NS, "loc") : [];

      locs.forEach((loc) => {
        const ulLoc = el("ul", "no-bullets");
        const liLoc = el("li");

        appendLinkedText(
          liLoc,
          nodeTextNS(loc, ATOM_NS, "text"),
          nodeLinkAttrNS(loc, ATOM_NS, "text")
        );

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