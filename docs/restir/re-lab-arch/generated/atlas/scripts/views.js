import { renderDsl } from "./dsl.js";
import { element, enumName, number, svgElement } from "./format.js";

function pixelButton(x, y, kind, label, onClick) {
  return element("button", {
    type: "button",
    class: `pixel-button ${kind}`,
    style: `left:${(x + .5) / 24 * 100}%;top:${(y + .5) / 24 * 100}%`,
    title: label,
    "aria-label": label,
    onClick,
  });
}

function imageFigure(frame, label) {
  const caption = element("figcaption", {}, [
    element("span", { text: label }),
    element("span", { text: `frame ${frame.frame}` }),
  ]);
  const image = element("div", { class: "lineage-image" }, [
    element("img", { src: frame.image, alt: `${label}, frame ${frame.frame}`, width: 24, height: 24 }),
  ]);
  return { figure: element("figure", {}, [caption, image]), image };
}

export function renderLineage(root, fixture, store, state) {
  root.replaceChildren();
  const source = imageFigure(fixture.frames.source, "history");
  const target = imageFigure(fixture.frames.target, "current");
  const sample = fixture.replay.samples[0];
  const [x, y] = fixture.metadata.pixel;
  target.image.append(pixelButton(x, y, "target", "Selected target pixel", () => store.set({ chapter: "proof", tier: "proof-and-source", entity: "final:reservoir" })));
  const temporal = sample.temporal_shifts[0];
  if (temporal?.source_pixel) {
    source.image.append(pixelButton(
      temporal.source_pixel[0], temporal.source_pixel[1], "temporal",
      `Temporal source (${temporal.source_pixel.join(", ")})`,
      () => store.set({ chapter: "proof", tier: "proof-and-source", entity: "temporal:0" })));
  }
  sample.spatial_shifts.forEach((shift, index) => {
    const kind = shift.valid ? "spatial" : "failed";
    target.image.append(pixelButton(
      shift.source_pixel[0], shift.source_pixel[1], kind,
      `Spatial attempt ${index}: ${shift.valid ? "valid" : enumName(shift.reuse_failure)}`,
      () => store.set({ chapter: "proof", tier: "proof-and-source", entity: `spatial:${index}` })));
  });
  root.append(element("div", { class: "lineage" }, [
    source.figure, target.figure,
    element("p", { class: "map-note", text: "Cyan crosses time. Magenta gathers the immutable post-temporal image. Red diamonds are typed failures, not missing data." }),
  ]));
}

function architectureMap(root, fixture, store, state) {
  const chapter = fixture.document.chapters.find((item) => item.id === state.chapter);
  const view = fixture.document.views[chapter.view];
  const nodes = new Map(view.nodes.map((node) => [node.id, node]));
  const timeline = view.projection === "timeline";
  const nodeWidth = timeline ? 124 : 180;
  const nodeHeight = 62;
  const svg = svgElement("svg", {
    class: "network-svg concept-svg", viewBox: "0 0 1000 350", role: "group",
    "aria-label": view.alt,
  });
  view.edges.forEach(([sourceId, targetId, label]) => {
    const source = nodes.get(sourceId), target = nodes.get(targetId);
    const sx = source.x + nodeWidth, sy = source.y + nodeHeight / 2;
    const tx = target.x, ty = target.y + nodeHeight / 2;
    const bend = Math.max(28, Math.abs(tx - sx) * .42);
    const d = tx >= sx
      ? `M ${sx} ${sy} C ${sx + bend} ${sy}, ${tx - bend} ${ty}, ${tx} ${ty}`
      : `M ${sx} ${sy} C ${sx + 36} ${Math.max(sy, ty) + 72}, ${tx - 36} ${Math.max(sy, ty) + 72}, ${tx} ${ty}`;
    svg.append(svgElement("path", { class: "network-link", d }));
    if (label) {
      const text = svgElement("text", { class: "concept-edge-label", x: (sx + tx) / 2, y: (sy + ty) / 2 - 7, "text-anchor": "middle" });
      text.textContent = label; svg.append(text);
    }
  });
  view.nodes.forEach((node) => {
    const group = svgElement("g", {
      class: `network-node concept-node${node.id === "m20" ? " active" : ""}`,
      transform: `translate(${node.x} ${node.y})`, tabindex: "0", role: "button",
      "aria-label": `${node.label}: ${node.detail}`,
    });
    group.append(svgElement("rect", { width: nodeWidth, height: nodeHeight }));
    const title = svgElement("text", { x: 12, y: 25 }); title.textContent = node.label;
    const detail = svgElement("text", { class: "concept-detail", x: 12, y: 45 }); detail.textContent = node.detail;
    group.append(title, detail);
    const choose = () => store.set({ entity: `chapter:${chapter.id}` });
    group.addEventListener("click", choose);
    group.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") choose(); });
    svg.append(group);
  });
  root.replaceChildren(svg);
}

