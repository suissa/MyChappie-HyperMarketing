import type { OwnershipEntry, OwnershipUpdate, UpdateOwnershipInput } from "../contracts.js";
import { purchaseCount } from "../semantic.js";
import { error, ok, type BehaviorResult } from "../result.js";

export type UpdateOwnershipError = "INVALID_STATE" | "OWNERSHIP_UPDATE_FAILED";

export function updateOwnership(
  input: UpdateOwnershipInput,
): BehaviorResult<OwnershipUpdate, UpdateOwnershipError> {
  try {
    const state = input.marketingState;
    const existingIndex = input.current.findIndex(
      (entry) => entry.consumerId === state.consumerId && entry.productId === state.productId,
    );
    const existing = existingIndex >= 0 ? input.current[existingIndex] : undefined;

    const updated: OwnershipEntry = {
      consumerId: state.consumerId,
      productId: state.productId,
      latestPurchaseId: state.purchaseId,
      lifecycle: state.lifecycle,
      firstPurchasedAt: existing?.firstPurchasedAt ?? state.purchasedAt,
      lastPurchasedAt: state.purchasedAt,
      purchaseCount: purchaseCount((existing?.purchaseCount ?? 0) + 1),
      marketingSuppressed: state.suppressMarketing,
      complementSourceEligible: state.complementSourceEligible,
      ...(state.suppressionUntil ? { suppressionUntil: state.suppressionUntil } : {}),
      ...(state.replenishmentEligibleAt ? { replenishmentEligibleAt: state.replenishmentEligibleAt } : {}),
    };

    const entries = [...input.current];
    if (existingIndex >= 0) entries[existingIndex] = updated;
    else entries.push(updated);

    return ok({ entries, updated });
  } catch (cause) {
    return error("OWNERSHIP_UPDATE_FAILED", cause instanceof Error ? cause.message : "Unable to update ownership");
  }
}
