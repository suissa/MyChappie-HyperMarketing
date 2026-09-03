# Decisioning and Conservative Discovery

## 1. Decision pipeline

```text
Candidate set
  -> deterministic eligibility
  -> contextual feature extraction
  -> bandit scoring
  -> conservative guard against baseline
  -> select candidate or no_action
  -> presentation
  -> feedback
  -> reward update
```

## 2. Why a contextual bandit

A recommendation is not evaluated only by product identity. Useful context includes:

- explicit intent match;
- complement confidence;
- price fit;
- lifecycle/replenishment timing;
- known preference;
- merchant quality;
- discount cost;
- interaction fatigue;
- time/channel context.

AHMP does not mandate a specific algorithm. LinUCB, Thompson Sampling, Bayesian contextual bandits or other policies MAY be used if protocol invariants and conformance requirements are preserved.

## 3. Reference feature vector

The TypeScript example uses a fixed vector:

```text
[
  bias,
  intentMatch,
  complementConfidence,
  priceFit,
  replenishmentFit,
  knownPreference,
  merchantQuality,
  fatiguePenalty
]
```

## 4. Action families

The reference decision model treats action families as arms:

```text
intent
complement_discovery
replenishment
baseline
bundle
discount
no_action
```

A concrete candidate (for example, a specific headset) carries one action family plus a contextual feature vector.

## 5. Conservative guard

Exploration SHOULD be guarded against a baseline policy.

Conceptually:

```text
if exploratoryScore < baselineScore - safetyMargin:
    choose baseline or no_action
else:
    choose highest eligible score
```

This is deliberately simpler than claiming a proof of conservative regret for every implementation. Production systems SHOULD choose a formally appropriate conservative contextual-bandit formulation for their reward model.

## 6. Reward design

Optimizing only purchase probability produces pathological incentives. A better reward includes value and cost:

```text
reward =
    conversion_value
  + information_gain
  + retention_value
  - discount_cost
  - interruption_cost
  - fatigue_cost
  - unsubscribe_risk
```

All terms MUST be normalized if combined numerically.

## 7. Rejection and recovery

A rejection records evidence about the presented candidate. It MAY trigger a new decision cycle, subject to interruption limits.

Do not encode:

```text
reject -> larger discount
```

Encode:

```text
reject -> generate permitted recovery candidates -> bandit -> maybe discount / baseline / no_action
```

## 8. Offline evaluation

Bandit logs SHOULD include:

- chosen action;
- candidate set hash or identifiers;
- action propensity or selection probability when available;
- contextual features/version;
- policy version;
- observed reward;
- delayed outcomes.

This supports inverse propensity scoring, doubly robust estimators and replay-style evaluation where appropriate.
