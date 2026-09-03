import { selectConservative } from "../../core/linucb.js";
import type { SelectNextBestOfferInput, SelectedCandidate } from "../contracts.js";
import { banditScore } from "../semantic.js";
import { error, ok, type BehaviorResult } from "../result.js";

export type SelectOfferError = "NO_CANDIDATES" | "INVALID_POLICY_STATE" | "SELECTION_FAILED";

export function selectNextBestOffer(
  input: SelectNextBestOfferInput,
): BehaviorResult<SelectedCandidate, SelectOfferError> {
  if (input.candidates.length === 0) return error("NO_CANDIDATES", "At least one prequalified candidate is required");

  try {
    const selected = selectConservative(
      input.banditState,
      input.candidates,
      input.alpha,
      input.safetyMargin,
    );
    const candidate = input.candidates.find((item) => item === selected.candidate);
    if (!candidate) return error("INVALID_POLICY_STATE", "Bandit returned a candidate outside the prequalified set");
    return ok({ candidate, score: banditScore(selected.score) });
  } catch (cause) {
    return error("SELECTION_FAILED", cause instanceof Error ? cause.message : "Candidate selection failed");
  }
}
