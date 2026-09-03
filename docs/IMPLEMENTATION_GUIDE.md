# Language-Agnostic Implementation Guide

AHMP is implemented by preserving contracts and behavior, not by porting the TypeScript classes.

## Minimal runtime

A minimal implementation needs six logical services:

```text
StoragePort
EligibilityEngine
CandidateGenerator
DecisionPolicy
FeedbackLearner
PresentationAdapter
```

The runtime MAY be a monolith, actors, services, functions, workers or embedded code.

## Required processing order

```text
1. Load consumer Demand Contract.
2. Load relevant purchase/ownership state.
3. Load merchant offers and complement relations.
4. Generate semantically relevant candidates.
5. Evaluate deterministic eligibility.
6. Remove denied candidates permanently for this cycle.
7. Add no_action.
8. Rank/select using configured policy.
9. Persist decision and policy metadata.
10. Present only when decision=present.
11. Correlate feedback to decision.
12. Update learning state.
13. If purchase occurs, update purchase state before causally dependent marketing cycles.
```

## Storage port

Every language SHOULD expose an equivalent of:

```text
readCollection<T>(logicalName) -> List<T>
replaceCollection<T>(logicalName, records) -> void
```

Logical names:

```text
demand-contracts
products
offers
purchases
complements
feedback
decisions
bandit-state
```

This minimal shape makes files, databases, APIs and event-derived projections interchangeable. High-scale implementations SHOULD optimize writes internally rather than physically replacing full tables.

## Config-only deployment

The framework configuration selects persistence without changing domain code.

JSON files:

```json
{
  "storage": {"kind": "json", "path": "./data"}
}
```

Database adapter:

```json
{
  "storage": {
    "kind": "database",
    "module": "./postgres-adapter.js",
    "options": {"connectionUrlEnv": "DATABASE_URL"}
  }
}
```

Other languages can replace `module` with the idiomatic plugin/factory mechanism while preserving the same semantic configuration.

## Nominal semantic typing

Languages with structural typing SHOULD avoid representing every identifier as an interchangeable string.

Conceptually:

```text
ConsumerId != ProductId != OfferId != DecisionId
```

TypeScript uses branded/nominal intersections. Rust can use newtypes; Haskell can use `newtype`; Go can use named string types; Zig can use wrapper structs.

## Deterministic boundary

The following MUST be outside an LLM decision boundary:

- explicit consumer denial;
- contact schedule;
- allowed channel/modality;
- ownership suppression;
- price ceilings that are hard constraints;
- interruption/discovery budgets;
- idempotency;
- protocol validation.

An LLM MAY enrich complement relations or explanations, but deterministic code verifies the final candidate.

## Policy portability

The reference uses a Conservative LinUCB-style policy. Another implementation MAY use Thompson Sampling or another contextual bandit if:

- hard constraints stay outside the learner;
- `no_action` exists;
- baseline safety is preserved when configured;
- feedback is correlated;
- policy/version metadata is persisted.

## Interoperability test

Two implementations in different languages are interoperable when they can consume the same schema fixtures and produce decisions that satisfy the same normative invariants. Exact numeric bandit scores need not match unless both claim the same policy profile/version.
