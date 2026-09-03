# AHMP as AllasCode Semantics

This directory is the canonical semantic declaration of HyperMarketing behavior. Runtime languages are projections of these declarations; they are not the source of business meaning.

## Rules

- Every atomic behavior has a `canonical_label`.
- `manifest.yml` exposes what the behavior is and emits.
- `config.yml` defines internal dependencies and policy values.
- `schema/` defines typed boundaries without hiding semantics in implementation code.
- `specifications/` defines executable scenarios.
- A behavior emits only `Ok` or `Error`; domain reasons are values inside those events.
- Deterministic eligibility always executes before bandit scoring or merchant competition.
- Consumer hard constraints cannot be overridden by bids, discounts, model scores or merchant priorities.
- TypeScript is the first executable projection; other languages must preserve the same contracts and conformance behavior.

## Initial behaviors

1. `Offer.evaluateEligibility`
2. `Marketing.selectNextBestOffer`

## Initial flow

`OfferQualification.2flow`

```text
OfferProposal -> Offer.evaluateEligibility
Offer.evaluateEligibility.Ok -> Marketing.selectNextBestOffer
Offer.evaluateEligibility.Error -> Decision.Rejected
Marketing.selectNextBestOffer.Ok -> Decision.Created
Marketing.selectNextBestOffer.Error -> HumanInTheHealingLoop
```
