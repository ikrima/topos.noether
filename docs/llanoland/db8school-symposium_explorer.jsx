import { useState, useCallback, useEffect, useRef } from "react";

const PROGRAMS = {
  stillness: {
    id: "stillness",
    name: "The Way of Stillness",
    subtitle: "A Program in Receptive Inquiry",
    authors: "Laozi & Shunryu Suzuki",
    color: "#2D6A4F",
    colorLight: "#40916C",
    colorFaint: "rgba(45,106,79,0.08)",
    metaphor: "Water",
    metaphorLine: "It yields to every force. And it carved the Grand Canyon.",
    thesis:
      "The deepest argumentation emerges from the deepest listening. The program that teaches least explicitly teaches most profoundly.",
    dimensions: { mind: 0.3, perception: 1.0, character: 0.8, will: 0.2 },
    produces:
      "People who can be present in a room where disagreement is happening without needing to win, flee, or perform. People whose first instinct is curiosity rather than defense.",
    doesNotProduce:
      "Competitive debaters in the conventional sense. Students may struggle in formats that reward speed and aggression.",
    phases: [
      {
        name: "Emptying the Cup",
        months: "1–3",
        core: "Structured listening practice. Pairs: one speaks, one listens without planning a response. Restate until the speaker says 'yes, that's what I meant.' No theory. No terminology. Observe who changes.",
      },
      {
        name: "The Container Emerges",
        months: "4–6",
        core: "Weekly gatherings with minimal form — a ritual of beginning (silence), a ritual of closing (name one thing that changed your thinking). Between: one person states a belief, the group explores through questions, not attacks.",
      },
      {
        name: "Water Finds Its Course",
        months: "7–9",
        core: "If students discover tournaments and want to compete, support it as their initiative. If not, the gathering deepens. One public event: an open inquiry session demonstrating a different mode of discourse.",
      },
      {
        name: "Roots and Water",
        months: "10–12",
        core: "The professor withdraws. Senior students facilitate. The test: does the quality of attention persist without the original teacher? Student org status for practical access. Measure: do students think differently?",
      },
    ],
    tensions: {
      title: "Laozi vs. Suzuki: Form vs. Formlessness",
      description:
        "Laozi's solo program would have even less structure — no regular meeting time, no designation as a 'program.' The river doesn't need a name. Suzuki insists on precise form as container for formlessness: specific sitting practice, formal protocols, rotating roles. Without the wheel, the empty hub has nowhere to be.",
    },
  },
  academy: {
    id: "academy",
    name: "The Academy",
    subtitle: "A Program in Systematic Formation",
    authors: "Aristotle, Plato, & Marcus Aurelius",
    color: "#B08B2D",
    colorLight: "#C9A227",
    colorFaint: "rgba(176,139,45,0.08)",
    metaphor: "The Gymnasium",
    metaphorLine:
      "The Greeks trained body and mind in the same space because excellence is cultivated through structured practice.",
    thesis:
      "Rigorous argumentation is an excellence (aretē) requiring systematic cultivation across three domains: the intellect, the orientation toward truth, and the character of the practitioner.",
    dimensions: { mind: 1.0, perception: 0.5, character: 0.8, will: 0.6 },
    produces:
      "Practitioners of structured reasoning who possess both competitive skill and intellectual integrity. People who treat argumentation as a civic art.",
    doesNotProduce:
      "Spontaneous, intuitive arguers. May lack the radical ego-dissolution the Contemplative and Warrior traditions cultivate.",
    phases: [
      {
        name: "Foundations",
        months: "1–4",
        core: "Month 1: The Organon — claim, warrant, impact, syllogistic form. Month 2: The Topoi — patterns of argument generation. Month 3: Rhetoric — ethos, pathos, logos with historical exemplars. Month 4: Integration — full practice debates with triple debrief (logic, truth, character).",
      },
      {
        name: "Deepening",
        months: "5–8",
        core: "First tournament (month 5). Months 6–7: The Dialectical Core — primary philosophical texts as positions to attack and defend, rotating roles, arguing positions you disagree with. Month 8: The Art of Changing Your Mind — each student identifies a belief they've revised and why.",
      },
      {
        name: "Mastery & Transmission",
        months: "9–12",
        core: "Competitive season with comprehensive preparation. Public symposium on campus issue. Course proposal (1-credit practicum). Senior students trained as mentors. Handbook documenting not just what but why.",
      },
    ],
    tensions: {
      title: "Aristotle vs. Plato vs. Marcus Aurelius",
      description:
        "Aristotle: competence is primary — the most technically skilled debaters, measured by results. Plato: truth-orientation is primary — more philosophy, less competition, a program that produces champions who can't distinguish truth from persuasion is a moral failure. Marcus: character is primary — a third of every session on inner work, reflective journaling, equanimity practices. Aristotle wins tournaments. Plato produces thinkers. Marcus produces better humans.",
    },
  },
  warriors: {
    id: "warriors",
    name: "The Way of the Warrior",
    subtitle: "Strategic Mastery Through Direct Engagement",
    authors: "Miyamoto Musashi, Sun Tzu, & Yamamoto Tsunetomo",
    color: "#8B1A1A",
    colorLight: "#A52A2A",
    colorFaint: "rgba(139,26,26,0.08)",
    metaphor: "The Dojo",
    metaphorLine:
      "You do not learn swordsmanship by studying swords. You learn it by picking one up and facing someone trying to cut you.",
    thesis:
      "Argumentation is combat in which real things are at stake. The Way trains through direct engagement, strategic intelligence, and the radical freedom from releasing attachment to outcome.",
    dimensions: { mind: 0.5, perception: 0.4, character: 0.7, will: 1.0 },
    produces:
      "Competitors who perform at peak under pressure. Strategists who understand the landscape. Warriors who fight with total commitment and zero attachment.",
    doesNotProduce:
      "Philosophers. The program assumes mastery reveals its own meaning through practice. Students may develop extraordinary skill while remaining unreflective about what that skill is for.",
    phases: [
      {
        name: "The Forging",
        months: "1–3",
        core: "Week 1: combat begins — no orientation, students debate immediately and fail. Weeks 2–12: daily kata — speed drills (30s/15s/10s argument generation), cross-ex drills, flowing, refutation. Sun Tzu's reconnaissance runs parallel. Tsunetomo's pre-round 'practice of dying' — visualize total defeat until the charge dissipates.",
      },
      {
        name: "The Campaign",
        months: "4–7",
        core: "First tournament month 4. Every round recorded, post-tournament analysis exhaustive. Adaptive training based on revealed weaknesses. Month 7: advanced strategems — 'win without your strongest argument,' 'concede the best point and still win,' 'argue the wrong side with full commitment.'",
      },
      {
        name: "Dominance & Legacy",
        months: "8–12",
        core: "Full competitive season with escalating difficulty. Month 11: open challenge event — anyone on campus debates a team member on any topic. Month 12: senior students become sparring partners for newcomers. Minimal documentation — the knowledge lives in practice.",
      },
    ],
    tensions: {
      title: "Musashi vs. Sun Tzu vs. Tsunetomo",
      description:
        "Musashi: the most brutal — daily rounds, enter all tournaments, highest attrition, smallest but most forged graduates. Sun Tzu: the most calculated — extensive research, strategic tournament selection, best record relative to resources. Tsunetomo: the most radical — weeks of ego-dissolution before any competition, producing the most psychologically free but slowest-developing debaters.",
    },
  },
  cicero: {
    id: "cicero",
    name: "The Ciceronian Program",
    subtitle: "The Complete Orator",
    authors: "Marcus Tullius Cicero",
    color: "#4A3080",
    colorLight: "#6B4FA0",
    colorFaint: "rgba(74,48,128,0.08)",
    metaphor: "The Forum",
    metaphorLine:
      "All roads lead to the place where decisions are made. Every skill exists to prepare for the consequential speech.",
    thesis:
      "The orator is the person of wide learning, moral seriousness, and rhetorical mastery who can make wisdom persuasive in the civic arena. Style is not ornament — it is thought made audible.",
    dimensions: { mind: 0.8, perception: 0.4, character: 0.6, will: 0.7 },
    produces:
      "Eloquent, learned, publicly effective speakers who treat rhetoric as an art form and a civic responsibility.",
    doesNotProduce:
      "People comfortable with silence. The Ciceronian tradition values fluency, which can become compulsion — the inability to not-speak.",
    phases: [
      {
        name: "The Liberal Foundation",
        months: "1–2",
        core: "Wide reading across all disciplines — philosophy, history, law, literature, science — as material for the orator. Voice and delivery training: projection, pacing, silence, physical presence. Actio as the most powerful canon.",
      },
      {
        name: "The Five Canons",
        months: "3–4",
        core: "Systematic instruction: Inventio (discovery), Dispositio (arrangement), Elocutio (style), Memoria (trained memory), Actio (delivery). Each canon practiced separately. The same argument presented five times, each emphasizing a different canon.",
      },
      {
        name: "Practice & Rhetorical Analysis",
        months: "5–7",
        core: "Competition with Ciceronian emphasis: every round is a performance. Study of great speeches across history — not just what was argued but how. Development of taste — intuitive sense for what is excellent in public speech. Humor as the most dangerous weapon.",
      },
      {
        name: "The Civic Turn & Complete Orator",
        months: "8–12",
        core: "Students engage in real public speaking — campus government, community forums, advocacy. Capstone: a 10–15 minute major address to a public audience. Can the student stand alone and hold them through the power of thought expressed with art?",
      },
    ],
    tensions: null,
  },
  demosthenes: {
    id: "demosthenes",
    name: "The Demosthenic Program",
    subtitle: "Dangerous Speech",
    authors: "Demosthenes of Athens",
    color: "#C45A1C",
    colorLight: "#D4722E",
    colorFaint: "rgba(196,90,28,0.08)",
    metaphor: "Pebbles in the Mouth",
    metaphorLine:
      "The boy who cannot speak but will not stop trying until the sea itself becomes his teacher.",
    thesis:
      "The purpose of rhetoric is to move people to act when action is necessary. The test is simple: when they speak, does something change?",
    dimensions: { mind: 0.4, perception: 0.5, character: 0.9, will: 1.0 },
    produces:
      "Advocates who speak because they must. People who measure success not by awards but by impact. People dangerous to complacency and injustice.",
    doesNotProduce:
      "Balanced, dispassionate analysts. Passion can blind as easily as it illuminates. Graduates are powerful but potentially unwise.",
    phases: [
      {
        name: "Finding the Fire",
        months: "1–2",
        core: "Each student identifies something genuinely wrong — a real injustice they've witnessed. Stand before the group and speak about it. No notes, no structure. The only feedback: 'Did I feel it? Did your words enter my body or only my ears?'",
      },
      {
        name: "The Forge",
        months: "3–4",
        core: "Technique as instrument of conviction. Practice speaking in hostile conditions: loud rooms, distracted audiences, while being interrupted. Build arguments that escalate — the crescendo structure that arrives somewhere the listener didn't expect but can't deny.",
      },
      {
        name: "Into the Arena",
        months: "5–7",
        core: "Competition judged by Demosthenic criteria: 'Would the judge have done something?' Real-world advocacy: city council, campus governance, community forums. Study not great speeches but great moments of persuasion — when someone spoke and the world shifted.",
      },
      {
        name: "The Cost of Speaking & Legacy",
        months: "8–12",
        core: "Study the costs of public speech — Demosthenes exiled, Cicero murdered, Douglass beaten, Malala shot. Practice arguing genuinely unpopular positions. Capstone: not a speech but a campaign — identify a concrete change and pursue it. Did any outcome change because a student spoke?",
      },
    ],
    tensions: null,
  },
};

