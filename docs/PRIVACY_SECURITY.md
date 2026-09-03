# Privacy and Security

## 1. Consumer-side authority

Private demand constraints SHOULD remain with the consumer agent or a trusted consumer-side service whenever possible.

Merchants SHOULD receive the minimum decision information needed to improve or complete an offer.

## 2. Deterministic policy boundary

Hard eligibility constraints MUST be evaluated by deterministic code. An LLM MAY help classify products, infer semantic complement relations or generate explanations, but MUST NOT be allowed to bypass a denial.

## 3. Selective disclosure

A response SHOULD prefer coarse reason codes over raw private values.

Example:

```json
{
  "status": "rejected",
  "reasons": ["PRICE_NOT_ELIGIBLE"],
  "counterofferAllowed": true
}
```

rather than exposing the consumer's exact maximum price.

## 4. Offer integrity

Network implementations SHOULD support signed offer envelopes (JWS, COSE or an equivalent) when offers cross trust boundaries. A signed representation SHOULD bind:

- offer identifier;
- merchant identifier;
- price/currency;
- item identifiers;
- expiry;
- nonce/correlation identifier.

## 5. Replay protection

Remote bindings SHOULD use unique message IDs, timestamps and bounded expiry. A receiver MUST treat duplicate idempotency keys as the same logical operation.

## 6. Authentication and authorization

AHMP does not invent a payment authorization system. Implementations SHOULD use established identity and authorization mechanisms. For agentic checkout/payment, an accepted AHMP offer can be handed to UCP and AP2.

## 7. Consumer preference changes

A consumer MUST be able to revoke or tighten marketing permissions. Revocation MUST take precedence over previously learned preference state.

## 8. Data minimization

Implementations SHOULD avoid exporting complete purchase histories to merchants. Derived results such as `ALREADY_OWNED`, `COMPLEMENT_ELIGIBLE` or `REPLENISHMENT_WINDOW` can often be evaluated without disclosure of unrelated purchases.

## 9. Sensitive categories

Implementations SHOULD support category-level prohibition and jurisdiction-specific policy modules. The protocol is not a substitute for privacy, consumer-protection, advertising or sector-specific legal compliance.

## 10. Bandit safety

Learning state MUST NOT weaken deterministic policy. A policy update, model update or high learned reward cannot transform a denied candidate into an eligible candidate.
