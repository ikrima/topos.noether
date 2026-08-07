const DEFAULT_STATE = Object.freeze({
  chapter: "system",
  tier: "orientation",
  entity: "chapter:system",
  map: "chapter",
  sources: false,
});

export function parseHash(hash = globalThis.location?.hash ?? "") {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  return {
    ...DEFAULT_STATE,
    chapter: params.get("chapter") || DEFAULT_STATE.chapter,
    tier: params.get("tier") || DEFAULT_STATE.tier,
    entity: params.get("entity") || DEFAULT_STATE.entity,
    map: params.get("map") || DEFAULT_STATE.map,
    sources: params.get("sources") === "1",
  };
}

export function stateHash(state) {
  const params = new URLSearchParams({
    chapter: state.chapter,
    tier: state.tier,
    entity: state.entity,
    map: state.map,
  });
  if (state.sources) params.set("sources", "1");
  return params.toString();
}

export function createStore(initial = parseHash()) {
  let value = { ...DEFAULT_STATE, ...initial };
  const listeners = new Set();
  return {
    get: () => value,
    set(patch, { replace = false } = {}) {
      const next = { ...value, ...patch };
      if (JSON.stringify(next) === JSON.stringify(value)) return;
      value = next;
      if (globalThis.history && globalThis.location) {
        const url = `${location.pathname}${location.search}#${stateHash(value)}`;
        history[replace ? "replaceState" : "pushState"](null, "", url);
      }
      listeners.forEach((listener) => listener(value));
    },
    subscribe(listener) {
      listeners.add(listener);
      listener(value);
      return () => listeners.delete(listener);
    },
  };
}

export { DEFAULT_STATE };
