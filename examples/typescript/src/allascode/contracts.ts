import type { BanditStateRecord, Candidate, DemandContract, EligibilityResult, OfferProposal, Purchase } from "../domain/types.js";
import type { BanditScore, ExplorationCoefficient, ISODateTime, PresentationCount, SafetyMargin } from "./semantic.js";

export interface EvaluateOfferEligibilityInput {
  readonly contract: DemandContract;
  readonly offer: OfferProposal;
  readonly purchases: readonly Purchase[];
  readonly now: ISODateTime;
  readonly weeklyPresentations: PresentationCount;
  readonly weeklyDiscoveryPresentations: PresentationCount;
}

export interface PrequalifiedCandidate extends Candidate {
  readonly eligibility: EligibilityResult & { readonly eligible: true };
}

export interface SelectNextBestOfferInput {
  readonly banditState: BanditStateRecord;
  readonly candidates: readonly PrequalifiedCandidate[];
  readonly alpha: ExplorationCoefficient;
  readonly safetyMargin: SafetyMargin;
}

export interface SelectedCandidate {
  readonly candidate: PrequalifiedCandidate;
  readonly score: BanditScore;
}
