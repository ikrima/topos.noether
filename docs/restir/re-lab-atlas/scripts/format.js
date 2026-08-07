export function number(value, digits = 4) {
  if (value === null || value === undefined) return "—";
  if (!Number.isFinite(Number(value))) return String(value);
  const numeric = Number(value);
  if (numeric === 0) return "0";
  if (Math.abs(numeric) >= 1000 || Math.abs(numeric) < 0.001) {
    return numeric.toExponential(2);
  }
  return numeric.toFixed(digits).replace(/\.?0+$/, "");
}

export function enumName(value) {
  return value?.name?.replaceAll("_", " ") ?? "none";
}

export function element(name, attrs = {}, children = []) {
  const node = document.createElement(name);
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else node.setAttribute(key, String(value));
  });
  for (const child of Array.isArray(children) ? children : [children]) {
    if (child !== null && child !== undefined) {
      node.append(child instanceof Node ? child : document.createTextNode(String(child)));
    }
  }
  return node;
}

export function svgElement(name, attrs = {}) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", name);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
  return node;
}
