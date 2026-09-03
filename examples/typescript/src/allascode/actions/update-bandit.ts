import { FEATURE_DIMENSION, updateBandit as updateCoreBandit } from "../../core/linucb.js";
import type { BanditStateRecord } from "../../domain/types.js";
import type { UpdateBanditInput } from "../contracts.js";
import { error, ok, type BehaviorResult } from "../result.js";

export type UpdateBanditError = "INVALID_FEATURE_VECTOR" | "BANDIT_UPDATE_FAILED";

export function updateBandit(
  input: UpdateBanditInput,
): BehaviorResult<BanditStateRecord, UpdateBanditError> {
  try {
    if (input.features.length !== FEATURE_DIMENSION || input.features.some((value) => !Number.isFinite(value))) {
      return error("INVALID_FEATURE_VECTOR", `Expected ${FEATURE_DIMENSION} finite contextual features`, false);
    }
    return ok(updateCoreBandit(
      input.state,
      input.actionFamily,
      input.features,
      input.reward,
      new Date(input.now),
    ));
  } catch (cause) {
    return error("BANDIT_UPDATE_FAILED", cause instanceof Error ? cause.message : "Unable to update bandit");
  }
}
