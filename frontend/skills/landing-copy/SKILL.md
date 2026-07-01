---
name: landing-copy
description: Write and refine landing-page copy for Recall — a dementia-care life-memory app. Use this skill whenever the user asks to write, rewrite, shorten, or generate copy for any landing-page section (hero headline, subheadline, eyebrow, how-it-works steps, feature cards, CTA band, footer, social proof, FAQ, meta description). Covers the Recall brand voice, dignified dementia-aware language rules, and ready-to-use section frameworks with formulas and examples.
---

# Recall Landing Copy

This skill produces landing-page copy for **Recall** — a mobile-first app that uses Cognee's graph-vector memory to preserve a person's life story so that a loved one living with dementia can rediscover it. Copy is written to a real, emotional audience: exhausted caregivers and the families around them. It must feel warm, honest, and dignified — never clinical, never saccharine, never patronising.

When asked for copy, write the words **and** drop them into `src/lib/landing-content.ts` if the user wants them live (that file is the single typed source of all landing copy).

## Voice & Tone

Recall sounds like a **kind, capable friend who has been through this** — calm, plainspoken, quietly hopeful.

| Dial | Setting | Why |
|---|---|---|
| Warmth | High | The audience is grieving a slow loss. Lead with humanity. |
| Formality | Low–medium | Plain words over jargon. "Loved one", not "care recipient". |
| Confidence | High, never boastful | Reassure; don't oversell. No "revolutionary", no "world's first". |
| Sentiment | Hopeful, grounded | Acknowledge the hard reality, then offer a small, real help. |

**Core promise to echo everywhere:** *the memories that make a person who they are can be kept close, and gently returned to them.*

## Language Rules (dementia-aware — non-negotiable)

- **Person first.** "A person living with dementia", "your loved one" — never "a dementiac", "sufferer", "victim", "the demented".
- **No fear language.** Avoid "lost forever", "tragic", "decline", "deteriorate", "battle". Name the reality softly: "when memories fade", "harder to hold onto".
- **No infantilising.** Adults with dementia are adults. No "cute", no baby-talk, no exclamation-mark cheer.
- **No medical claims.** Recall is not a treatment, diagnosis, or therapy. Never imply it slows, treats, or reverses dementia. It *preserves and surfaces memories* — that's the claim.
- **Dignity in every verb.** Memories "surface", "return", "come back gently" — they are not "retrieved from a database" in user-facing copy.
- **Concrete over abstract.** "Your mum's wedding day, in her own voice" beats "rich multimedia memories".

## Headline Formulas

Pick the one that fits the section's job. Keep hero headlines ≤ 7 words per line, ≤ 2 lines.

1. **The kept-promise** — *"A living memory for the people you love."*
2. **The gentle reversal** — *"When memories fade, Recall holds them close."*
3. **The outcome** — *"Their whole story, always within reach."*
4. **The role** — *"The memory layer for the people you love."* (humanised echo of dev-tool taglines)
5. **The question** — *"What if a hard day could end with a happy memory?"*

Put ONE accent phrase per hero headline (the emotional core) and let the UI color it. Example accent words: *living memory*, *holds them close*, *within reach*.

## Section Frameworks

### Eyebrow (kicker)
3–5 words, sets credibility or category. Formula: `<Proof> · <Category>`.
- "Built on Cognee · Memory AI"
- "For families facing dementia"

### Hero subheadline (1–2 sentences, ≤ 35 words)
Answer three questions fast: *what it does · how (the Cognee graph) · who it's for.*
> "Recall turns photos, voices and family stories into a connected memory graph — so a loved one living with dementia can find their way back to the moments that made them."

### Primary / secondary CTA
- Primary = the commitment, low-friction: "Start for free", "Create your free account".
- Secondary = the curious path: "See how it works", "Watch a 60-second demo".
- Trust row beneath: 3 short proofs — "Free to start · No card required · Private & secure".

### How-it-works (3 steps, parallel structure)
Each step = a 2–4 word imperative title + one sentence of plain benefit. Keep the verbs active and human. Tie step 2 to Cognee explicitly (the differentiator).
> 01 Capture the moment · 02 Cognee connects it · 03 Recall, gently

### Feature card (title ≤ 4 words, body ≤ 22 words)
Title names the feature in the user's words; body states the benefit, not the mechanism.
> **Daily orientation briefs** — "A gentle, auto-written summary of who, where and when — ready to read aloud each morning."

### Social proof / stats
Use sparingly and truthfully. Context stats ("55M people live with dementia worldwide") build empathy; product stats need real numbers or omit them. Never invent testimonials.

### CTA band (closing)
Re-state the promise as an invitation + remove the last friction.
> "Start preserving what matters — today." + "It's free to begin." + button.

### Meta description (≤ 155 chars)
One sentence: outcome + how + audience. Mirror the hero.

## Do / Don't

**Do**
- Read every line aloud — if it sounds like a brochure, rewrite it.
- Use second person ("you", "your loved one") to keep it personal.
- Prefer specific human nouns (mum, grandad, the wedding day) over "content" / "data" / "assets".
- Let one idea own each section. White space in copy = calm.

**Don't**
- Don't stack adjectives ("powerful, intelligent, seamless AI platform").
- Don't use dementia as a fear lever.
- Don't promise outcomes Recall can't deliver (memory improvement, medical benefit).
- Don't use exclamation marks in the main narrative. Calm, not chirpy.

## Output Format

When generating copy, return it as a filled `LandingContent` block (matching the interface in `src/lib/landing-content.ts`) so it can be pasted in directly, plus a one-line note on the intent of any headline you chose. If the user only wants one section, return just that section's fields.
