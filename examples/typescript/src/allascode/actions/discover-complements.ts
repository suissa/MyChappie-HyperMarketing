import { findComplementOffers } from "../../core/complements.js";
import type { Purchase } from "../../domain/types.js";
import type { DiscoverComplementsInput, DiscoveredComplement } from "../contracts.js";
import { complementConfidence } from "../semantic.js";
import { error, ok, type BehaviorResult } from "../result.js";

export type DiscoverComplementsError = "INVALID_INPUT" | "DISCOVERY_FAILED";

export function discoverComplements(
  input: DiscoverComplementsInput,
): BehaviorResult<readonly DiscoveredComplement[], DiscoverComplementsError> {
  try {
    const sourceEntries = input.ownership.filter(
      (entry) => entry.consumerId === input.consumerId && entry.complementSourceEligible,
    );
    if (sourceEntries.length === 0) return ok([]);

    const purchases: Purchase[] = sourceEntries.map((entry) => ({
      purchaseId: entry.latestPurchaseId,
      consumerId: entry.consumerId,
      productId: entry.productId,
      lifecycle: entry.lifecycle,
      purchasedAt: entry.lastPurchasedAt,
    }));

    const relations = input.relations.filter((relation) => relation.confidence >= input.minimumConfidence);
    const ownedSuppressed = new Set(
      input.ownership
        .filter((entry) => entry.consumerId === input.consumerId && entry.marketingSuppressed)
        .map((entry) => entry.productId),
    );

    const discoveredOffers = findComplementOffers(purchases, relations, input.offers).filter(
      (offer) => !ownedSuppressed.has(offer.productId),
    );

    const output: DiscoveredComplement[] = discoveredOffers.flatMap((offer) => {
      const sourceProductId = offer.complementsProductId;
      if (!sourceProductId) return [];
      const relation = relations.find(
        (item) => item.sourceProductId === sourceProductId && item.targetProductId === offer.productId,
      );
      if (!relation) return [];
      return [{
        offer,
        sourceProductId,
        targetProductId: offer.productId,
        confidence: complementConfidence(relation.confidence),
      }];
    });

    output.sort((a, b) => Number(b.confidence) - Number(a.confidence));
    return ok(output);
  } catch (cause) {
    return error("DISCOVERY_FAILED", cause instanceof Error ? cause.message : "Unable to discover complements");
  }
}
