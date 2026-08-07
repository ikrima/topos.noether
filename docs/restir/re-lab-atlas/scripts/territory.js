import { enumName, number } from "./format.js";

const COLORS = {
  scene: "rgba(62,72,69,.28)",
  fresh: "#d97928",
  target: "#168da0",
  reconnection: "#d02a91",
  camera: "#3c75aa",
  failed: "#c74c42",
};

function pointsFromVertices(vertices = []) {
  return vertices.map((vertex) => vertex.hit.p);
}

function activeHybrid(sample, entity) {
  if (entity.startsWith("temporal:")) {
    return sample.temporal_shifts[Number(entity.split(":")[1])]?.hybrid_shift;
  }
  if (entity.startsWith("spatial:")) {
    return sample.spatial_shifts[Number(entity.split(":")[1])]?.hybrid_shift;
  }
  const final = sample.final_path_reservoir.at(-1);
  return final?.selected_spatial_shift?.hybrid_shift
    ?? final?.selected_temporal_shift?.hybrid_shift
    ?? sample.temporal_shifts[0]?.hybrid_shift;
}

export function createTerritory(canvas, caption, fixture, store) {
  const context = canvas.getContext("2d");
  const center = fixture.scene.bounds.center;
  const radius = fixture.scene.bounds.radius;
  const sample = fixture.replay.samples[0];
  let yaw = -0.72;
  let pitch = -0.32;
  let dragging = false;
  let previous = [0, 0];
  let state = store.get();

  function resetView() {
    yaw = -0.72;
    pitch = -0.32;
    draw();
  }

  function project(point, width, height) {
    let x = point[0] - center[0];
    let y = point[1] - center[1];
    let z = point[2] - center[2];
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    [x, z] = [x * cy - z * sy, x * sy + z * cy];
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    [y, z] = [y * cp - z * sp, y * sp + z * cp];
    const scale = Math.min(width, height) / (2.35 * radius);
    return [width * .5 + x * scale, height * .52 - y * scale, z];
  }

  function line(a, b, color, width = 1, alpha = 1) {
    const pa = project(a, canvas.clientWidth, canvas.clientHeight);
    const pb = project(b, canvas.clientWidth, canvas.clientHeight);
    context.globalAlpha = alpha;
    context.strokeStyle = color;
    context.lineWidth = width;
    context.beginPath();
    context.moveTo(pa[0], pa[1]);
    context.lineTo(pb[0], pb[1]);
    context.stroke();
    context.globalAlpha = 1;
  }

  function path(points, color, width = 2.2, alpha = 1) {
    points.slice(1).forEach((point, index) => line(points[index], point, color, width, alpha));
    for (const point of points) {
      const p = project(point, canvas.clientWidth, canvas.clientHeight);
      context.fillStyle = color;
      context.globalAlpha = alpha;
      context.beginPath();
      context.arc(p[0], p[1], width + 1.2, 0, Math.PI * 2);
      context.fill();
      context.globalAlpha = 1;
    }
  }

  function draw() {
    const ratio = Math.max(1, devicePixelRatio || 1);
    const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
    const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width; canvas.height = height;
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    fixture.scene.wireframe.forEach(([a, b]) => line(a, b, COLORS.scene, .75));

    const fresh = [sample.primary.ray_origin, ...pointsFromVertices(sample.indirect.vertices)];
    path(fresh, COLORS.fresh, 1.8, state.entity.startsWith("fresh:") ? 1 : .47);

    const hybrid = activeHybrid(sample, state.entity);
    if (hybrid) {
      const source = pointsFromVertices(hybrid.source_vertices);
      const target = pointsFromVertices(hybrid.target_vertices);
      if (source.length) path(source, COLORS.fresh, 2.1, .9);
      if (target.length) path(target, hybrid.valid ? COLORS.target : COLORS.failed, 2.3, 1);
      if (hybrid.reconnection_depth >= 2) {
        const sourcePoint = hybrid.source_vertices.find((v) => v.depth === hybrid.reconnection_depth)?.hit.p;
        const targetPoint = hybrid.target_vertices.find((v) => v.depth === hybrid.reconnection_depth - 1)?.hit.p;
        if (sourcePoint && targetPoint) line(targetPoint, sourcePoint, COLORS.reconnection, 3);
      }
      caption.textContent = state.chapter === "proof"
        ? `${hybrid.valid ? "supported" : "failed"} ${enumName(hybrid.mapping)} · J ${number(hybrid.jacobian)} · reconnect depth ${hybrid.reconnection_depth}`
        : `Exact proof territory · switch to Proof and introspection to unfold ${enumName(hybrid.mapping)}`;
    } else {
      const entity = fixture.entities[state.entity];
      caption.textContent = state.chapter === "proof" && entity
        ? `${entity.label} · ${entity.kind}`
        : "Exact scalar replay territory · frame 5, pixel (11, 14)";
    }
  }

  canvas.addEventListener("pointerdown", (event) => {
    dragging = true; previous = [event.clientX, event.clientY];
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    yaw += (event.clientX - previous[0]) * .008;
    pitch = Math.max(-1.25, Math.min(1.25, pitch + (event.clientY - previous[1]) * .008));
    previous = [event.clientX, event.clientY];
    draw();
  });
  canvas.addEventListener("pointerup", () => { dragging = false; });
  canvas.addEventListener("pointercancel", () => { dragging = false; });
  canvas.addEventListener("keydown", (event) => {
    const step = event.shiftKey ? .24 : .08;
    if (event.key === "ArrowLeft") yaw -= step;
    else if (event.key === "ArrowRight") yaw += step;
    else if (event.key === "ArrowUp") pitch = Math.max(-1.25, pitch - step);
    else if (event.key === "ArrowDown") pitch = Math.min(1.25, pitch + step);
    else if (event.key === "Home") resetView();
    else return;
    event.preventDefault();
    draw();
  });
  canvas.closest(".territory-plate")?.querySelector("[data-territory-reset]")
    ?.addEventListener("click", resetView);
  new ResizeObserver(draw).observe(canvas);
  store.subscribe((next) => { state = next; draw(); });
  return { draw, resetView };
}
