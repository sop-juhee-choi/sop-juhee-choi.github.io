document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("qrOverlay");
  const closeBtn = document.getElementById("closeQrButton");

  document.querySelectorAll(".qr-trigger").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      overlay.style.display = "flex";
    });
  });

  closeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    overlay.style.display = "none";
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.style.display = "none";
  });
});