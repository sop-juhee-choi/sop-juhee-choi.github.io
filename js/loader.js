/**
 * Fetches a JSON file and renders its contents into a container
 * using the provided renderer function.
 *
 * @param {string} url - URL of the JSON data to fetch
 * @param {string} containerId - ID of the DOM element to render into
 * @param {Function} renderer - Rendering function (json, container) => void
 */
async function loadAndRender(url, containerId, renderer) {
  // Locate the target container in the DOM
  const container = document.getElementById(containerId);
  if (!container) return; // Abort silently if container does not exist

  try {
    // Fetch JSON data
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`Failed to load: ${resp.status}`);
    }

    // Parse response as JSON
    const json = await resp.json();

    // Clear existing content before rendering
    container.innerHTML = "";

    // Delegate actual DOM construction to the renderer
    renderer(json, container);

    // Re-run MathJax if present (needed after dynamic DOM insertion)
    if (window.MathJax && typeof window.MathJax.typeset === "function") {
      window.MathJax.typeset();
    }
  } catch (e) {
    // Log error for debugging
    console.error(e);

    // Fallback user-visible error message
    container.textContent = "Error loading data.";
  }
}

loadAndRender("json/bio.json",   "bio-j-container",   renderBio);
loadAndRender("json/edu.json",   "edu-j-container",   renderPerf);
loadAndRender("json/honor.json", "honor-j-container", renderHonor);
loadAndRender("json/perf.json",  "perf-container",    renderPerf);