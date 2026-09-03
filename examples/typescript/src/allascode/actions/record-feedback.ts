import type { FeedbackRecordResult, RecordFeedbackInput } from "../contracts.js";
import { error, ok, type BehaviorResult } from "../result.js";

export type RecordFeedbackError = "UNKNOWN_DECISION" | "CORRELATION_MISMATCH" | "FEEDBACK_RECORD_FAILED";

export function recordFeedback(
  input: RecordFeedbackInput,
): BehaviorResult<FeedbackRecordResult, RecordFeedbackError> {
  try {
    const duplicate = input.current.find((item) => item.feedbackId === input.feedback.feedbackId);
    if (duplicate) return ok({ entries: input.current, recorded: false, feedback: duplicate });

    const decision = input.decisions.find((item) => item.decision.decisionId === input.feedback.decisionId)?.decision;
    if (!decision) return error("UNKNOWN_DECISION", `Unknown decision ${input.feedback.decisionId}`);
    if (decision.consumerId !== input.feedback.consumerId) {
      return error("CORRELATION_MISMATCH", "Feedback consumer does not match decision consumer", false);
    }
    if (input.feedback.offerId && decision.offerId && input.feedback.offerId !== decision.offerId) {
      return error("CORRELATION_MISMATCH", "Feedback offer does not match decision offer", false);
    }

    return ok({ entries: [...input.current, input.feedback], recorded: true, feedback: input.feedback });
  } catch (cause) {
    return error("FEEDBACK_RECORD_FAILED", cause instanceof Error ? cause.message : "Unable to record feedback");
  }
}
