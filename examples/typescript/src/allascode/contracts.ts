import type { ConsumerId, ProductId, PurchaseId } from "../domain/brand.js";
import type {
  BanditStateRecord,
  Candidate,
  ComplementRelation,
  DemandContract,
  EligibilityResult,
  Lifecycle,
  OfferProposal,
  Purchase,
} from "../domain/types.js";
import type {
  BanditScore,
  ComplementConfidence,
  ExplorationCoefficient,
  ISODateTime,
  MarketingStateVersion,
  PresentationCount,
  PurchaseCount,
  SafetyMargin,
} from "./semantic.js";

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

export interface PurchaseMarketingState {
  readonly version: MarketingStateVersion;
  readonly purchaseId: PurchaseId;
  readonly consumerId: ConsumerId;
  readonly productId: ProductId;
  readonly lifecycle: Lifecycle;
  readonly purchasedAt: ISODateTime;
  readonly suppressMarketing: boolean;
  readonly suppressionUntil?: ISODateTime;
  readonly replenishmentEligibleAt?: ISODateTime;
  readonly activeUntil?: ISODateTime;
  readonly complementSourceEligible: boolean;
}

export interface RecordPurchaseMarketingStateInput {
  readonly purchase: Purchase;
  readonly now: ISODateTime;
}

export interface OwnershipEntry {
  readonly consumerId: ConsumerId;
  readonly productId: ProductId;
  readonly latestPurchaseId: PurchaseId;
  readonly lifecycle: Lifecycle;
  readonly firstPurchasedAt: ISODateTime;
  readonly lastPurchasedAt: ISODateTime;
  readonly purchaseCount: PurchaseCount;
  readonly marketingSuppressed: boolean;
  readonly suppressionUntil?: ISODateTime;
  readonly replenishmentEligibleAt?: ISODateTime;
  readonly complementSourceEligible: boolean;
}

export interface UpdateOwnershipInput {
  readonly current: readonly OwnershipEntry[];
  readonly marketingState: PurchaseMarketingState;
}

export interface OwnershipUpdate {
  readonly entries: readonly OwnershipEntry[];
  readonly updated: OwnershipEntry;
}

export interface DiscoverComplementsInput {
  readonly consumerId: ConsumerId;
  readonly ownership: readonly OwnershipEntry[];
  readonly relations: readonly ComplementRelation[];
  readonly offers: readonly OfferProposal[];
  readonly minimumConfidence: ComplementConfidence;
}

export interface DiscoveredComplement {
  readonly offer: OfferProposal;
  readonly sourceProductId: ProductId;
  readonly targetProductId: ProductId;
  readonly confidence: ComplementConfidence;
}
