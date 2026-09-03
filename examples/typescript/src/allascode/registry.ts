import { evaluateOfferEligibility } from "./actions/evaluate-offer-eligibility.js";
import { selectNextBestOffer } from "./actions/select-next-best-offer.js";

export const canonicalLabels = ["Offer.evaluateEligibility", "Marketing.selectNextBestOffer"] as const;
export type CanonicalLabel = (typeof canonicalLabels)[number];

export const actionRegistry = {
  "Offer.evaluateEligibility": evaluateOfferEligibility,
  "Marketing.selectNextBestOffer": selectNextBestOffer,
} as const;

export function resolveAction<Label extends CanonicalLabel>(label: Label): (typeof actionRegistry)[Label] {
  return actionRegistry[label];
}
