import { element } from "./format.js";

function appendForm(parent, value, depth, activeToken) {
  if (Array.isArray(value)) {
    parent.append("(");
    value.forEach((item, index) => {
      if (index) parent.append(depth < 2 ? "\n" + "  ".repeat(depth + 1) : " ");
      appendForm(parent, item, depth + 1, activeToken);
    });
    parent.append(")");
    return;
  }
  if (value && typeof value === "object") {
    parent.append("{");
    const entries = Object.entries(value);
    entries.forEach(([key, item], index) => {
      if (index) parent.append(" ");
      parent.append(`:${key} `);
      appendForm(parent, item, depth + 1, activeToken);
    });
    parent.append("}");
    return;
  }
  const token = element("span", {
    class: activeToken && String(value).includes(activeToken) ? "active-token" : "",
    text: typeof value === "string" && !/^[a-z][a-z0-9-]*$/i.test(value)
      ? JSON.stringify(value) : String(value),
  });
  parent.append(token);
}

export function renderDsl(ast, activeToken) {
  const pre = element("pre", { class: "sexpr", "aria-label": "Architecture documentation form" });
  appendForm(pre, ast, 0, activeToken);
  return pre;
}
