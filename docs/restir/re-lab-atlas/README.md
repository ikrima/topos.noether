# restir-lab architecture atlas

This directory is the interactive projection of the three-tier static
[architecture atlas](../docs/architecture/README.md). Its browser has no runtime
dependency on the renderer: `generated/atlas-v2.json` and the two PNGs are
committed products of the validated documentation AST and one deterministic
scalar replay.

## Use

From the repository root:

```bash
uv run python -m http.server 8000 --directory .
```

Open `http://127.0.0.1:8000/atlas/`. The site uses native ES modules, so it
should be served over HTTP rather than opened as a `file:` URL.

## Regenerate and verify

```bash
env UV_CACHE_DIR=/tmp/re-lab-uv-cache uv run python atlas/build.py
env UV_CACHE_DIR=/tmp/re-lab-uv-cache uv run python atlas/build.py --check
node --test atlas/tests/*.test.mjs
uv run python -m pytest tests/test_atlas.py -q
```

The build also regenerates the Markdown chapters and deterministic SVG maps in
`docs/architecture/`. The canonical fixture is deliberately pinned rather than
searched at build time. If pixel `(11, 14)` at frame 5 stops carrying the
expected proof shape, generation fails and the narrative must be reviewed before
accepting new data.

## Documentation and fixture contracts

The canonical documentation source is `docs/architecture/atlas.edn`, validated
as `restir-lab.architecture-doc.v1`. Its real `defatlas` tree contains chapters,
three tiers per chapter, semantic models, dimensional views, and source anchors.
The generator folds it into Markdown, SVG, normalized s-expressions, and browser
JSON.

The browser-facing contract is `restir-lab.atlas-fixture.v2`:

- `document` — the validated and normalized documentation AST;
- `metadata` — exact scene, camera-domain, pixel, backend, and integrator;
- `entities` — stable cross-view chapter, tier, and proof identities;
- `scene` / `frames` — analytic wireframe, bounds, image plane, and PNGs;
- `pipeline` — authored graph, compiled steps/fusion/resources, record projection;
- `replay` — the complete typed scalar replay lowered to JSON;
- `summary` — checked facts used by the opening and compact views.

The documentation AST is executable only as documentation data: its folds render
explanatory representations, never renderer kernels. Checked-in pipeline EDN and
the scalar replay remain the evidence providers for authored/compiled graphs and
the proof territory.

The site intentionally has no deployment workflow, external assets, copied
styles, or dependency bundle.
