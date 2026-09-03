declare const semanticNominal: unique symbol;

export type Semantic<T, Name extends string> = T & {
  readonly [semanticNominal]: Name;
};

export type ISODateTime = Semantic<string, "ISODateTime">;
export type PresentationCount = Semantic<number, "PresentationCount">;
export type ExplorationCoefficient = Semantic<number, "ExplorationCoefficient">;
export type SafetyMargin = Semantic<number, "SafetyMargin">;
export type BanditScore = Semantic<number, "BanditScore">;

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

export const banditScore = (value: number): BanditScore => finite(value, "BanditScore") as BanditScore;
