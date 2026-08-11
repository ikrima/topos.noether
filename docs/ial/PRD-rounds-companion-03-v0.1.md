# PRD — Rounds
### A diagnostic instrument that is also the concept inventory
*Image Analysis Laboratory · Summer Workshop 2026 · Companion 03 · PRD v0.1*
*Owner: Z · Content authority: Dr. R. Burghardt · Status: draft for review*

---

## 1. Summary

**Rounds** is a single-file, offline HTML artifact in which a participant is shown a micrograph and
a claim about it, and must decide whether the claim survives — and if not, which physical principle
was violated. It runs three times across the workshop day: once cold in the morning as a
measurement, repeatedly in the afternoon as practice with feedback, and once again at the end as
the paired post-measurement.

The instrument and the training are the same artifact. That is the central design decision, and
everything below follows from it.

## 2. Why this, and why now

The two companions we have built so far explain a mechanism and prescribe a procedure. Neither
costs a participant anything, and neither gives Dr. Burghardt any evidence that the day worked. The
gap identified in the preceding memo is that we have built explanation and no consequence.

Rounds closes that gap in the cheapest available way. A participant who discovers before the
morning coffee that they were *confidently wrong* about six images has been given a reason to
listen to the theory that no amount of exposition supplies. The same data, aggregated over the
room and compared against the afternoon run, is the evidence Dr. Burghardt currently has no way to
collect — and is the kind of result that supports a methods-education paper, which is worth stating
plainly as an incentive.

## 3. Goals

The primary goal is that participants leave able to look at an unfamiliar micrograph and identify
which acquisition decision is responsible for what they are seeing. The secondary goal is a
defensible pre-to-post measurement of that ability, per principle, at the level of the room. The
tertiary goal is that the artifact remains useful after the workshop as a self-paced drill, since
the competence it trains decays without practice.

An explicit non-goal is teaching the theory. Rounds assumes the lecture and Companion 01 do that.
Rounds creates the demand for the theory in the morning and tests its transfer in the afternoon.

## 4. The core measurement idea

Every response captures two things: the answer, and the participant's confidence in it. Crossing
those gives four states, and only one of them matters much.

A participant who is *unsure and wrong* knows they do not know, and will ask. A participant who is
*sure and right* is fine. A participant who is *unsure and right* is guessing well. The dangerous
state — the one that maps exactly onto the thesis that the microscope never warns you — is **sure
and wrong**. That is the person who will publish the artifact.

The headline number for the day, shown to participants individually and to the room in aggregate,
is therefore not a score out of twenty. It is the fraction of responses in the confident-and-wrong
quadrant, morning versus afternoon. That framing is doing pedagogical work as well as measurement
work: it names the failure mode as overconfidence rather than ignorance, which is the accurate
diagnosis and the less humiliating one.

## 5. Item design

An item is an image or image pair, a claim or scenario in one sentence, and a forced choice. The
participant commits, rates confidence on a three-point scale, and — in practice mode only — then
receives the reveal.

Items come in five shapes. *Real or artifact*, where a structure is described and the participant
judges whether it is in the specimen or in the optics. *Which knob*, where a defective image is
shown and the cause must be identified. *Claim support*, where an image is paired with a methods
sentence and a conclusion, and the participant judges whether the conclusion is supportable at that
NA and sampling. *Paired comparison*, where two images differ in one parameter and the participant
identifies which violates a principle. And *predict then reveal*, used only in practice mode, where
parameters are given and the resulting image must be anticipated before it is shown.

The bank is organised by principle, because the per-principle gain is what the instructor summary
reports:

| Principle | Example item |
|---|---|
| Resolution and NA | A colocalization claim made with a 0.45 NA dry objective |
| Sampling and Nyquist | A z-stack whose step size cannot support the reconstruction shown |
| Contrast-mode artifact | A phase halo described as a membrane feature; DIC relief read as topography |
| Illumination | A field showing the step-1 shadow; a condenser diaphragm closed for contrast |
| Dynamic range | A saturated region used for an intensity ratio |
| *(Part 2, deferred)* | Dose, missing wedge, preparation artifact |

Each item exists as an **isomorphic pair**: the same underlying principle and the same discriminating
distractor, but a different specimen, different numbers, and a different image. Form A runs in the
morning, Form B in the afternoon. Without this the post-test measures memory of the morning's
answers, which would make the whole measurement worthless.

## 6. Where the images come from

This is the binding constraint on the build, and there is a good answer to it.

The scalar diffraction engine already written for Companion 01 is an item factory. It can render the
same specimen under correct and incorrect acquisition conditions, and the difference between the two
images is physically exact rather than illustrated. Synthetic items are also completely clean of
third-party rights, which matters because most of the imagery in the lecture deck belongs to Olympus,
Zeiss and FSU and cannot safely be redistributed in a participant-facing artifact.

Synthetic imagery covers the parametric principles well — sampling, NA, aperture, dynamic range —
because those are exactly what the engine models. It covers the interpretive principles badly,
because a phase halo on a synthetic phase object does not look like a phase halo on a real cell, and
the transfer we care about is to real specimens.

