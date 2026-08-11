# Making theory feel necessary
### A problem- and opportunity-space memo ahead of the PRD
*Image Analysis Laboratory · Summer Workshop 2026 · draft v0.1*

---

## The problem is belief, not comprehension

Dr. Burghardt's goal is usually stated as "help students understand the theory." I think that
misdiagnoses the difficulty, and the misdiagnosis is why lectures on this subject rarely change
behaviour.

Most life-science graduate students can follow the Abbe argument perfectly well when it is
explained. What they do not do is treat it as *operative* — as something that bears on a decision
they are about to make. They file it as background. The gap is not comprehension; it is transfer.

And their reason for filing it that way is locally rational. The instrument has presets. Core
facility staff set it up. The acquisition software has a button labelled "optimal." Images come out
that look broadly like the images in the papers they read. Nothing in an ordinary week punishes not
knowing what the condenser diaphragm does. Under those conditions theory reads as a tax on getting
to the data, not as a tool for getting better data.

So the question is not how to explain the theory more clearly. It is: **what would make a student
believe, from experience rather than from assertion, that not knowing this will cost them
something they care about?**

## What actually costs them something

It is worth being concrete about where ignorance bites, because the list has a structure that
should drive the design.

A reviewer rejects a colocalization claim because the objective's NA could not have supported it.
Four hours of booked beamtime produces a z-stack whose step size violates Nyquist, so the
reconstruction is unusable and the sample is already bleached. DIC relief gets read as topography
and becomes a false structural claim in a figure. A phase halo gets described as a membrane
feature. Someone closes the condenser diaphragm because it makes the image look crisper, and
throws away the outer aperture where the fine detail lives. Confocal zoom gets pushed past the
point where any new information appears, bleaching the sample to acquire nothing. Pixels saturate
and the intensity measurement is irrecoverably clipped. Segmentation underperforms and the
algorithm gets blamed.

Every one of those shares two properties, and they are the crux of this whole memo. **The damage is
invisible at the time it is done, and irreversible afterwards.** The microscope does not warn you.
It returns a perfectly attractive image either way. There is no error message, no failed build, no
red test. The only thing standing between a student and a confidently wrong result is whether they
understood, at the moment of the decision, what the instrument was and was not capable of.

That is the thesis worth reifying, and it is sharper and more alarming than "theory is useful":

> *The instrument will not tell you when you have ruined the experiment. The picture looks fine
> either way. Only the theory tells you whether what you are looking at is real.*

## Where our current materials fall short

An honest audit of what we have built so far, against that thesis.

Companion 01, the back focal plane explorer, is a *mechanism* explainer. It is accurate and, I
think, genuinely good at collapsing four contrast modes into one idea. It is also entirely inert
with respect to motivation. Nothing in it costs the student anything, and no student ever discovers
that they were about to be wrong.

Companion 02, the pre-flight card, is *procedural*, and it carries a tension we should name rather
than paper over: a good checklist is a partial substitute for understanding. A student can follow
six steps correctly for a year without ever forming a model of why. We may have built something
that makes it easier to skip the theory.

Neither artifact touches the student's own experiment or their own data. Neither produces a
consequence. Neither is assessed, which also means Burghardt has no evidence about whether any of
this lands — a gap that matters to him institutionally as much as pedagogically.

And the deck itself, at fifty-three slides, is exposition. Exposition is close to the weakest
available instrument for changing what someone believes is worth their attention.

Put plainly: **we have built explanation and procedure, and we have built no consequence at all.**

## What creates the belief

Four mechanisms are worth building around, and they are ordered by how much I think they would
move the needle here.

The first is **productive failure**. Let students attempt an authentic acquisition task *before*
any teaching, and fail in a way that is legible afterwards. The failure opens the slot that the
theory then fills. Kapur's work on this is reasonably strong, and it inverts the natural instinct
to teach first.

The second is **committed prediction**. Asking someone to commit to an answer before revealing it
makes a wrong answer far stickier than a correct explanation read passively. This is nearly free to
retrofit onto what we already have.

The third is **scarcity with real consequence**. A photon budget, a bleaching sample, a fixed
session length. Scarcity is what converts abstract knowledge into decision-relevant knowledge,
because it forces a trade to be made rather than a fact to be recalled.

The fourth is **diagnosis rather than construction**. Being handed a broken image and asked what is
wrong with it tests and builds understanding far better than being asked to explain a concept. It
is also the competence that working scientists actually need, and the one nothing in our current
material addresses.

## The opportunity space, pruned

I generated a wider set than this and cut most of it. What survives, in rough order of value per
unit of build effort:

**A beamtime simulation with a budget.** The student is given a biological question — do these two
proteins colocalize, is this structure continuous, how many vesicles are docked — a sample that
bleaches, and a fixed session. Every choice costs something: objective, zoom, pixel dwell, z-step,
laser power, bit depth, averaging. At the end they get their data, and only then the verdict on
whether the data can answer the question they were asked. Critically, the sample is spent. This is
the strongest idea we have, because it is the only one that reproduces the actual structure of the
danger: invisible at the time, irreversible after.

**Diagnostic rounds.** A stream of real micrographs, each with a claim attached. Real or artifact?
Which artifact? Immediate feedback, scored over a run. Cheap to build, draws on assets already in
the deck, and trains the interpretive competence nothing else touches.

**A concept inventory, run before and after.** A short instrument in the spirit of the Force
Concept Inventory. It costs little, it gives students a pre-workshop score that stings productively,
and it gives Burghardt evidence the workshop works. It is also the sort of thing that becomes a
methods-education paper, which is a real incentive for him and worth saying out loud.

**Prediction prompts retrofitted into Companion 01.** Days of work, not weeks, and it converts a
demonstration into an experience.

Deferred with reasons: a diagnostic that ingests the student's own micrograph and its metadata is
extremely valuable but blocked on CZI and OME-TIFF parsing. A gallery of published figures with
resolution problems would be powerful and is a reputational hazard we should not take. An
AI-driven Socratic examiner over the student's own experiment is the most novel thing we could
build with the tooling available, and I would keep it as an optional adjunct rather than core,
because Burghardt has to sign off on this package and he cannot vouch for what a model says
unsupervised.

## The shape this suggests

The materials should stop being companions to a lecture and become an arc around it: inventory,
then failure, then Burghardt's theory, then the mechanism explorer, then hands-on with the bench
card, then the same task again with the theory in hand, then the inventory again. The deck becomes
the middle of a sandwich rather than the whole meal, which is also the most direct answer to the
question he actually asked.

Two open items for the PRD. I have only Part 1, which is optical; the argument transfers to
electron microscopy and in some respects sharpens there, since dose is a literal budget, but I
would want Part 2 before designing for it. And the entire sequencing question depends on how many
contact hours the workshop actually has, which I do not know.
