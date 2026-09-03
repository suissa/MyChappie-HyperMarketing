# Conformance

A language implementation is conforming because of observable behavior, not because it copies the TypeScript source.

## Conformance levels

### AHMP-Core

MUST:

- parse/validate core schemas;
- evaluate hard eligibility before decisioning;
- support `no_action`;
- correlate feedback with decisions;
- suppress already-owned durable products unless an explicit exception exists;
- preserve consumer revocation precedence.

### AHMP-Consumer

Adds:

- Demand Contract support;
- communication schedule/channel/modality rules;
- interruption/discovery budgets;
- selective-disclosure rejection reasons.

### AHMP-Discovery

Adds:

- complement candidate generation;
- exploration vs baseline logic;
- persisted learning state;
- policy/reward metadata.

### AHMP-Transport

Adds at least one remote binding and MUST implement idempotency/replay controls.

### AHMP-Full

Core + Consumer + Discovery + Transport and published conformance results.

## Required scenario tests

1. durable purchase suppresses identical product;
2. consumable with elapsed replenishment window remains eligible;
3. blocked category is denied regardless of bandit score;
4. outside schedule is denied;
5. unsupported modality is denied;
6. complementary product is generated from a purchase relation;
7. rejected discovery does not automatically force a discount;
8. `no_action` can win;
9. feedback updates only the correlated policy action;
10. revocation overrides learned preference;
11. duplicate event/idempotency key is not applied twice;
12. merchant receives a coarse rejection reason without private constraint values.

## Golden fixtures

The JSON files in `protocol/examples/` and the TypeScript tests are reference fixtures. Future implementations SHOULD run the same fixtures to demonstrate cross-language equivalence.