The plan is therefore mixed. Parametric items are generated synthetically and are available
immediately. Interpretive items are reserved for real IAL micrographs and are the first thing that
gets built once images arrive. Until then those slots ship with synthetic placeholders clearly marked
as such, so the shortfall is visible rather than hidden.

## 7. Modes

**Diagnostic** is the morning run. Form A, twelve items, no feedback of any kind during the run,
roughly twelve minutes. At the end the participant sees only the confidence-by-correctness grid and
a result code. Withholding item-level feedback here is deliberate: feedback during the measurement
turns it into teaching and contaminates the baseline.

**Rounds** is the afternoon practice mode. Unlimited items drawn from the whole bank, immediate
reveal after each commitment, with the reveal naming the principle and, where relevant, linking
directly into the corresponding state of Companion 01 so the participant can go and manipulate the
thing they just got wrong. This is where the learning happens.

**Re-diagnostic** is the closing run. Form B, the isomorphic partner of every Form A item, again
without feedback during the run. Afterwards the participant enters their morning result code and
sees the delta, per principle, alongside the shift in the confident-and-wrong quadrant. Full
item-level review is unlocked at this point.

## 8. Getting the data to the instructor

The artifact has no server, no accounts and stores no personal information, which is the right
default for a teaching tool distributed as a file and is also the only thing consistent with how the
other companions work.

Persistence across the day is handled by a **result code**: a short base-64 string encoding the
per-item correctness and confidence vector, shown at the end of the morning run for the participant
to keep, and accepted as input by the afternoon run. Aggregation to the room is handled by
participants pasting that same code into whatever collection point Dr. Burghardt prefers — a form,
a shared sheet, or a text field on a projected page — from which a small offline summariser produces
the class view.

This is a deliberate trade: it costs one manual step per participant and it buys us no backend, no
data protection surface, and no dependency on network access in a basement microscope suite. If a
better collection route exists inside the TAMU environment we should revisit it, but not at the cost
of the artifact working offline.

## 9. Fit to a full day

The morning diagnostic runs first, before any teaching, and its result is projected immediately —
the room seeing its own confident-wrong fraction is the hook for everything that follows. Dr.
Burghardt's theory lecture then does what it already does. Companion 01 follows as the mechanism
explainer, ideally with the explorer open while he presents the diffraction material rather than
afterwards. The hands-on session at the scopes uses Companion 02 as the bench card. The afternoon
returns to Rounds in practice mode, worked in pairs rather than alone, because articulating a
diagnosis to another person is where most of the consolidation happens. The re-diagnostic closes the
day, and the class delta is the last thing on the screen.

Part 2, once it is ready, extends the bank rather than the architecture. Electron microscopy sharpens
every argument here — dose is a literal, unforgiving budget — and the item shapes transfer without
modification.

## 10. Scope for v1

In scope: the item engine and the three modes; confidence capture; isomorphic Form A and Form B;
twenty-four items, being twelve pairs spanning the five optical principles; the result code and its
offline summariser; deep links from a reveal into the corresponding Companion 01 configuration; and
the instructor summary view.

Out of scope for v1, and worth being firm about: any account system, any server, any storage of
participant identity, any runtime language-model generation of items, and any competitive
leaderboard. The last of those is a considered exclusion rather than an oversight — publicly ranking
graduate students on a test of something they have not yet been taught would trade the productive
part of the failure for humiliation, and would poison the afternoon.

## 11. Risks

The dominant risk is item quality. The items *are* the product, and a badly worded distractor does
not merely fail to teach — it teaches something false, and it does so under Dr. Burghardt's name.
Every item needs his review, and the review effort is the real cost of this build, not the code.

The second risk is calibration. A morning diagnostic that is too hard demoralises rather than
motivates. The target is a median first-run score around forty to fifty percent, with the
confident-wrong fraction high enough to be startling. We will not know whether we have hit that
until it is piloted, so a pilot with two or three volunteers before the workshop is not optional.

The third risk is the realism gap in synthetic imagery already discussed, which is mitigated by
mixing and by prioritising real micrographs for the interpretive items.

## 12. Success criteria

Primarily, a measurable fall in the confident-and-wrong fraction between the morning and afternoon
runs, with the per-principle breakdown showing where it moved and where it did not. Secondarily,
completion of both runs by most of the room, since an instrument nobody finishes measures nothing.
And qualitatively — the criterion I would actually trust most — participants in the afternoon
hands-on session invoking a principle by name, unprompted, to explain something they are looking at
on the scope.

---

### Open questions for Dr. Burghardt

Which of the five principles does he consider most often violated in practice by the students who
come through the IAL, so we can weight the bank accordingly. Whether he is willing to have the
room's aggregate result projected live, which is pedagogically stronger and socially riskier than
showing it privately. And whether any real micrographs can be released for item use, since that is
the one input that unblocks the interpretive half of the bank.
