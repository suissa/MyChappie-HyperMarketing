import assert from "node:assert/strict";
import test from "node:test";
import { consumerId, decisionId, feedbackId, merchantId, offerId, productId, purchaseId } from "../src/domain/brand.js";
import type { Feedback, OfferProposal, PersistedDecision, Purchase } from "../src/domain/types.js";
import { createBanditState } from "../src/core/linucb.js";
import {
  calculateReward,
  generateRecoveryCandidates,
  isoDateTime,
  recordFeedback,
  recordPurchaseMarketingState,
  updateBandit,
  updateOwnership,
} from "../src/allascode/index.js";

const consumer = consumerId("consumer-learning");
const knownProduct = productId("known-product");
const decision = decisionId("decision-learning");
const offer = offerId("offer-learning");

const persistedDecision: PersistedDecision = {
  decision: {
    decisionId: decision,
    consumerId: consumer,
    offerId: offer,
    status: "present",
    actionFamily: "complement_discovery",
    policyVersion: "test",
    createdAt: "2026-09-03T12:00:00.000Z",
  },
  features: [1, 0, 1, 0.5, 0, 0, 0.5, 0],
};

const rejectedFeedback: Feedback = {
  feedbackId: feedbackId("feedback-rejected"),
  decisionId: decision,
  consumerId: consumer,
  offerId: offer,
  type: "rejected",
  timestamp: "2026-09-03T12:01:00.000Z",
};

test("feedback recording validates correlation and is idempotent by feedback id", () => {
  const first = recordFeedback({ current: [], decisions: [persistedDecision], feedback: rejectedFeedback });
  assert.equal(first.event, "Ok");
  if (first.event !== "Ok") return;
  assert.equal(first.value.recorded, true);

  const duplicate = recordFeedback({ current: first.value.entries, decisions: [persistedDecision], feedback: rejectedFeedback });
  assert.equal(duplicate.event, "Ok");
  if (duplicate.event === "Ok") {
    assert.equal(duplicate.value.recorded, false);
    assert.equal(duplicate.value.entries.length, 1);
  }
});

test("reward calculation converts rejection into bounded negative learning signal", () => {
  const result = calculateReward({ feedback: rejectedFeedback });
  assert.equal(result.event, "Ok");
  if (result.event === "Ok") assert.equal(Number(result.value), -0.4);
});

test("bandit update consumes semantic reward and decision feature vector", () => {
  const reward = calculateReward({ feedback: rejectedFeedback });
  assert.equal(reward.event, "Ok");
  if (reward.event !== "Ok") return;

  const state = createBanditState(consumer, new Date("2026-09-03T12:00:00.000Z"));
  const result = updateBandit({
    state,
    actionFamily: "complement_discovery",
    features: persistedDecision.features,
    reward: reward.value,
    now: isoDateTime("2026-09-03T12:01:00.000Z"),
  });
  assert.equal(result.event, "Ok");
  if (result.event === "Ok") {
    assert.notDeepEqual(result.value.arms.complement_discovery.b, state.arms.complement_discovery.b);
  }
});

test("recovery after rejection offers only known-product recovery arms plus no_action", () => {
  const purchase: Purchase = {
    purchaseId: purchaseId("purchase-known"),
    consumerId: consumer,
    productId: knownProduct,
    lifecycle: "consumable",
    replenishAfterDays: 7,
    purchasedAt: "2026-09-01T00:00:00.000Z",
  };
  const marketingState = recordPurchaseMarketingState({ purchase, now: isoDateTime("2026-09-03T00:00:00.000Z") });
  assert.equal(marketingState.event, "Ok");
  if (marketingState.event !== "Ok") return;
  const ownership = updateOwnership({ current: [], marketingState: marketingState.value });
  assert.equal(ownership.event, "Ok");
  if (ownership.event !== "Ok") return;

  const baseline: OfferProposal = {
    offerId: offerId("baseline-known"),
    merchantId: merchantId("merchant-learning"),
    productId: knownProduct,
    category: "grocery",
    actionFamily: "baseline",
    price: { currency: "BRL", amountMinor: 1000 },
    expiresAt: "2026-10-01T00:00:00.000Z",
  };
  const discount: OfferProposal = { ...baseline, offerId: offerId("discount-known"), actionFamily: "discount", price: { currency: "BRL", amountMinor: 900 } };
  const unrelated: OfferProposal = { ...baseline, offerId: offerId("discount-unrelated"), productId: productId("unrelated"), actionFamily: "discount" };

  const result = generateRecoveryCandidates({
    feedback: rejectedFeedback,
    ownership: ownership.value.entries,
    offers: [baseline, discount, unrelated],
  });
  assert.equal(result.event, "Ok");
  if (result.event === "Ok") {
    assert.equal(result.value.triggered, true);
    assert.deepEqual(result.value.candidates.map((item) => item.actionFamily).sort(), ["baseline", "discount", "no_action"].sort());
  }
});
