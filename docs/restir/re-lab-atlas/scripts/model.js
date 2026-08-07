export function wrsDecision(weight, runningWeight, u) {
  const w = Number(weight);
  const sum = Number(runningWeight);
  const draw = Number(u);
  return w > 0 && sum > 0 && draw >= 0 && draw < 1 && draw * sum < w;
}

export function jacobianProduct(geometry, previousPdfRatio, reconnectPdfRatio) {
  return Number(geometry) * Number(previousPdfRatio) * Number(reconnectPdfRatio);
}

export function entityChapter(entityId, entities, fallback = "system") {
  return entities[entityId]?.chapter ?? fallback;
}

export function itemIndex(itemId, items) {
  const index = items.findIndex((item) => item.id === itemId);
  return index < 0 ? 0 : index;
}

export function adjacentItem(itemId, items, delta) {
  const index = itemIndex(itemId, items);
  return items[Math.max(0, Math.min(items.length - 1, index + delta))].id;
}
