import type {
  ConsumerId,
  DecisionId,
  FeedbackId,
  IntentId,
  MerchantId,
  OfferId,
  ProductId,
  PurchaseId,
} from "./brand.js";

export type Channel = "whatsapp" | "web" | "app" | "email" | "voice" | "other";
export type Modality = "text" | "image" | "audio" | "video" | "interactive";
export type Lifecycle = "durable" | "consumable" | "subscription" | "service" | "quantity_sensitive" | "unknown";
export type ActionFamily = "intent" | "complement_discovery" | "replenishment" | "baseline" | "bundle" | "discount" | "no_action";
export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface Intent {
  intentId: IntentId;
  productId?: ProductId;
  category?: string;
  status: "searching" | "paused" | "fulfilled" | "rejected";
  maxPriceMinor?: number;
  currency?: string;
  expiresAt?: string;
}

export interface ContactWindow {
  days: Weekday[];
  from: string;
  to: string;
  timezone: string;
}

export interface DemandContract {
  consumerId: ConsumerId;
  version: number;
  intents?: Intent[];
  allowedCategories?: string[];
  blockedCategories?: string[];
  channels: Channel[];
  modalities: Modality[];
  contactWindows?: ContactWindow[];
  discovery: {
    enabled: boolean;
    complementaryOnly: boolean;
    maxPresentationsPerWeek: number;
    recoveryEnabled?: boolean;
  };
  interruptionBudgetPerWeek?: number;
  selectiveDisclosure?: boolean;
  updatedAt?: string;
}

export interface Price {
  currency: string;
  amountMinor: number;
  originalAmountMinor?: number;
}

export interface OfferProposal {
  offerId: OfferId;
  merchantId: MerchantId;
  productId: ProductId;
  category: string;
  actionFamily: ActionFamily;
  price: Price;
  complementsProductId?: ProductId;
  complementConfidence?: number;
  merchantQuality?: number;
  counterofferSupported?: boolean;
  channel?: Channel;
  modality?: Modality;
  createdAt?: string;
  expiresAt: string;
  metadata?: Record<string, unknown>;
}

export interface Purchase {
  purchaseId: PurchaseId;
  consumerId: ConsumerId;
  productId: ProductId;
  quantity?: number;
  lifecycle: Lifecycle;
  replenishAfterDays?: number;
  activeUntil?: string;
  purchasedAt: string;
}

export interface ComplementRelation {
  sourceProductId: ProductId;
  targetProductId: ProductId;
  confidence: number;
  relation: "complement";
}

export type EligibilityReason =
  | "ALREADY_OWNED"
  | "BLOCKED_CATEGORY"
  | "EXPLICITLY_REJECTED"
  | "PRICE_NOT_ELIGIBLE"
  | "TIMING_NOT_ALLOWED"
  | "CHANNEL_NOT_ALLOWED"
  | "MODALITY_NOT_ALLOWED"
  | "INTERRUPTION_BUDGET_EXHAUSTED"
  | "DISCOVERY_BUDGET_EXHAUSTED"
  | "OFFER_EXPIRED"
  | "INVALID_OFFER"
  | "CONSTRAINT_NOT_SATISFIED";

export interface EligibilityResult {
  eligible: boolean;
  reasons: EligibilityReason[];
}

export type FeatureVector = readonly number[];

export interface Candidate {
  actionFamily: ActionFamily;
  offer?: OfferProposal;
  features: FeatureVector;
}

export interface Decision {
  decisionId: DecisionId;
  consumerId: ConsumerId;
  offerId?: OfferId;
  status: "present" | "reject" | "counteroffer" | "no_action";
  reasons?: string[];
  actionFamily?: ActionFamily;
  policyVersion: string;
  score?: number;
  propensity?: number;
  contextFeatureVersion?: string;
  createdAt: string;
}

export interface PersistedDecision {
  decision: Decision;
  features: number[];
}

export interface Feedback {
  feedbackId: FeedbackId;
  decisionId: DecisionId;
  consumerId: ConsumerId;
  offerId?: OfferId;
  type: "presented" | "accepted" | "rejected" | "ignored" | "purchased" | "dismissed" | "blocked_category" | "unsubscribed";
  reward?: number;
  rewardComponents?: Record<string, number>;
  timestamp: string;
}

export interface ArmModel {
  a: number[][];
  b: number[];
}

export interface BanditStateRecord {
  consumerId: ConsumerId;
  arms: Record<ActionFamily, ArmModel>;
  updatedAt: string;
}

export interface FrameworkConfig {
  storage:
    | { kind: "json"; path: string }
    | { kind: "database"; module: string; options?: Record<string, unknown> };
  decisioning: {
    policyVersion: string;
    alpha: number;
    safetyMargin: number;
  };
}