const DIMENSIONS = [
  {
    key: "mind",
    label: "Mind",
    description: "Logic, structure, tools of thought",
    attribution: "Aristotle's contribution",
  },
  {
    key: "perception",
    label: "Perception",
    description: "Deep listening, openness, beginner's mind",
    attribution: "Suzuki & Laozi's contribution",
  },
  {
    key: "character",
    label: "Character",
    description: "Courage, equanimity, freedom from ego",
    attribution: "Marcus Aurelius & Tsunetomo's contribution",
  },
  {
    key: "will",
    label: "Will to Act",
    description: "Moving from understanding to doing",
    attribution: "Demosthenes' challenge",
  },
];

const SYNERGIES = [
  {
    pair: ["stillness", "academy"],
    insight:
      "Suzuki's listening practice solves Aristotle's blind spot: technically skilled debaters who can't hear their opponents.",
  },
  {
    pair: ["stillness", "warriors"],
    insight:
      "Tsunetomo's 'practice of dying' and Suzuki's beginner's mind are the same still point approached from opposite directions — surrender through combat vs. surrender through stillness.",
  },
  {
    pair: ["academy", "warriors"],
    insight:
      "Aristotle's systematic curriculum gives structure to Musashi's raw practice. Sun Tzu's intelligence-gathering fills the Academy's blind spot on competitive landscape.",
  },
  {
    pair: ["academy", "demosthenes"],
    insight:
      "Plato's truth-seeking orientation prevents Demosthenes' passion from becoming mere demagoguery. Demosthenes' urgency prevents Plato's inquiry from becoming mere contemplation.",
  },
  {
    pair: ["warriors", "cicero"],
    insight:
      "Cicero's emphasis on style and delivery refines the Warrior's raw competitive instinct into something that commands attention even outside tournament contexts.",
  },
  {
    pair: ["cicero", "demosthenes"],
    insight:
      "The deepest synergy and deepest tension. Cicero builds the dam — controlled, architectural, beautiful. Demosthenes is the flood. A complete orator needs both: the craft to shape the message and the fire to make it matter.",
  },
  {
    pair: ["stillness", "demosthenes"],
    insight:
      "The most surprising synergy. Demosthenes' 'finding the fire' requires exactly the deep self-listening that Stillness cultivates. You cannot speak from genuine conviction until you know what you genuinely believe.",
  },
  {
    pair: ["warriors", "demosthenes"],
    insight:
      "Tsunetomo's freedom from fear of defeat and Demosthenes' willingness to pay the cost of speaking converge: both require having already accepted the worst possible outcome.",
  },
];

