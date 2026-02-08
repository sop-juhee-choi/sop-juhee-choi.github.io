async function loadAndRenderJSON(url, containerId, renderer) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Failed to load: ${resp.status}`);

    const json = await resp.json();

    container.innerHTML = "";
    renderer(json, container);

    if (window.MathJax && typeof window.MathJax.typeset === "function") {
      window.MathJax.typeset();
    }
  } catch (e) {
    console.error(e);
    container.textContent = "Error loading data.";
  }
}

loadAndRenderJSON("json/bio.json",   "bio-j-container",   renderBioJSON);
loadAndRenderJSON("json/edu.json",   "edu-j-container",   renderPerfJSON);
loadAndRenderJSON("json/honor.json", "honor-j-container", renderHonorJSON);
loadAndRenderJSON("json/perf.json",  "perf-container",    renderPerfJSON);