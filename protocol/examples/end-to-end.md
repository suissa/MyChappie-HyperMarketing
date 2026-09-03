# End-to-end example

## Scenario

1. Consumer purchases `console-01`.
2. Purchase is marked `durable`; another `console-01` acquisition ad is suppressed.
3. Complement graph contains `console-01 -> headset-01` with confidence `0.92`.
4. Merchant publishes an offer for `headset-01`.
5. Consumer Agent checks hard constraints.
6. Conservative bandit chooses whether to explore the headset offer or use a baseline/no-action candidate.
7. Human rejects the headset.
8. Recovery generates `baseline`, optional `discount`, `bundle` and `no_action` candidates.
9. The bandit chooses among them. Rejection does not guarantee a discount.
10. Feedback updates only the chosen action family and correlated decision.

```text
Purchase(console-01)
  -> suppress(console-01)
  -> complements(headset-01)
  -> OfferProposal(headset-01)
  -> Eligibility=ALLOW
  -> Bandit=complement_discovery
  -> Present
  -> Rejected
  -> RecoveryCandidates[
       baseline,
       discount,
       bundle,
       no_action
     ]
  -> Bandit
  -> Decision
```
