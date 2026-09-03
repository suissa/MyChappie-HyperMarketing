import type { RecordPurchaseMarketingStateInput, PurchaseMarketingState } from "../contracts.js";
import { isoDateTime, marketingStateVersion } from "../semantic.js";
import { error, ok, type BehaviorResult } from "../result.js";

export type RecordPurchaseMarketingStateError = "INVALID_PURCHASE" | "STATE_DERIVATION_FAILED";

function addDays(value: string, days: number): string {
  return new Date(Date.parse(value) + days * 86_400_000).toISOString();
}

export function recordPurchaseMarketingState(
  input: RecordPurchaseMarketingStateInput,
): BehaviorResult<PurchaseMarketingState, RecordPurchaseMarketingStateError> {
  try {
    const { purchase } = input;
    if (!Number.isFinite(Date.parse(purchase.purchasedAt))) {
      return error("INVALID_PURCHASE", "purchase.purchasedAt must be a valid ISO date");
    }
    if (purchase.replenishAfterDays !== undefined && (!Number.isFinite(purchase.replenishAfterDays) || purchase.replenishAfterDays <= 0)) {
      return error("INVALID_PURCHASE", "replenishAfterDays must be positive when provided");
    }

    const now = Date.parse(input.now);
    let suppressMarketing = false;
    let suppressionUntil: ReturnType<typeof isoDateTime> | undefined;
    let replenishmentEligibleAt: ReturnType<typeof isoDateTime> | undefined;
    let activeUntil: ReturnType<typeof isoDateTime> | undefined;
    let complementSourceEligible = purchase.lifecycle !== "unknown";

    if (purchase.activeUntil) {
      activeUntil = isoDateTime(purchase.activeUntil);
    }

    switch (purchase.lifecycle) {
      case "durable":
        suppressMarketing = true;
        break;
      case "subscription":
        if (activeUntil) {
          suppressionUntil = activeUntil;
          suppressMarketing = Date.parse(activeUntil) > now;
          complementSourceEligible = suppressMarketing;
        } else {
          suppressMarketing = true;
        }
        break;
      case "consumable":
      case "quantity_sensitive":
        if (purchase.replenishAfterDays !== undefined) {
          replenishmentEligibleAt = isoDateTime(addDays(purchase.purchasedAt, purchase.replenishAfterDays));
          suppressionUntil = replenishmentEligibleAt;
          suppressMarketing = Date.parse(replenishmentEligibleAt) > now;
        }
        break;
      case "service":
        if (activeUntil) {
          suppressionUntil = activeUntil;
          suppressMarketing = Date.parse(activeUntil) > now;
          complementSourceEligible = suppressMarketing;
        } else {
          complementSourceEligible = false;
        }
        break;
      case "unknown":
        complementSourceEligible = false;
        break;
    }

    const state: PurchaseMarketingState = {
      version: marketingStateVersion(1),
      purchaseId: purchase.purchaseId,
      consumerId: purchase.consumerId,
      productId: purchase.productId,
      lifecycle: purchase.lifecycle,
      purchasedAt: isoDateTime(purchase.purchasedAt),
      suppressMarketing,
      complementSourceEligible,
      ...(suppressionUntil ? { suppressionUntil } : {}),
      ...(replenishmentEligibleAt ? { replenishmentEligibleAt } : {}),
      ...(activeUntil ? { activeUntil } : {}),
    };

    return ok(state);
  } catch (cause) {
    return error("STATE_DERIVATION_FAILED", cause instanceof Error ? cause.message : "Unable to derive marketing state");
  }
}