function authoredNetwork(root, fixture, store, state) {
  const graph = fixture.pipeline.authored;
  const nodeMap = new Map(graph.nodes.map((node) => [node.id, node]));
  const svg = svgElement("svg", { class: "network-svg", viewBox: "-980 -340 2100 760", role: "group", "aria-label": "Authored render network" });
  for (const link of graph.links) {
    const from = nodeMap.get(link.from[0]);
    const to = nodeMap.get(link.to[0]);
    if (!from || !to) continue;
    const path = svgElement("path", {
      class: "network-link",
      d: `M ${from.position[0] + 140} ${from.position[1] + 18} C ${from.position[0] + 175} ${from.position[1] + 18}, ${to.position[0] - 35} ${to.position[1] + 18}, ${to.position[0]} ${to.position[1] + 18}`,
    });
    svg.append(path);
  }
  for (const node of graph.nodes) {
    const active = state.chapter === "system" && node.id === "render";
    const group = svgElement("g", { class: `network-node${active ? " active" : ""}`, transform: `translate(${node.position[0]} ${node.position[1]})`, tabindex: "0", role: "button", "aria-label": `Select authored operator ${node.id}` });
    group.append(svgElement("rect", { width: 140, height: 36 }));
    const text = svgElement("text", { x: 8, y: 22 }); text.textContent = node.id; group.append(text);
    const choose = () => {
      store.set({ chapter: "system", tier: "working-model", entity: "chapter:system" });
    };
    group.addEventListener("click", choose);
    group.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") choose(); });
    svg.append(group);
  }
  root.replaceChildren(svg);
}

function compiledNetwork(root, fixture, store, state) {
  const steps = fixture.pipeline.compiled.steps;
  const groups = fixture.pipeline.compiled.fused_groups;
  const fused = new Set(groups.filter((group) => group.nodes.length > 1).flatMap((group) => group.nodes));
  const columns = 5;
  const positions = steps.map((_, index) => [35 + (index % columns) * 190, 35 + Math.floor(index / columns) * 80]);
  const height = 80 + Math.ceil(steps.length / columns) * 80;
  const svg = svgElement("svg", { class: "network-svg", viewBox: `0 0 980 ${height}`, role: "img", "aria-label": "Compiled scalar execution plan" });
  positions.slice(1).forEach((position, index) => {
    const previous = positions[index];
    svg.append(svgElement("path", { class: "network-link", d: `M ${previous[0] + 155} ${previous[1] + 18} L ${position[0]} ${position[1] + 18}` }));
  });
  steps.forEach((step, index) => {
    const [x, y] = positions[index];
    const active = state.chapter === "system" && step.node === "render";
    const group = svgElement("g", { class: `network-node${active ? " active" : ""}${fused.has(step.node) ? " fused" : ""}`, transform: `translate(${x} ${y})` });
    group.append(svgElement("rect", { width: 155, height: 36 }));
    const text = svgElement("text", { x: 7, y: 15 });
    const second = svgElement("text", { x: 7, y: 28 });
    text.textContent = step.node; second.textContent = step.category.toLowerCase();
    group.append(text, second); svg.append(group);
  });
  root.replaceChildren(svg);
}