const QUOTES = [
  {
    text: "The Tao that can be debated is not the eternal Tao.",
    author: "Laozi",
    program: "stillness",
  },
  {
    text: "In the beginner's mind there are many possibilities. In the expert's mind there are few.",
    author: "Shunryu Suzuki",
    program: "stillness",
  },
  {
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Aristotle",
    program: "academy",
  },
  {
    text: "Waste no more time arguing about what a good person should be. Be one.",
    author: "Marcus Aurelius",
    program: "academy",
  },
  {
    text: "The Way is in training.",
    author: "Miyamoto Musashi",
    program: "warriors",
  },
  {
    text: "The Way of the warrior is death. This means choosing death whenever there is a choice between life and death.",
    author: "Yamamoto Tsunetomo",
    program: "warriors",
  },
  {
    text: "Style is thought made audible.",
    author: "Cicero",
    program: "cicero",
  },
  {
    text: "When Demosthenes finished speaking, they said: Let us march.",
    author: "Traditional",
    program: "demosthenes",
  },
];

function RadarChart({ programs, activeProgram, onHover, size = 280 }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const angles = DIMENSIONS.map((_, i) => (Math.PI * 2 * i) / 4 - Math.PI / 2);
  const point = (angle, val) => ({
    x: cx + Math.cos(angle) * r * val,
    y: cy + Math.sin(angle) * r * val,
  });

  return (
    <svg width={size} height={size} style={{ overflow: "visible" }}>
      {[0.25, 0.5, 0.75, 1.0].map((level) => (
        <polygon
          key={level}
          points={angles.map((a) => `${point(a, level).x},${point(a, level).y}`).join(" ")}
          fill="none"
          stroke="rgba(120,110,90,0.15)"
          strokeWidth={level === 1 ? 1.5 : 0.75}
        />
      ))}
      {angles.map((a, i) => (
        <g key={i}>
          <line x1={cx} y1={cy} x2={point(a, 1).x} y2={point(a, 1).y} stroke="rgba(120,110,90,0.12)" strokeWidth={0.75} />
          <text
            x={point(a, 1.18).x}
            y={point(a, 1.18).y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#6B6456"
            fontSize={11}
            fontFamily="Georgia, serif"
          >
            {DIMENSIONS[i].label}
          </text>
        </g>
      ))}
      {programs.map((p) => {
        const prog = PROGRAMS[p];
        const isActive = activeProgram === p;
        const pts = angles.map((a, i) => point(a, prog.dimensions[DIMENSIONS[i].key]));
        return (
          <g
            key={p}
            onMouseEnter={() => onHover(p)}
            onMouseLeave={() => onHover(null)}
            style={{ cursor: "pointer" }}
          >
            <polygon
              points={pts.map((pt) => `${pt.x},${pt.y}`).join(" ")}
              fill={prog.color}
              fillOpacity={isActive ? 0.2 : 0.06}
              stroke={prog.color}
              strokeWidth={isActive ? 2.5 : 1.2}
              strokeOpacity={isActive ? 1 : 0.5}
              style={{ transition: "all 0.3s ease" }}
            />
            {isActive &&
              pts.map((pt, i) => (
                <circle key={i} cx={pt.x} cy={pt.y} r={3.5} fill={prog.color} />
              ))}
          </g>
        );
      })}
    </svg>
  );
}

function TimelineBar({ program }) {
  const prog = PROGRAMS[program];
  const totalMonths = 12;
  return (
    <div style={{ display: "flex", gap: 3, width: "100%" }}>
      {prog.phases.map((phase, i) => {
        const match = phase.months.match(/(\d+)/g);
        const start = parseInt(match[0]);
        const end = match.length > 1 ? parseInt(match[1]) : start;
        const span = end - start + 1;
        return (
          <div
            key={i}
            style={{
              flex: span,
              background: prog.color,
              opacity: 0.15 + i * 0.2,
              borderRadius: 4,
              padding: "6px 8px",
              minHeight: 36,
              display: "flex",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 10, color: "#3D3526", fontFamily: "Georgia, serif", fontWeight: 600, letterSpacing: "0.02em" }}>
              {phase.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ProgramCard({ programId, isExpanded, onToggle, style = {} }) {
  const prog = PROGRAMS[programId];
  return (
    <div
      style={{
        border: `1.5px solid ${isExpanded ? prog.color : "rgba(120,110,90,0.2)"}`,
        borderRadius: 10,
        background: isExpanded ? prog.colorFaint : "#FDFBF7",
        padding: isExpanded ? "24px 28px" : "16px 20px",
        cursor: "pointer",
        transition: "all 0.35s ease",
        ...style,
      }}
      onClick={onToggle}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: prog.color, flexShrink: 0, marginTop: 3 }} />
        <div>
          <h3 style={{ margin: 0, fontSize: 17, color: "#2A2318", fontFamily: "Georgia, serif", fontWeight: 600 }}>
            {prog.name}
          </h3>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#8B8070", fontStyle: "italic", fontFamily: "Georgia, serif" }}>
            {prog.authors}
          </p>
        </div>
      </div>

      {!isExpanded && (
        <p style={{ margin: "10px 0 0", fontSize: 13, color: "#5C5445", lineHeight: 1.55, fontFamily: "Georgia, serif" }}>
          {prog.thesis}
        </p>
      )}

      {isExpanded && (
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 20, padding: "14px 18px", background: "rgba(255,255,255,0.6)", borderRadius: 8, borderLeft: `3px solid ${prog.color}` }}>
            <p style={{ margin: 0, fontSize: 13, color: "#5C5445", fontFamily: "Georgia, serif", fontStyle: "italic" }}>
              Metaphor: <strong style={{ fontStyle: "normal" }}>{prog.metaphor}</strong> — {prog.metaphorLine}
            </p>
          </div>

          <p style={{ fontSize: 14, color: "#3D3526", lineHeight: 1.6, fontFamily: "Georgia, serif", marginBottom: 20 }}>
            {prog.thesis}
          </p>

          <h4 style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", color: "#8B8070", marginBottom: 10, fontFamily: "Georgia, serif" }}>
            Twelve-Month Arc
          </h4>
          <TimelineBar program={programId} />

          {prog.phases.map((phase, i) => (
            <div key={i} style={{ marginTop: 16, paddingLeft: 16, borderLeft: `2px solid ${prog.color}`, opacity: 0.35 + i * 0.18 > 1 ? 1 : 0.35 + i * 0.18 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: prog.color, fontWeight: 700, fontFamily: "Georgia, serif" }}>
                  Months {phase.months}
                </span>
                <span style={{ fontSize: 14, color: "#2A2318", fontWeight: 600, fontFamily: "Georgia, serif" }}>
                  {phase.name}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: "#5C5445", lineHeight: 1.6, fontFamily: "Georgia, serif" }}>
                {phase.core}
              </p>
            </div>
          ))}

          <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ padding: "12px 14px", background: "rgba(45,120,60,0.06)", borderRadius: 8 }}>
              <h5 style={{ margin: "0 0 6px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#4A7A3F", fontFamily: "Georgia, serif" }}>
                Produces
              </h5>
              <p style={{ margin: 0, fontSize: 12, color: "#5C5445", lineHeight: 1.55, fontFamily: "Georgia, serif" }}>
                {prog.produces}
              </p>
            </div>
            <div style={{ padding: "12px 14px", background: "rgba(160,80,40,0.06)", borderRadius: 8 }}>
              <h5 style={{ margin: "0 0 6px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#9A5A30", fontFamily: "Georgia, serif" }}>
                Blind Spot
              </h5>
              <p style={{ margin: 0, fontSize: 12, color: "#5C5445", lineHeight: 1.55, fontFamily: "Georgia, serif" }}>
                {prog.doesNotProduce}
              </p>
            </div>
          </div>

          {prog.tensions && (
            <div style={{ marginTop: 20, padding: "14px 18px", background: "rgba(120,110,90,0.06)", borderRadius: 8 }}>
              <h5 style={{ margin: "0 0 6px", fontSize: 12, color: "#6B6456", fontFamily: "Georgia, serif", fontWeight: 600 }}>
                ⚡ Internal Tension: {prog.tensions.title}
              </h5>
              <p style={{ margin: 0, fontSize: 12, color: "#5C5445", lineHeight: 1.55, fontFamily: "Georgia, serif" }}>
                {prog.tensions.description}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SynergyLine({ synergy }) {
  const a = PROGRAMS[synergy.pair[0]];
  const b = PROGRAMS[synergy.pair[1]];
  return (
    <div style={{
      padding: "14px 18px",
      background: "#FDFBF7",
      borderRadius: 8,
      border: "1px solid rgba(120,110,90,0.12)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.color }} />
        <span style={{ fontSize: 11, color: "#6B6456", fontFamily: "Georgia, serif" }}>{a.name}</span>
        <span style={{ fontSize: 11, color: "#B0A890" }}>↔</span>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: b.color }} />
        <span style={{ fontSize: 11, color: "#6B6456", fontFamily: "Georgia, serif" }}>{b.name}</span>
      </div>
      <p style={{ margin: 0, fontSize: 13, color: "#5C5445", lineHeight: 1.6, fontFamily: "Georgia, serif" }}>
        {synergy.insight}
      </p>
    </div>
  );
}

const TABS = [
  { id: "prism", label: "The Prism" },
  { id: "programs", label: "Five Programs" },
  { id: "dimensions", label: "Four Dimensions" },
  { id: "synergies", label: "Synergies" },
];

export default function App() {
  const [tab, setTab] = useState("prism");
  const [expandedProgram, setExpandedProgram] = useState(null);
  const [hoveredProgram, setHoveredProgram] = useState(null);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setQuoteIndex((i) => (i + 1) % QUOTES.length), 6000);
    return () => clearInterval(interval);
  }, []);

  const allPrograms = Object.keys(PROGRAMS);
  const activeForRadar = hoveredProgram || expandedProgram;

  return (
    <div style={{ minHeight: "100vh", background: "#F6F2EB", fontFamily: "Georgia, serif" }}>
      {/* Header */}
      <div style={{ padding: "32px 32px 0", maxWidth: 960, margin: "0 auto" }}>
        <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: "#B0A890", margin: "0 0 6px" }}>
          The Symposium on the School of Argumentation
        </p>
        <h1 style={{ margin: "0 0 6px", fontSize: 28, color: "#2A2318", fontWeight: 600, lineHeight: 1.2 }}>
          Prismatic Wisdom
        </h1>
        <p style={{ margin: "0 0 24px", fontSize: 14, color: "#6B6456", lineHeight: 1.5, maxWidth: 600 }}>
          Five distinct answers to one question: how do you build a school of argumentation from nothing? 
          Each refracts the same light through a different philosophical lens.
        </p>

        {/* Quote ticker */}
        <div style={{
          padding: "12px 20px",
          background: PROGRAMS[QUOTES[quoteIndex].program].colorFaint,
          borderRadius: 8,
          borderLeft: `3px solid ${PROGRAMS[QUOTES[quoteIndex].program].color}`,
          marginBottom: 24,
          transition: "all 0.5s ease",
          minHeight: 48,
          display: "flex",
          alignItems: "center",
        }}>
          <p style={{ margin: 0, fontSize: 13, color: "#3D3526", fontStyle: "italic", lineHeight: 1.5 }}>
            "{QUOTES[quoteIndex].text}" <span style={{ fontStyle: "normal", color: "#8B8070", fontSize: 11 }}>— {QUOTES[quoteIndex].author}</span>
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1.5px solid rgba(120,110,90,0.15)" }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setExpandedProgram(null); }}
              style={{
                padding: "10px 20px",
                background: "none",
                border: "none",
                borderBottom: tab === t.id ? "2.5px solid #3D3526" : "2.5px solid transparent",
                fontSize: 13,
                color: tab === t.id ? "#2A2318" : "#8B8070",
                fontFamily: "Georgia, serif",
                fontWeight: tab === t.id ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.2s ease",
                marginBottom: -1.5,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "28px 32px 48px", maxWidth: 960, margin: "0 auto" }}>
        
        {/* PRISM VIEW */}
        {tab === "prism" && (
          <div>
            <div style={{ display: "flex", gap: 40, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ flex: "0 0 auto" }}>
                <RadarChart
                  programs={allPrograms}
                  activeProgram={activeForRadar}
                  onHover={setHoveredProgram}
                  size={300}
                />
              </div>
              <div style={{ flex: 1, minWidth: 280 }}>
                <h3 style={{ margin: "0 0 6px", fontSize: 15, color: "#2A2318" }}>
                  Marcus Aurelius's Four Dimensions
                </h3>
                <p style={{ margin: "0 0 16px", fontSize: 13, color: "#6B6456", lineHeight: 1.55 }}>
                  "A school of argumentation must train the Mind, the Perception, the Character, and the Will to Act. 
                  No single tradition does all four." Hover over the chart to see each program's emphasis.
                </p>
                {DIMENSIONS.map((d) => (
                  <div key={d.key} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#3D3526" }}>{d.label}</span>
                      <span style={{ fontSize: 11, color: "#8B8070", fontStyle: "italic" }}>{d.attribution}</span>
                    </div>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6B6456" }}>{d.description}</p>
                  </div>
                ))}

                {activeForRadar && (
                  <div style={{
                    marginTop: 20,
                    padding: "14px 18px",
                    background: PROGRAMS[activeForRadar].colorFaint,
                    borderRadius: 8,
                    borderLeft: `3px solid ${PROGRAMS[activeForRadar].color}`,
                    transition: "all 0.3s ease",
                  }}>
                    <h4 style={{ margin: "0 0 4px", fontSize: 14, color: PROGRAMS[activeForRadar].color }}>
                      {PROGRAMS[activeForRadar].name}
                    </h4>
                    <p style={{ margin: 0, fontSize: 12, color: "#5C5445", lineHeight: 1.55, fontStyle: "italic" }}>
                      {PROGRAMS[activeForRadar].thesis}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: 32 }}>
              <h3 style={{ fontSize: 14, color: "#2A2318", marginBottom: 12 }}>The Five Programs at a Glance</h3>
              <div style={{ display: "grid", gap: 10 }}>
                {allPrograms.map((p) => (
                  <div
                    key={p}
                    onMouseEnter={() => setHoveredProgram(p)}
                    onMouseLeave={() => setHoveredProgram(null)}
                    onClick={() => { setTab("programs"); setExpandedProgram(p); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "12px 16px",
                      background: hoveredProgram === p ? PROGRAMS[p].colorFaint : "#FDFBF7",
                      border: `1px solid ${hoveredProgram === p ? PROGRAMS[p].color : "rgba(120,110,90,0.12)"}`,
                      borderRadius: 8,
                      cursor: "pointer",
                      transition: "all 0.25s ease",
                    }}
                  >
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: PROGRAMS[p].color, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#2A2318" }}>{PROGRAMS[p].name}</span>
                      <span style={{ fontSize: 12, color: "#8B8070", marginLeft: 8 }}>{PROGRAMS[p].authors}</span>
                    </div>
                    <span style={{ fontSize: 12, color: "#B0A890" }}>→</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PROGRAMS VIEW */}
        {tab === "programs" && (
          <div style={{ display: "grid", gap: 14 }}>
            {allPrograms.map((p) => (
              <ProgramCard
                key={p}
                programId={p}
                isExpanded={expandedProgram === p}
                onToggle={() => setExpandedProgram(expandedProgram === p ? null : p)}
              />
            ))}
          </div>
        )}

        {/* DIMENSIONS VIEW */}
        {tab === "dimensions" && (
          <div>
            <p style={{ fontSize: 14, color: "#5C5445", lineHeight: 1.6, marginBottom: 24 }}>
              Marcus Aurelius identified four capacities that a complete school of argumentation must cultivate. 
              Each program emphasizes different dimensions — their shapes on the chart reveal their philosophical commitments 
              as clearly as their curricula do.
            </p>
            <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "flex-start" }}>
              <RadarChart
                programs={allPrograms}
                activeProgram={activeForRadar}
                onHover={setHoveredProgram}
                size={320}
              />
              <div style={{ flex: 1, minWidth: 260 }}>
                {allPrograms.map((p) => {
                  const prog = PROGRAMS[p];
                  const isActive = activeForRadar === p;
                  return (
                    <div
                      key={p}
                      onMouseEnter={() => setHoveredProgram(p)}
                      onMouseLeave={() => setHoveredProgram(null)}
                      style={{
                        padding: "10px 14px",
                        marginBottom: 8,
                        borderRadius: 8,
                        background: isActive ? prog.colorFaint : "transparent",
                        border: `1px solid ${isActive ? prog.color : "transparent"}`,
                        cursor: "pointer",
                        transition: "all 0.25s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: prog.color }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#2A2318" }}>{prog.name}</span>
                      </div>
                      <div style={{ display: "flex", gap: 12 }}>
                        {DIMENSIONS.map((d) => (
                          <div key={d.key} style={{ flex: 1 }}>
                            <div style={{ fontSize: 10, color: "#8B8070", marginBottom: 3 }}>{d.label}</div>
                            <div style={{ height: 4, background: "rgba(120,110,90,0.1)", borderRadius: 2, overflow: "hidden" }}>
                              <div style={{
                                height: "100%",
                                width: `${prog.dimensions[d.key] * 100}%`,
                                background: prog.color,
                                borderRadius: 2,
                                transition: "width 0.4s ease",
                              }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                <div style={{ marginTop: 20, padding: "14px 18px", background: "rgba(120,110,90,0.05)", borderRadius: 8 }}>
                  <h4 style={{ margin: "0 0 6px", fontSize: 13, color: "#3D3526" }}>The Hidden Agreement</h4>
                  <p style={{ margin: 0, fontSize: 12, color: "#5C5445", lineHeight: 1.55, fontStyle: "italic" }}>
                    "Every school has some version of the same insight: the ego is the primary obstacle. 
                    We disagree about method. We agree about the enemy." — Marcus Aurelius
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SYNERGIES VIEW */}
        {tab === "synergies" && (
          <div>
            <p style={{ fontSize: 14, color: "#5C5445", lineHeight: 1.6, marginBottom: 8 }}>
              Where the programs complement and complete each other. Each synergy represents a place where one tradition's 
              strength addresses another's blind spot — the prismatic facets refracting toward wholeness.
            </p>
            <p style={{ fontSize: 12, color: "#8B8070", marginBottom: 24, fontStyle: "italic" }}>
              "Any program builder who takes all five seriously will construct something more complete than any single tradition could produce alone."
            </p>
            <div style={{ display: "grid", gap: 12 }}>
              {SYNERGIES.map((s, i) => (
                <SynergyLine key={i} synergy={s} />
              ))}
            </div>

            <div style={{
              marginTop: 32,
              padding: "20px 24px",
              background: "#FDFBF7",
              borderRadius: 10,
              border: "1.5px solid rgba(120,110,90,0.15)",
            }}>
              <h4 style={{ margin: "0 0 8px", fontSize: 15, color: "#2A2318" }}>
                The Cross-Cutting Insight
              </h4>
              <p style={{ margin: 0, fontSize: 14, color: "#3D3526", lineHeight: 1.65 }}>
                The deepest disagreement in the symposium is not between factions but <em>within</em> them — 
                because people who share a tradition understand most precisely where they diverge. 
                This applies to building any debate program: the most important conversations will not be 
                between your program and your competitors. They will be within your own coaching staff, 
                about what you are actually trying to do and why.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
