declare const semanticNominal: unique symbol;

export type Semantic<T, Name extends string> = T & {
  readonly [semanticNominal]: Name;
};

export type ISODateTime = Semantic<string, "ISODateTime">;
export type PresentationCount = Semantic<number, "PresentationCount">;
export type ExplorationCoefficient = Semantic<number, "ExplorationCoefficient">;
export type SafetyMargin = Semantic<number, "SafetyMargin">;
export type BanditScore = Semantic<number, "BanditScore">;
export type MarketingStateVersion = Semantic<number, "MarketingStateVersion">;
export type PurchaseCount = Semantic<number, "PurchaseCount">;
export type ComplementConfidence = Semantic<number, "ComplementConfidence">;
export type RewardValue = Semantic<number, "RewardValue">;

function finite(value: number, name: string): number {
  if (!Number.isFinite(value)) throw new Error(`${name} must be finite`);
  return value;
}

export function isoDateTime(value: string): ISODateTime {
  if (!Number.isFinite(Date.parse(value))) throw new Error("ISODateTime must be parseable");
  return value as ISODateTime;
}

export function presentationCount(value: number): PresentationCount {
  if (!Number.isInteger(value) || value < 0) throw new Error("PresentationCount must be a non-negative integer");
  return value as PresentationCount;
}

export function explorationCoefficient(value: number): ExplorationCoefficient {
  finite(value, "ExplorationCoefficient");
  if (value < 0) throw new Error("ExplorationCoefficient cannot be negative");
  return value as ExplorationCoefficient;
}

export function safetyMargin(value: number): SafetyMargin {
  finite(value, "SafetyMargin");
  if (value < 0) throw new Error("SafetyMargin cannot be negative");
  return value as SafetyMargin;
}

export function marketingStateVersion(value: number): MarketingStateVersion {
  if (!Number.isInteger(value) || value < 1) throw new Error("MarketingStateVersion must be a positive integer");
  return value as MarketingStateVersion;
}

export function purchaseCount(value: number): PurchaseCount {
  if (!Number.isInteger(value) || value < 1) throw new Error("PurchaseCount must be a positive integer");
  return value as PurchaseCount;
}

export function complementConfidence(value: number): ComplementConfidence {
  finite(value, "ComplementConfidence");
  if (value < 0 || value > 1) throw new Error("ComplementConfidence must be between 0 and 1");
  return value as ComplementConfidence;
}

export function rewardValue(value: number): RewardValue {
  finite(value, "RewardValue");
  if (value < -1 || value > 1) throw new Error("RewardValue must be between -1 and 1");
  return value as RewardValue;
}

export const banditScore = (value: number): BanditScore => finite(value, "BanditScore") as BanditScore;
