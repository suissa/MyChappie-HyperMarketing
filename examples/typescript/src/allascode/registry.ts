import { discoverComplements } from "./actions/discover-complements.js";
import { evaluateOfferEligibility } from "./actions/evaluate-offer-eligibility.js";
import { recordPurchaseMarketingState } from "./actions/record-purchase-marketing-state.js";
import { selectNextBestOffer } from "./actions/select-next-best-offer.js";
import { updateOwnership } from "./actions/update-ownership.js";

export const canonicalLabels = [
  "Purchase.recordMarketingState",
  "Ownership.update",
  "Product.discoverComplements",
  "Offer.evaluateEligibility",
  "Marketing.selectNextBestOffer",
] as const;
export type CanonicalLabel = (typeof canonicalLabels)[number];

export const actionRegistry = {
  "Purchase.recordMarketingState": recordPurchaseMarketingState,
  "Ownership.update": updateOwnership,
  "Product.discoverComplements": discoverComplements,
  "Offer.evaluateEligibility": evaluateOfferEligibility,
  "Marketing.selectNextBestOffer": selectNextBestOffer,
} as const;

export function resolveAction<Label extends CanonicalLabel>(label: Label): (typeof actionRegistry)[Label] {
  return actionRegistry[label];
}
