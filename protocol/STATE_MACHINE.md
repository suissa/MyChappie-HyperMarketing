# AHMP State Machines

## Offer evaluation

```text
RECEIVED
  -> INVALID            (schema/protocol failure)
  -> INELIGIBLE         (valid offer, consumer constraint fails)
  -> ELIGIBLE
       -> COUNTEROFFER
       -> NOT_SELECTED
       -> PRESENTED
       -> NO_ACTION      (campaign-cycle decision)
```

`INELIGIBLE` is not a transport error.

## Human feedback

```text
PRESENTED
  -> ACCEPTED
  -> REJECTED
  -> IGNORED
  -> DISMISSED
  -> PURCHASED
```

`PURCHASED` MAY follow `ACCEPTED` or be recorded independently when correlation is known.

## Purchase lifecycle

```text
PURCHASED
  -> durable        -> SUPPRESSED
  -> consumable     -> SUPPRESSED_UNTIL_REPLENISHMENT
  -> subscription   -> SUPPRESSED_WHILE_ACTIVE
  -> service        -> RENEWAL_POLICY
  -> unknown        -> CONSERVATIVE_POLICY
```

A product entering `SUPPRESSED` can still generate complement candidates. Suppression applies to redundant acquisition marketing, not to semantic relations.

## Discovery/recovery

```text
COMPLEMENT_CANDIDATE
  -> ELIGIBLE
  -> SELECTED_AS_DISCOVERY
  -> PRESENTED
  -> REJECTED
  -> RECOVERY_ALLOWED?
       yes -> [baseline, replenishment, bundle, discount, alternate_complement, no_action]
       no  -> no_action
```

There is intentionally no transition `REJECTED -> BIGGER_DISCOUNT`.
