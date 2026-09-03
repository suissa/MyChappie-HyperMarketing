# MyChappie HyperMarketing

MyChappie HyperMarketing is a language-agnostic framework and protocol proposal for consumer-governed, Business-to-Agent (B2A) marketing.

The project treats advertising as structured, machine-readable **offers** evaluated by a consumer-side agent before a human is interrupted. Purchase state suppresses redundant offers, complementary-product discovery is handled by a conservative multi-armed bandit, and rejected discovery can fall back to a known baseline without making discounts an automatic reward for rejection.

## Core principle

> In B2C marketing, businesses compete for human attention. In B2A marketing, businesses must prove to a consumer agent that an offer deserves human attention.

## What this repository will contain

- Agentic HyperMarketing Protocol (AHMP) specification.
- Universal JSON Schema contracts and protocol envelopes.
- Consumer Demand Contract and communication preferences.
- Purchase/ownership-aware suppression and replenishment rules.
- Complementary-product discovery.
- Conservative contextual multi-armed-bandit decisioning.
- Baseline fallback and `no_action` as first-class decisions.
- Business-to-Agent offer negotiation.
- UCP, A2A, MCP and AP2 interoperability mappings.
- Storage-port architecture that works with databases or JSON files.
- TypeScript reference implementation using semantic nominal types.
- Conformance rules and tests for implementations in any language.

## Status

Initial specification and reference framework are being bootstrapped in this repository.
