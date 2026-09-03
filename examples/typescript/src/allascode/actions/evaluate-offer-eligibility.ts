import { evaluateEligibility } from "../../core/eligibility.js";
import type { EligibilityResult } from "../../domain/types.js";
import type { EvaluateOfferEligibilityInput } from "../contracts.js";
import { error, ok, type BehaviorResult } from "../result.js";

export type EvaluateEligibilityError = "INVALID_INPUT" | "EVALUATION_FAILED";

export function evaluateOfferEligibility(
  input: EvaluateOfferEligibilityInput,
): BehaviorResult<EligibilityResult, EvaluateEligibilityError> {
  if (!input.contract || !input.offer || !Array.isArray(input.purchases)) {
    return error("INVALID_INPUT", "Demand contract, offer and purchases are required");
  }

  try {
    return ok(
      evaluateEligibility({
        contract: input.contract,
        offer: input.offer,
        purchases: input.purchases,
        now: new Date(input.now),
        weeklyPresentations: input.weeklyPresentations,
        weeklyDiscoveryPresentations: input.weeklyDiscoveryPresentations,
      }),
    );
  } catch (cause) {
    return error("EVALUATION_FAILED", cause instanceof Error ? cause.message : "Eligibility evaluation failed");
  }
}
