import type { GenerateRecoveryCandidatesInput, RecoveryCandidateSet, RecoveryCandidateSeed } from "../contracts.js";
import { error, ok, type BehaviorResult } from "../result.js";

export type GenerateRecoveryCandidatesError = "INVALID_INPUT" | "RECOVERY_GENERATION_FAILED";

const recoverableFamilies = new Set(["baseline", "replenishment", "bundle", "discount"] as const);

export function generateRecoveryCandidates(
  input: GenerateRecoveryCandidatesInput,
): BehaviorResult<RecoveryCandidateSet, GenerateRecoveryCandidatesError> {
  try {
    const triggered = input.feedback.type === "rejected" || input.feedback.type === "dismissed" || input.feedback.type === "ignored";
    const noAction: RecoveryCandidateSeed = { actionFamily: "no_action", source: "no_action" };
    if (!triggered) return ok({ triggered: false, candidates: [noAction] });

    const knownProducts = new Set(
      [...input.ownership]
        .filter((entry) => entry.consumerId === input.feedback.consumerId)
        .sort((a, b) => Number(b.purchaseCount) - Number(a.purchaseCount))
        .map((entry) => entry.productId),
    );

    const candidates: RecoveryCandidateSeed[] = input.offers
      .filter((offer) => knownProducts.has(offer.productId) && recoverableFamilies.has(offer.actionFamily as "baseline" | "replenishment" | "bundle" | "discount"))
      .map((offer) => ({
        actionFamily: offer.actionFamily as "baseline" | "replenishment" | "bundle" | "discount",
        offer,
        source: "known_purchase" as const,
      }));

    candidates.push(noAction);
    return ok({ triggered: true, candidates });
  } catch (cause) {
    return error("RECOVERY_GENERATION_FAILED", cause instanceof Error ? cause.message : "Unable to generate recovery candidates");
  }
}
