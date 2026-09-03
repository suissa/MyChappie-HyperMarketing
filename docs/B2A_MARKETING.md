# B2A Marketing Model

## From targeting humans to qualifying offers

Traditional ad systems primarily optimize delivery toward humans. AHMP changes the unit of interaction:

```text
Traditional:
Advertiser -> audience targeting -> impression -> human

B2A:
Business -> machine-readable OfferProposal -> ConsumerAgent -> eligibility/utility -> human
```

The business is not guaranteed an impression. It receives a protocol decision.

## Three primary offer modes

### Intent Offer

The strongest signal. The consumer explicitly asks for a product, service or outcome with optional constraints.

Example:

```text
"running shoes <= BRL 500"
```

Businesses compete to satisfy that demand.

### Complementary Discovery Offer

After a purchase, the system explores products/services that complement what is owned.

```text
phone -> case / charger / insurance / headphones
printer -> ink / paper
hotel booking -> transfer / activity
```

Discovery is controlled by the consumer's discovery and interruption budgets.

### Baseline Recovery Offer

If discovery is rejected, the decision engine MAY fall back to a high-confidence action based on known preference or replenishment.

Recovery is not synonymous with discounting.

## Why the model is consumer-governed

The following are constraints, not ranking features:

- do-not-disturb;
- blocked categories;
- allowed channels;
- allowed modalities;
- explicit refusal;
- ownership suppression;
- contact frequency limits.

The system MAY rank inside the permitted space but MUST NOT optimize around a denial.

## Merchant feedback without unnecessary surveillance

A merchant can receive a reason code such as:

```text
CONSTRAINT_NOT_SATISFIED
ALREADY_OWNED
TIMING_NOT_ALLOWED
PRICE_NOT_ELIGIBLE
DISCOVERY_BUDGET_EXHAUSTED
```

The consumer agent does not need to reveal the private value that caused the result. For example, it can reject a price without revealing the exact maximum acceptable price.

## New marketing metrics

AHMP implementations SHOULD track metrics beyond CTR/CPC/CPM:

- `UsefulOfferRate`
- `EligibilityPassRate`
- `OfferAcceptanceRate`
- `DiscoveryInformationGain`
- `ConsumerInterruptionCost`
- `SuppressedRedundantOfferRate`
- `RecoveryAcceptanceRate`
- `DiscountCostPerIncrementalConversion`
- `NoActionRate`
- `LongTermConsumerUtility`

The objective is not maximum communication volume. It is maximum sustainable utility under consumer constraints.
