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