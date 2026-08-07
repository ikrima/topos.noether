import { element, number } from "./format.js";
import { jacobianProduct, wrsDecision } from "./model.js";
import { selectedRecordForSandbox } from "./views.js";

function range(label, value, min, max, step, onInput) {
  const output = element("output", { text: number(value, 6) });
  const input = element("input", { type: "range", min, max, step, value });
  input.addEventListener("input", () => { output.value = number(input.value, 6); output.textContent = output.value; onInput(Number(input.value)); });
  return { row: element("label", {}, [element("span", { text: label }), input, output]), input, output };
}

export function renderSandbox(root, fixture, state) {
  const sample = fixture.replay.samples[0];
  let freshIndex = state.entity.startsWith("fresh:") ? Number(state.entity.split(":")[1]) : 0;
  if (!Number.isFinite(freshIndex) || !sample.fresh_path_reservoir[freshIndex]) freshIndex = 0;
  const update = sample.fresh_path_reservoir[freshIndex];
  const running = sample.fresh_path_reservoir.slice(0, freshIndex + 1).reduce((sum, item) => sum + item.provisional_weight, 0);
  let draw = update.replacement_u;
  const decision = element("p", { class: "lab-result" });
  const updateDecision = () => {
    const accepted = wrsDecision(update.provisional_weight, running, draw);
    decision.textContent = `${number(draw)} × ${number(running)} ${accepted ? "<" : "≥"} ${number(update.provisional_weight)} → ${accepted ? "replace" : "retain"}`;
  };
  const u = range("replacement u", draw, 0, .999, .001, (value) => { draw = value; updateDecision(); });
  const wrs = element("section", { class: "lab-panel" }, [
    element("h3", { text: `WRS update ${freshIndex + 1}` }),
    element("p", { text: `Recorded u = ${number(update.replacement_u)}. Move the draw across wᵢ/Σw; later recorded stages stay frozen.` }),
    u.row, decision,
  ]);
  updateDecision();

  let record = selectedRecordForSandbox(fixture, state.entity);
  let hybrid = record?.hybrid_shift;
  if (!hybrid) hybrid = sample.temporal_shifts[0].hybrid_shift;
  const originals = [hybrid.geometry_jacobian, hybrid.previous_pdf_ratio, hybrid.reconnect_pdf_ratio];
  let values = [...originals];
  const result = element("p", { class: "lab-result" });
  const updateJ = () => {
    const product = jacobianProduct(...values);
    result.textContent = `J′ = ${number(values[0])} × ${number(values[1])} × ${number(values[2])} = ${number(product)} · inverse ${product === 0 ? "undefined" : number(1 / product)}`;
  };
  const controls = [
    range("geometry G", values[0], Math.max(0, originals[0] * .25), Math.max(.001, originals[0] * 2), Math.max(1e-6, originals[0] / 500), (value) => { values[0] = value; updateJ(); }),
    range("previous PDF ρ", values[1], Math.max(0, originals[1] * .25), Math.max(.001, originals[1] * 2), Math.max(1e-6, originals[1] / 500), (value) => { values[1] = value; updateJ(); }),
    range("reconnect PDF ρ", values[2], Math.max(0, originals[2] * .25), Math.max(.001, originals[2] * 2), Math.max(1e-6, originals[2] / 500), (value) => { values[2] = value; updateJ(); }),
  ];
  const reset = element("button", { type: "button", class: "reset-button", text: "reset exact factors" });
  reset.addEventListener("click", () => {
    values = [...originals];
    controls.forEach((control, index) => { control.input.value = values[index]; control.output.textContent = number(values[index], 6); });
    u.input.value = update.replacement_u; u.output.textContent = number(update.replacement_u, 6); draw = update.replacement_u;
    updateDecision(); updateJ();
  });
  const jacobian = element("section", { class: "lab-panel" }, [
    element("h3", { text: "Hybrid Jacobian factorization" }),
    element("p", { text: `The recorded product is ${number(hybrid.jacobian)}. These controls are a local thought experiment.` }),
    ...controls.map((control) => control.row), result, reset,
  ]);
  updateJ();
  root.replaceChildren(wrs, jacobian);
}
