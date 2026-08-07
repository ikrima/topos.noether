import test from "node:test";
import assert from "node:assert/strict";

import {
  adjacentItem,
  entityChapter,
  itemIndex,
  jacobianProduct,
  wrsDecision,
} from "../scripts/model.js";
import { parseHash, stateHash } from "../scripts/state.js";

test("weighted reservoir acceptance changes exactly at w / running sum", () => {
  assert.equal(wrsDecision(2, 10, 0.199), true);
  assert.equal(wrsDecision(2, 10, 0.2), false);
  assert.equal(wrsDecision(0, 10, 0), false);
  assert.equal(wrsDecision(2, 0, 0), false);
});

test("hybrid Jacobian is the product of its factored terms", () => {
  const product = jacobianProduct(1.25, 0.5, 3);
  assert.equal(product, 1.875);
  assert.equal(product * (1 / product), 1);
});

test("chapter and tier navigation clamps at both ends", () => {
  const items = [{ id: "a" }, { id: "b" }, { id: "c" }];
  assert.equal(itemIndex("missing", items), 0);
  assert.equal(adjacentItem("a", items, -1), "a");
  assert.equal(adjacentItem("b", items, 1), "c");
  assert.equal(adjacentItem("c", items, 1), "c");
});

test("entities resolve to their architecture chapter", () => {
  const entities = { "spatial:2": { chapter: "proof" } };
  assert.equal(entityChapter("spatial:2", entities), "proof");
  assert.equal(entityChapter("missing", entities, "system"), "system");
});

test("deep-link state round trips", () => {
  const state = parseHash("#chapter=proof&tier=proof-and-source&entity=spatial%3A2&map=compiled&sources=1");
  assert.deepEqual(state, {
    chapter: "proof",
    tier: "proof-and-source",
    entity: "spatial:2",
    map: "compiled",
    sources: true,
  });
  assert.equal(
    stateHash(state),
    "chapter=proof&tier=proof-and-source&entity=spatial%3A2&map=compiled&sources=1",
  );
});
