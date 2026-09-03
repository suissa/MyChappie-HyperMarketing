import type { ComplementRelation, OfferProposal, Purchase } from "../domain/types.js";

export function findComplementOffers(
  purchases: readonly Purchase[],
  relations: readonly ComplementRelation[],
  offers: readonly OfferProposal[],
): OfferProposal[] {
  const owned = new Set(purchases.map((purchase) => purchase.productId));
  const relationsByTarget = new Map<string, ComplementRelation>();

  for (const relation of relations) {
    if (!owned.has(relation.sourceProductId)) continue;
    const previous = relationsByTarget.get(relation.targetProductId);
    if (!previous || relation.confidence > previous.confidence) {
      relationsByTarget.set(relation.targetProductId, relation);
    }
  }

  const output: OfferProposal[] = [];
  for (const offer of offers) {
    const relation = relationsByTarget.get(offer.productId);
    if (!relation) continue;
    output.push({
      ...offer,
      actionFamily: "complement_discovery",
      complementsProductId: relation.sourceProductId,
      complementConfidence: relation.confidence,
    });
  }
  return output;
}
