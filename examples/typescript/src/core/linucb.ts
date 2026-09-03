import type { ConsumerId } from "../domain/brand.js";
import type { ActionFamily, ArmModel, BanditStateRecord, Candidate, FeatureVector } from "../domain/types.js";

export const FEATURE_DIMENSION = 8;
export const FEATURE_VERSION = "ahmp-context/0.1";

export const ACTION_FAMILIES: readonly ActionFamily[] = [
  "intent",
  "complement_discovery",
  "replenishment",
  "baseline",
  "bundle",
  "discount",
  "no_action",
];

function identity(size: number): number[][] {
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, column) => (row === column ? 1 : 0)),
  );
}

function zeroes(size: number): number[] {
  return Array.from({ length: size }, () => 0);
}

function defaultArm(): ArmModel {
  return { a: identity(FEATURE_DIMENSION), b: zeroes(FEATURE_DIMENSION) };
}

export function createBanditState(consumerId: ConsumerId, now: Date): BanditStateRecord {
  return {
    consumerId,
    arms: Object.fromEntries(ACTION_FAMILIES.map((family) => [family, defaultArm()])) as Record<ActionFamily, ArmModel>,
    updatedAt: now.toISOString(),
  };
}

function inverse(input: readonly (readonly number[])[]): number[][] {
  const n = input.length;
  const augmented = input.map((row, index) => [
    ...row,
    ...Array.from({ length: n }, (_, column) => (index === column ? 1 : 0)),
  ]);

  for (let column = 0; column < n; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < n; row += 1) {
      if (Math.abs(augmented[row]![column]!) > Math.abs(augmented[pivot]![column]!)) pivot = row;
    }
    [augmented[column], augmented[pivot]] = [augmented[pivot]!, augmented[column]!];
    const divisor = augmented[column]![column]!;
    if (Math.abs(divisor) < 1e-12) throw new Error("Bandit covariance matrix is singular");
    for (let j = 0; j < 2 * n; j += 1) augmented[column]![j] = augmented[column]![j]! / divisor;
    for (let row = 0; row < n; row += 1) {
      if (row === column) continue;
      const factor = augmented[row]![column]!;
      for (let j = 0; j < 2 * n; j += 1) {
        augmented[row]![j] = augmented[row]![j]! - factor * augmented[column]![j]!;
      }
    }
  }

  return augmented.map((row) => row.slice(n));
}

function matrixVector(matrix: readonly (readonly number[])[], vector: FeatureVector): number[] {
  return matrix.map((row) => row.reduce((sum, value, index) => sum + value * (vector[index] ?? 0), 0));
}

function dot(a: FeatureVector, b: FeatureVector): number {
  return a.reduce((sum, value, index) => sum + value * (b[index] ?? 0), 0);
}

export function scoreCandidate(state: BanditStateRecord, candidate: Candidate, alpha: number): number {
  if (candidate.features.length !== FEATURE_DIMENSION) {
    throw new Error(`Expected ${FEATURE_DIMENSION} contextual features`);
  }
  const arm = state.arms[candidate.actionFamily];
  const aInverse = inverse(arm.a);
  const theta = matrixVector(aInverse, arm.b);
  const mean = dot(theta, candidate.features);
  const uncertainty = Math.sqrt(Math.max(0, dot(candidate.features, matrixVector(aInverse, candidate.features))));
  return mean + alpha * uncertainty;
}

export interface Selection {
  candidate: Candidate;
  score: number;
}

export function selectConservative(
  state: BanditStateRecord,
  candidates: readonly Candidate[],
  alpha: number,
  safetyMargin: number,
): Selection {
  if (candidates.length === 0) throw new Error("At least one candidate is required");
  const scored = candidates
    .map((candidate) => ({ candidate, score: scoreCandidate(state, candidate, alpha) }))
    .sort((a, b) => b.score - a.score);
  const best = scored[0]!;

  if (best.candidate.actionFamily !== "complement_discovery") return best;

  const baseline = scored
    .filter(({ candidate }) => ["baseline", "replenishment", "no_action"].includes(candidate.actionFamily))
    .sort((a, b) => b.score - a.score)[0];

  if (baseline && best.score < baseline.score - safetyMargin) return baseline;
  return best;
}

export function updateBandit(
  state: BanditStateRecord,
  actionFamily: ActionFamily,
  features: FeatureVector,
  reward: number,
  now: Date,
): BanditStateRecord {
  const copy = structuredClone(state);
  const arm = copy.arms[actionFamily];

  for (let row = 0; row < FEATURE_DIMENSION; row += 1) {
    arm.b[row] = arm.b[row]! + reward * (features[row] ?? 0);
    for (let column = 0; column < FEATURE_DIMENSION; column += 1) {
      arm.a[row]![column] = arm.a[row]![column]! + (features[row] ?? 0) * (features[column] ?? 0);
    }
  }

  copy.updatedAt = now.toISOString();
  return copy;
}
