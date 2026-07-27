# ReSTIR Notes & Scratchpad

## Measure Theory ReSTIR

- [index](measure-theory/index.html)
- [essay-01-pushforward-pullback](measure-theory/essays/essay-01-pushforward-pullback.html)
- [essay-02-residual-measure-transport](measure-theory/essays/essay-02-residual-measure-transport.html)
- [essay-03-biomimetic-reservoir-intelligence](measure-theory/essays/essay-03-biomimetic-reservoir-intelligence.html)
- [essay-04-shape-of-a-reservoir](measure-theory/essays/essay-04-shape-of-a-reservoir.html)
- [essay-05-curvature-of-reuse](measure-theory/essays/essay-05-curvature-of-reuse.html)
- [essay-06-pixel-is-not-a-point](measure-theory/essays/essay-06-pixel-is-not-a-point.html)
- [essay-07-geometry-of-light-transport](measure-theory/essays/essay-07-geometry-of-light-transport.html)
- [essay-08-curvature-guided-sampling](measure-theory/essays/essay-08-curvature-guided-sampling.html)

## Measure Decomposition ReSTIR

- [measure-decomposition/index](measure-decomposition/index.html)
- [measure-decomposition/part1](measure-decomposition/part1.html)
- [measure-decomposition/part2](measure-decomposition/part2.html)
- [measure-decomposition/part3](measure-decomposition/part3.html)
- [measure-decomposition/part4](measure-decomposition/part4.html)
- [measure-decomposition/part5](measure-decomposition/part5.html)
- [measure-decomposition/part6](measure-decomposition/part6.html)
- [measure-decomposition/poc](measure-decomposition/poc.html)

## Various Explorations

- [gris-foundations](gris-foundations.html)
- [gris-math-analysis-01](gris-math-analysis-01.html)
- [gris-math-analysis-02](gris-math-analysis-02.html)
- [gris-math-analysis-03](gris-math-analysis-03.html)
- [restir-reservoirs-of-light-01](restir-reservoirs-of-light-01.html)
- [restir-reservoirs-of-light-02](restir-reservoirs-of-light-02.html)
- [restir-reservoirs-of-light-03](restir-reservoirs-of-light-03.html)
- [restir-reservoirs-of-light-04](restir-reservoirs-of-light-04.html)
- [restir-reservoirs-of-light-05](restir-reservoirs-of-light-05.html)
- [restir-volumetric](restir-volumetric.html)
- [square-root-sphere](square-root-sphere.html)

## ReSTIR Lab

### Basic Taichi CPU/GPU ReSTIR

- Baseline Monte Carlo path tracer with NEE (100 spp):
  ![baseline_reference](re-lab/taichi-reference_mc.jpg)
- Basic RIS path tracer — 1 spp with 32-candidate reservoir sampling (1 spp, 32 candidates):
  ![test_ris](re-lab/taichi-ris.jpg)
- ReSTIR DI — 4-pass pipeline with Generalized Balance Heuristic (32 frames):
  ![test_restir_st](re-lab/taichi-restir_di.jpg)
- ReSTIR PT — Path Tracing with Multi-Bounce PSS, Random Replay & Diffuse Reconnection (32 frames):
  ![test_restir_pt](re-lab/taichi-restir_pt.jpg)

### Restir Lab

- ReSTIR Lab video demo:
  <video width="640" height="360" controls muted>
  <source src="re-lab/restir-lab-demo.mp4" type="video/mp4" />
  https://ikrima.github.io/topos.noether/restir/re-lab/restir-lab-demo.mp4
  </video>

- ReSTIR Screenshots:
  ![](re-lab/restir-lab-screenshot-01.jpg)
  ![](re-lab/restir-lab-screenshot-02.jpg)
  ![](re-lab/restir-lab-screenshot-03.jpg)