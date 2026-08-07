import { adjacentItem, entityChapter } from "./model.js";
import { createStore, parseHash } from "./state.js";
import { createTerritory } from "./territory.js";
import { renderChart, renderLegend, renderMap } from "./views.js";
import { renderSandbox } from "./sandbox.js";
import { element, number } from "./format.js";

export async function mountAtlas(root, options = {}) {
const fixtureUrl = options.fixtureUrl || root.dataset.fixtureUrl || "generated/atlas-v2.json";
const response = await fetch(fixtureUrl);
if (!response.ok) throw new Error(`atlas fixture load failed: ${response.status}`);
const fixture = await response.json();
if (fixture.schema !== "restir-lab.atlas-fixture.v2") {
  throw new Error(`unsupported atlas fixture ${fixture.schema}`);
}
if (fixture.document.schema !== "restir-lab.architecture-doc.v1") {
  throw new Error(`unsupported document ${fixture.document.schema}`);
}

const chapters = fixture.document.chapters;
const tierIds = fixture.document.tiers;
const validChapters = new Set(chapters.map((chapter) => chapter.id));
const validTiers = new Set(tierIds);
const validMaps = new Set(["chapter", "authored", "compiled"]);
const initial = parseHash();
if (!validChapters.has(initial.chapter)) initial.chapter = "system";
if (!validTiers.has(initial.tier)) initial.tier = "orientation";
if (!validMaps.has(initial.map)) initial.map = "chapter";
if (!fixture.entities[initial.entity]
    || entityChapter(initial.entity, fixture.entities) !== initial.chapter) {
  initial.entity = `chapter:${initial.chapter}`;
}
const store = createStore(initial);

const heroMeta = root.querySelector("#hero-meta");
heroMeta.replaceChildren(
  element("span", { text: `${chapters.length} chapters` }),
  element("span", { text: `${tierIds.length} depth tiers` }),
  element("span", { text: `${fixture.summary.path_vertices} proof vertices` }),
  element("span", { text: `M ${fixture.summary.final_M}` }),
  element("span", { text: `W ${number(fixture.summary.final_W)}` }),
);

const chapterNav = root.querySelector("#chapter-nav");
const tierNav = root.querySelector("#tier-nav");
const story = root.querySelector("#story");

function chooseChapter(chapterId, { scroll = true } = {}) {
  store.set({ chapter: chapterId, entity: `chapter:${chapterId}` });
  if (scroll) {
    root.querySelector(`#chapter-${chapterId}`)?.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "center",
    });
  }
}

function chooseTier(tierId) {
  const chapter = store.get().chapter;
  store.set({ tier: tierId, entity: `tier:${chapter}:${tierId}` });
}

chapters.forEach((chapter, index) => {
  const button = element("button", {
    type: "button", text: `${index + 1}. ${chapter.title}`,
    "data-chapter": chapter.id, title: chapter.subtitle,
    onClick: () => chooseChapter(chapter.id),
  });
  chapterNav.append(button);

  const tierTabs = element("div", { class: "tier-tabs", "aria-label": `${chapter.title} depth` });
  chapter.tiers.forEach((tier, tierIndex) => tierTabs.append(element("button", {
    type: "button", text: `${tierIndex + 1} · ${tier.label}`,
    "data-tier": tier.id,
    onClick: (event) => { event.stopPropagation(); store.set({ chapter: chapter.id, tier: tier.id, entity: `tier:${chapter.id}:${tier.id}` }); },
  })));

  const section = element("section", {
    id: `chapter-${chapter.id}`, class: "story-stage story-chapter",
    "data-chapter": chapter.id,
  }, [
    element("p", { class: "stage-eyebrow", text: `Chapter ${index + 1} · ${fixture.document.views[chapter.view].dimension}D projection` }),
    element("h2", { text: chapter.title }),
    element("p", { class: "chapter-subtitle", text: chapter.subtitle }),
    tierTabs,
  ]);
  chapter.tiers.forEach((tier) => {
    const insights = element("ul", {}, tier.insights.map((item) => element("li", { text: item })));
    const pitfalls = element("ul", {}, tier.pitfalls.map((item) => element("li", { text: item })));
    section.append(element("div", { class: "tier-copy", "data-tier": tier.id }, [
      element("p", { class: "stage-summary", text: tier.summary }),
      ...tier.prose.map((paragraph) => element("p", { class: "stage-prose", text: paragraph })),
      element("details", { class: "primer" }, [
        element("summary", { text: "Insights and pitfalls" }),
        element("h3", { text: "Key insights" }), insights,
        element("h3", { text: "Common pitfalls" }), pitfalls,
      ]),
      element("p", { class: "stage-source", text: `tier · ${tier.id} · view ${chapter.view}` }),
    ]));
  });
  section.addEventListener("click", () => store.set({ chapter: chapter.id, entity: `chapter:${chapter.id}` }));
  story.append(section);
});

tierIds.forEach((tierId, index) => {
  const label = chapters[0].tiers[index].label;
  tierNav.append(element("button", {
    type: "button", text: `${index + 1}. ${label}`, "data-tier": tierId,
    onClick: () => chooseTier(tierId),
  }));
});

