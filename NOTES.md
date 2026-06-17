# Notes & deferred decisions

## Disclosure policy — how much to reveal on the site (DEFERRED — decide later)

Open question: are we giving a fast-follower too much of the build plan?

Guiding principle (matches `guidance/01_market_positioning.md`): the moat is the
**public track record + daily habit**, not the methodology. The dashboard is free
and public, so hiding *shipped* features is pointless. Be specific about the
**what / why** (outputs, value, calibration, track record); be vague about the
**how** (features, training, pipeline internals) — especially for the
not-yet-shipped forecast.

**If/when we decide to trim, soften these (recipe-like, low marketing payoff):**
- "**leakage-proof** model" → "a model" / drop the adjective (advertises training discipline).
- "the same **flow-based features** will feed a model…" → "a probabilistic spread-risk forecast" (don't name the feature source).
- **"How it works" pipeline** ("gold marts", "raw → derived", in-region, stage-by-stage)
  → collapse to one high-level line, e.g. *"Live data in, a clean calibrated signal out — refreshed every morning."*

**Keep (value + credibility + the moat itself):**
- Live map, datasets, flow-based / CNEC / tightness views — all public already.
- "Probabilistic / calibrated", "quantile fans", "tail probabilities" — outputs a quant audience needs to trust us.
- "**Published before gate closure**" — actionability, not method.
- "**Public track record, scored in the open**" — the one thing a copier can't shortcut.

Status: **not applied.** Revisit before any public launch push.
