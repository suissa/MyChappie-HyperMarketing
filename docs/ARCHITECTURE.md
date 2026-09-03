# Architecture

## 1. Goal

AHMP separates four concerns that are commonly mixed together in ad platforms:

1. **Eligibility** — whether an offer is permitted at all.
2. **Candidate generation** — which actions could be useful.
3. **Decisioning** — which eligible action has the best expected long-term value.
4. **Presentation** — whether, when and how the human is interrupted.

Eligibility is deterministic and precedes ranking, bidding, LLM reasoning and bandit exploration.

## 2. Trust model

```text
Merchant objective: maximize sustainable merchant value
Consumer objective: maximize consumer utility
Broker objective: enforce protocol + neutral allocation (optional)
```

A merchant MAY optimize price, margin and conversion, but MUST NOT override a hard consumer constraint.

## 3. Functional components

### 3.1 Consumer Agent

Owns or is authorized to evaluate the consumer's private state:

- explicit demand;
- ownership/purchase state;
- channel and modality preferences;
- allowed contact windows;
- price constraints;
- discovery budget;
- interruption budget;
- explicit refusals;
- category permissions.

### 3.2 Merchant Marketing Agent

Publishes structured offers and MAY produce counteroffers. It MUST NOT require the consumer agent to disclose more private data than is necessary to evaluate the proposal.

### 3.3 Eligibility Engine

A deterministic policy evaluator. Example hard rules:

```text
blocked_category             -> reject
explicit_not_interested      -> reject
wrong_channel                -> reject
wrong_modality               -> reject
outside_contact_window       -> reject
interruption_budget_exceeded -> reject
already_owned + durable      -> reject
price > explicit_max_price   -> reject or counteroffer_allowed
```

### 3.4 Candidate Generator

Candidate sources are ordered by evidential strength:

1. explicit intent;
2. replenishment need;
3. complementary relation to a purchase;
4. known baseline preference;
5. controlled discovery;
6. no action.

Historical affinity alone SHOULD NOT be treated as proof of current demand.

### 3.5 Complement Graph

A relation has at minimum:

```text
source_product
relation = complement
candidate_product
confidence
```

Implementations MAY enrich it with compatibility, directionality, temporal windows and semantic justification.

### 3.6 Conservative Contextual Bandit

The reference implementation uses a Conservative LinUCB-style policy. It chooses among action families using contextual features, but exploration is only allowed when it stays inside a configurable safety margin relative to a baseline.

### 3.7 Recovery Policy

A rejected discovery offer MAY create recovery candidates:

- known recurring product;
- known preferred product;
- replenishment;
- bundle;
- discount variant;
- no action.

A larger discount MUST NOT be an automatic consequence of rejection, otherwise the system trains the consumer to reject first offers.

### 3.8 Presentation Gateway

The selected semantic offer can be projected into different surfaces:

```text
OfferDecision
  -> WhatsApp text
  -> image/card
  -> audio
  -> web card
  -> voice assistant
```

The representation is not the offer itself.

## 4. Data flow

```text
PurchaseConfirmed
    -> OwnershipState
    -> LifecycleClassifier
    -> Suppression/Replenishment
    -> ComplementCandidates
    -> Eligibility
    -> Bandit
    -> Present | NoAction
    -> Feedback
    -> Reward
    -> BanditStateUpdate
```

## 5. Invariants

- `EligibilityDenied` MUST terminate marketing presentation for that proposal.
- An LLM MUST NOT override deterministic denial.
- Advertiser bid MUST NOT override deterministic denial.
- `NoAction` MUST remain selectable.
- A purchase MUST update ownership before new marketing candidates are generated when causally related.
- Feedback MUST be correlated to the actual decision that created the presentation.
- Learning updates SHOULD record the propensity/selection metadata required for later counterfactual evaluation.