const mapRoot = root.querySelector("#map-view");
const chartRoot = root.querySelector("#chart-view");
const legendRoot = root.querySelector("#legend-view");
const sandbox = root.querySelector("#sandbox");
const sandboxRoot = root.querySelector("#sandbox-view");
const mapTitle = root.querySelector("#map-title");
const chartTitle = root.querySelector("#chart-title");
const activeTitle = root.querySelector("#active-title");
const chartSummary = root.querySelector("#chart-summary");
const sourceToggle = root.querySelector("#sources-toggle");

createTerritory(
  root.querySelector("#territory"),
  root.querySelector("#territory-caption"), fixture, store);

root.querySelectorAll("#map-switch button").forEach((button) => {
  button.addEventListener("click", () => store.set({ map: button.dataset.map }));
});
sourceToggle.addEventListener("click", () => store.set(
  { sources: !store.get().sources }, { replace: true }));

store.subscribe((state) => {
  const chapter = chapters.find((item) => item.id === state.chapter) ?? chapters[0];
  const tier = chapter.tiers.find((item) => item.id === state.tier) ?? chapter.tiers[0];
  const view = fixture.document.views[chapter.view];
  activeTitle.textContent = `${chapter.title} · ${tier.label}`;
  mapTitle.textContent = state.map === "chapter"
    ? (chapter.id === "proof" ? "Replay lineage" : view.title)
    : state.map === "authored" ? "Authored network" : "Compiled plan";
  chartTitle.textContent = chapter.id === "proof" ? "Reservoir history" : "Concept sequence";
  chartSummary.textContent = chapter.id === "proof"
    ? `M ${fixture.summary.final_M} · ${fixture.summary.valid_spatial}/${fixture.summary.spatial_attempts} valid`
    : `${view.dimension}D → ${view.projection}`;
  root.querySelectorAll("#chapter-nav button").forEach((button) => {
    const active = button.dataset.chapter === state.chapter;
    button.classList.toggle("active", active);
    button.setAttribute("aria-current", active ? "step" : "false");
  });
  root.querySelectorAll("#tier-nav button").forEach((button) => {
    const active = button.dataset.tier === state.tier;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  root.querySelectorAll(".story-chapter").forEach((section) =>
    section.classList.toggle("active", section.dataset.chapter === state.chapter));
  root.querySelectorAll(".story-chapter .tier-tabs button").forEach((button) => {
    const active = button.dataset.tier === state.tier;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  root.querySelectorAll(".story-chapter .tier-copy").forEach((copy) =>
    copy.classList.toggle("active", copy.dataset.tier === state.tier));
  root.querySelectorAll("#map-switch button").forEach((button) => {
    const active = button.dataset.map === state.map;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  sourceToggle.textContent = state.sources ? "denotation" : "sources";
  sourceToggle.setAttribute("aria-pressed", String(state.sources));
  sandbox.hidden = chapter.id !== "proof";
  renderMap(mapRoot, fixture, store, state);
  renderChart(chartRoot, fixture, store, state);
  renderLegend(legendRoot, fixture, state);
  if (chapter.id === "proof") renderSandbox(sandboxRoot, fixture, state);
  else sandboxRoot.replaceChildren();
  root.dataset.activeChapter = state.chapter;
  root.dataset.activeTier = state.tier;
});

const observer = new IntersectionObserver((entries) => {
  const visible = entries.filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  const chapter = visible.target.dataset.chapter;
  if (chapter !== store.get().chapter) {
    store.set({ chapter, entity: `chapter:${chapter}` }, { replace: true });
  }
}, { rootMargin: "-24% 0px -44%", threshold: [0, .25, .5, .75] });
root.querySelectorAll(".story-chapter").forEach((section) => observer.observe(section));

window.addEventListener("keydown", (event) => {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLButtonElement) return;
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    const next = adjacentItem(store.get().chapter, chapters, event.key === "ArrowRight" ? 1 : -1);
    chooseChapter(next);
  } else if (event.key === "[" || event.key === "]") {
    const tiers = tierIds.map((id) => ({ id }));
    chooseTier(adjacentItem(store.get().tier, tiers, event.key === "]" ? 1 : -1));
  }
});
window.addEventListener("popstate", () => {
  const state = parseHash();
  if (validChapters.has(state.chapter) && validTiers.has(state.tier)
      && validMaps.has(state.map)) store.set(state, { replace: true });
});

root.dataset.atlasReady = "true";
if (location.hash) {
  requestAnimationFrame(() => root.querySelector(`#chapter-${store.get().chapter}`)
    ?.scrollIntoView({ block: "center" }));
}
return { fixture, store };
}

const autoRoot = document.querySelector("[data-restir-atlas]");
if (autoRoot) {
  mountAtlas(autoRoot).catch((error) => {
    autoRoot.dataset.atlasError = "true";
    const live = autoRoot.querySelector("#hero-meta");
    if (live) live.textContent = `Atlas failed to load: ${error.message}`;
    throw error;
  });
}