export function renderMap(root, fixture, store, state) {
  if (state.map === "authored") authoredNetwork(root, fixture, store, state);
  else if (state.map === "compiled") compiledNetwork(root, fixture, store, state);
  else if (state.chapter === "proof") renderLineage(root, fixture, store, state);
  else architectureMap(root, fixture, store, state);
}

function chartRow({ id, index, label, weight, accepted, valid = true, kind = "fresh", max }, store, selected) {
  const status = !valid ? "failed" : accepted ? "accepted" : "rejected";
  return element("button", {
    type: "button",
    class: `chart-row ${kind} ${!valid ? "failed" : ""}${selected === id ? " selected" : ""}`,
    onClick: () => store.set({ chapter: "proof", tier: kind === "fresh" ? "working-model" : "proof-and-source", entity: id }),
    "aria-label": `${label}, weight ${number(weight)}, ${status}`,
  }, [
    element("span", { class: "chart-index", text: index }),
    element("span", { class: "weight-track" }, [element("i", { class: "weight-fill", style: `width:${Math.max(1, weight / max * 100)}%` })]),
    element("span", { class: "chart-number", text: `${label} · ${number(weight)}` }),
    element("span", { class: `status-glyph ${status}`, text: status === "accepted" ? "●" : status === "failed" ? "×" : "○" }),
  ]);
}

export function renderChart(root, fixture, store, state) {
  if (state.chapter !== "proof") {
    const chapter = fixture.document.chapters.find((item) => item.id === state.chapter);
    const view = fixture.document.views[chapter.view];
    root.replaceChildren(
      element("div", { class: "chart-group-label" }, [view.title, `${view.dimension}D → ${view.projection}`]),
      ...view.nodes.map((node, index) => element("button", {
        type: "button", class: "concept-chart-row",
        onClick: () => store.set({ entity: `chapter:${chapter.id}` }),
      }, [
        element("span", { class: "chart-index", text: index + 1 }),
        element("strong", { text: node.label }),
        element("span", { text: node.detail }),
      ])),
    );
    return;
  }
  const sample = fixture.replay.samples[0];
  const weights = [
    ...sample.fresh_path_reservoir.map((item) => item.provisional_weight),
    ...sample.temporal_shifts.map((item) => item.candidate_weight),
    ...sample.spatial_shifts.map((item) => item.candidate_weight),
  ];
  const max = Math.max(...weights, 1e-12);
  const children = [];
  children.push(element("div", { class: "chart-group-label" }, ["fresh path RIS", `${sample.fresh_path_reservoir.length} terms`]));
  sample.fresh_path_reservoir.forEach((item, index) => children.push(chartRow({ id: `fresh:${index}`, index: index + 1, label: `c${item.contribution_index}`, weight: item.provisional_weight, accepted: item.accepted, kind: "fresh", max }, store, state.entity)));
  children.push(element("div", { class: "chart-group-label" }, ["temporal GRIS", `${sample.temporal_shifts[0].used_M} represented`]));
  sample.temporal_shifts.forEach((item, index) => children.push(chartRow({ id: `temporal:${index}`, index: "T", label: enumName(item.hybrid_shift?.mapping), weight: item.candidate_weight, accepted: item.accepted, valid: item.valid, kind: "temporal", max }, store, state.entity)));
  children.push(element("div", { class: "chart-group-label" }, ["spatial GRIS", `${fixture.summary.valid_spatial}/${fixture.summary.spatial_attempts} valid`]));
  sample.spatial_shifts.forEach((item, index) => children.push(chartRow({ id: `spatial:${index}`, index: index === 0 ? "self" : `S${index}`, label: item.valid ? enumName(item.hybrid_shift?.mapping) : enumName(item.reuse_failure), weight: item.candidate_weight, accepted: item.accepted, valid: item.valid, kind: "spatial", max }, store, state.entity)));
  root.replaceChildren(...children);
}

