# Example Application: Generating a Ciechanowski-Style Opening

This document demonstrates how the template would be applied to generate the opening of an interactive essay.

---

## Input

**Topic**: How do noise-canceling headphones work?

**Target Understanding**: Reader should understand phase inversion, microphone-speaker feedback loops, and the limits of active noise cancellation (why it works better on low frequencies).

**Assumed Knowledge**: Basic understanding that sound is a wave.

---

## Generated Opening (Following Template)

### The Essay Would Begin:

---

# Noise Canceling Headphones

In the cacophony of modern life—airplanes humming, trains rattling, coffee shops buzzing—it can seem almost magical that a pair of headphones can make it all disappear. Active noise cancellation creates pockets of silence in seas of sound, and over the course of this article, I'll explain exactly how this apparent magic works.

In the demonstration below, you can drag the **ambient noise slider** to simulate your environment, from quiet library to roaring jet engine. The headphones are set to **passive mode** for now—they're just blocking sound physically:

[INTERACTIVE DEMO 1: Split view showing sound waves approaching an ear. Left side shows waves hitting directly; right shows waves partially blocked by over-ear headphone cups. Slider controls amplitude of ambient sound. Visual shows how much leaks through.]

Notice that even at **maximum passive isolation**, significant low-frequency rumble still penetrates the ear cups. The longer wavelengths of bass frequencies simply bend around obstacles too easily. If you could see sound, you'd witness this diffraction constantly.

Now let's turn on **active noise cancellation**. In the demonstration below, you can toggle the ANC system and witness something remarkable:

[INTERACTIVE DEMO 2: Same view, but now with a microphone visible on the outside of the cup, and a small speaker inside. When ANC toggled on, anti-phase wave (shown in **red**) emanates from internal speaker. Where **blue** ambient wave and **red** anti-wave meet, they annihilate into silence (shown as flatline). Slider still controls ambient amplitude.]

The **red wave** emitted by the headphones is precisely calculated to be the *opposite* of the incoming **blue noise**—when a peak meets a valley, they cancel to nothing. This is the fundamental principle of active noise cancellation: *destructive interference*.

But how does the headphone know what wave to emit? And why does the cancellation seem to work better on that constant engine drone than on your colleague's sudden laugh? Let's build this system from scratch to understand its triumphs and limitations.

We'll start with the simplest possible scenario: a single, pure tone arriving at your ear.

[INTERACTIVE DEMO 3: A single sine wave approaching. Slider labeled "Frequency" allows changing from 50Hz to 2000Hz. Shows wavelength visibly changing. Reader can intuit that lower frequencies = longer waves.]

---

## Template Analysis of This Opening

| Principle | Implementation |
|-----------|----------------|
| **Show complete system first** | Demo 2 shows full ANC working before any explanation |
| **Manipulate to understand** | All demos have sliders; reader controls the experience |
| **Color vocabulary** | Blue = ambient noise, Red = anti-noise (persists throughout) |
| **Everyday hook** | "Airplanes humming, trains rattling, coffee shops buzzing" |
| **Progressive reveal** | Passive → Active → "How does it know?" |
| **Witness the limitation** | Demo 1 lets reader SEE low frequencies leaking through |
| **Voice patterns** | "Notice that...", "Let's turn on...", "If you could see sound..." |
| **Wonder before mechanism** | ANC called "apparent magic" before explanation |
| **Setup next section** | Questions posed that next section will answer |

---

## Color Coding Established

For this essay, the following colors would be used consistently:

| Color | Meaning |
|-------|---------|
| **Blue** | Ambient sound waves |
| **Red** | Anti-noise waves from ANC |
| **Yellow** | Microphone / sensing |
| **Green** | Internal speaker / emission |
| **Gray** | Physical headphone structure |

Every subsequent demonstration would maintain this vocabulary.

---

## How Next Sections Would Flow

### Section 2: "A Single Tone"
- Problem: How do we generate the exact opposite wave?
- Interactive: Slider controlling phase offset; show perfect cancellation at 180°
- "Unfortunately, achieving exactly 180° phase offset requires knowing the sound *before* it arrives..."

### Section 3: "Predicting Sound"
- Solution: The microphone samples slightly ahead
- Interactive: Show time delay between external mic and internal speaker
- "Thankfully, sound travels relatively slowly—about 1 foot per millisecond..."

### Section 4: "The Speed Problem"
- Problem: Processing takes time; high frequencies change too fast
- Interactive: Frequency slider showing cancellation quality degrading above ~1kHz
- "You can witness this failure yourself—drag the frequency higher..."

### Section 5: "Feedforward vs Feedback"
- Solution: Multiple microphone architectures
- Interactive: Toggle between system types, see different performance profiles

### Closing
- Return to the airplane cabin
- Reflection on human ingenuity in carving silence from noise
- "Despite the limitations... these devices show a remarkable mastery of wave physics"

---

This example demonstrates how the template systematically generates the opening hooks, establishes visual vocabulary, sets up the progressive problem→solution chain, and creates space for reader discovery through manipulation.
