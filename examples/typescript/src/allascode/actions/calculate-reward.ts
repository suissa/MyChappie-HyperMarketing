import type { CalculateRewardInput } from "../contracts.js";
import { rewardValue, type RewardValue } from "../semantic.js";
import { error, ok, type BehaviorResult } from "../result.js";

export type CalculateRewardError = "INVALID_REWARD" | "REWARD_CALCULATION_FAILED";

const defaultRewards = {
  purchased: 1,
  accepted: 0.6,
  presented: 0,
  ignored: -0.2,
  dismissed: -0.3,
  rejected: -0.4,
  blocked_category: -1,
  unsubscribed: -1,
} as const;

export function calculateReward(
  input: CalculateRewardInput,
): BehaviorResult<RewardValue, CalculateRewardError> {
  try {
    const raw = input.feedback.reward ?? defaultRewards[input.feedback.type];
    return ok(rewardValue(raw));
  } catch (cause) {
    return error("INVALID_REWARD", cause instanceof Error ? cause.message : "Reward must be between -1 and 1", false);
  }
}