function selectedRecord(fixture, entityId) {
  const sample = fixture.replay.samples[0];
  const [kind, rawIndex] = entityId.split(":");
  const index = Number(rawIndex);
  if (kind === "vertex") return sample.indirect.vertices[index];
  if (kind === "contribution") return sample.indirect.contributions[index];
  if (kind === "fresh") return sample.fresh_path_reservoir[index];
  if (kind === "temporal") return sample.temporal_shifts[index];
  if (kind === "spatial") return sample.spatial_shifts[index];
  if (kind === "final") return sample.final_path_reservoir.at(-1);
  return fixture.entities[entityId];
}

function flattenEvidence(record) {
  if (!record) return [];
  const preferred = ["valid", "accepted", "failure", "reuse_failure", "shift_failure", "mapping", "source_pixel", "source_M", "used_M", "candidate_M", "p_hat", "source_target", "target_target", "provisional_weight", "candidate_weight", "mis_weight", "jacobian", "M", "W", "w_sum", "reconnection_depth", "replay_rays", "reconnection_rays", "visibility_rays"];
  const rows = [];
  for (const key of preferred) {
    let value = record[key];
    if (value === undefined || value === null) continue;
    if (typeof value === "object" && value.name) value = enumName(value);
    else if (Array.isArray(value)) value = `(${value.map((item) => number(item)).join(", ")})`;
    else if (typeof value === "number") value = number(value, 6);
    rows.push([key.replaceAll("_", " "), String(value)]);
  }
  return rows;
}

export function renderLegend(root, fixture, state) {
  root.replaceChildren();
  const chapter = fixture.document.chapters.find((item) => item.id === state.chapter);
  const tier = chapter.tiers.find((item) => item.id === state.tier) ?? chapter.tiers[0];
  if (state.sources) {
    const list = element("ul", { class: "source-list" });
    chapter.sources.map((id) => fixture.document.sources[id]).forEach((source) => list.append(element("li", {}, [
      element("code", { text: `${source.path} :: ${source.symbol}` }),
      element("span", { text: source.role }),
    ])));
    root.append(list);
    return;
  }
  root.append(renderDsl(tier.model, state.chapter));
  const entity = fixture.entities[state.entity];
  const record = selectedRecord(fixture, state.entity);
  const evidence = element("section", { class: "evidence" }, [
    element("h3", { text: entity?.label ?? `${chapter.title} · ${tier.label}` }),
  ]);
  const grid = element("dl", { class: "evidence-grid" });
  const rows = state.chapter === "proof" ? flattenEvidence(record) : [
    ["tier", tier.label],
    ["projection", fixture.document.views[chapter.view].projection],
    ["dimension", `${fixture.document.views[chapter.view].dimension}D`],
  ];
  rows.forEach(([key, value]) => grid.append(
    element("dt", { text: key }), element("dd", { text: value })));
  evidence.append(grid);
  const hybrid = record?.hybrid_shift;
  if (hybrid) {
    evidence.append(element("div", { class: "equation", text: `J = G · ρprev · ρreconnect = ${number(hybrid.geometry_jacobian)} · ${number(hybrid.previous_pdf_ratio)} · ${number(hybrid.reconnect_pdf_ratio)} = ${number(hybrid.jacobian)}` }));
  } else if (record?.provisional_weight !== undefined) {
    evidence.append(element("div", { class: "equation", text: `accept ⇔ u · Σw < wᵢ` }));
  } else if (state.chapter === "proof") {
    evidence.append(element("div", { class: "equation", text: `Lpixel = Le + Ldirect + Lindirect` }));
  } else {
    evidence.append(element("p", { class: "legend-summary", text: tier.summary }));
    evidence.append(element("ul", { class: "legend-points" }, tier.insights.map((item) => element("li", { text: item }))));
  }
  root.append(evidence);
}

export function selectedRecordForSandbox(fixture, entityId) {
  return selectedRecord(fixture, entityId);
}
