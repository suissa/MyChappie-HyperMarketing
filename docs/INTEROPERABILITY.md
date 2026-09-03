# Interoperability

AHMP is intentionally narrow: it standardizes marketing intent constraints, offers, eligibility, discovery, recovery, feedback and decision metadata.

## UCP

UCP is the commerce layer. As of the AHMP `2026-09-03` proposal, the current UCP release is `2026-08-25`.

Recommended handoff:

```text
AHMP OfferDecision: present/accepted
  -> UCP catalog/cart/checkout
  -> UCP order lifecycle
```

AHMP SHOULD reference stable product/merchant identifiers that can be mapped into UCP resources.

AHMP does not redefine cart, checkout, fulfillment or order semantics.

## A2A

A2A `1.0.0` provides agent discovery, communication and extensibility. AHMP defines an optional A2A extension binding:

```text
extension URI: urn:ahmp:a2a:2026-09-03
```

An agent can carry AHMP structured payloads in A2A messages while preserving A2A task lifecycle and transport behavior.

Suggested skills/capabilities:

- `evaluate-offer`
- `submit-offer`
- `record-feedback`
- `request-counteroffer`

## MCP

MCP `2026-07-28` supports full JSON Schema 2020-12 tool schemas. AHMP schemas can be reused directly for tools such as:

```text
ahmp.evaluate_offer
ahmp.get_demand_contract
ahmp.find_complements
ahmp.record_feedback
ahmp.record_purchase
```

MCP is a tool/data-access binding, not the marketing protocol itself.

## AP2

AP2 `0.2` secures agent-performed checkout/payment using mandates and receipts. AHMP terminates its responsibility before payment authorization:

```text
AHMP decision
 -> user/agent accepts
 -> UCP checkout
 -> AP2 checkout/payment mandate
```

An autonomous consumer agent SHOULD NOT treat marketing permission as payment authority.

## Protocol stack

```text
Human governance
      ^
Consumer Agent
      |
AHMP  | demand / offer / eligibility / learning
      |
A2A   | agent transport and collaboration
MCP   | tools/data
UCP   | commerce
AP2   | agentic payment authorization
```

## Other transports

Because AHMP's core contract is JSON Schema + state transitions, it MAY be carried over HTTP, queues, NATS, Kafka, QUIC, WebSocket or local in-memory messaging. A binding MUST preserve message identity, correlation, ordering requirements where specified, and payload semantics.
