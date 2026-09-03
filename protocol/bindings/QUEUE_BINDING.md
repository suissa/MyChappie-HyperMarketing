# Queue / Event Binding

AHMP can be carried over NATS, Kafka, RabbitMQ, Redpanda, QUIC-based messaging, BullMQ or an in-memory bus.

The queue technology is not part of AHMP semantics.

## Required envelope preservation

A queue binding MUST preserve:

```text
id
protocol
version
type
timestamp
correlationId
idempotencyKey
actor
payload
```

## Suggested subjects/topics

```text
ahmp.offer.proposed
ahmp.offer.evaluated
ahmp.offer.presented
ahmp.feedback.recorded
ahmp.purchase.confirmed
ahmp.discovery.requested
ahmp.counteroffer.requested
ahmp.counteroffer.proposed
```

Bindings MAY translate these to technology-specific routing keys.

## Delivery semantics

AHMP assumes messages can be delivered more than once. State-changing consumers MUST deduplicate using `idempotencyKey` or a semantically equivalent idempotency store.

## Ordering

Global ordering is not required. Implementations MUST preserve causal ordering where a later operation depends on an earlier state transition. In particular, a causally related `purchase.confirmed` must update ownership before the next marketing decision that depends on that purchase.

## Dead letters

Malformed protocol messages MAY go to a dead-letter stream. Valid business rejection (`ALREADY_OWNED`, `PRICE_NOT_ELIGIBLE`, etc.) MUST NOT be treated as a dead-letter failure.
