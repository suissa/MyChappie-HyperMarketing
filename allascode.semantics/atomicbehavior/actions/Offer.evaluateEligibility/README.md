# Offer.evaluateEligibility

Pure deterministic gate executed before any optimization. It evaluates a single offer against the consumer Demand Contract, ownership/purchase state, timing, channel, modality and presentation budgets.

`Ok` does not mean the offer is eligible; it means evaluation completed successfully. `Ok.value.eligible=false` is a valid business result. `Error` is reserved for malformed or non-evaluable input.
