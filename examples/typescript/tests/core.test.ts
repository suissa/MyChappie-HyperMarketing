import assert from "node:assert/strict";
import test from "node:test";
import {
  consumerId,
  merchantId,
  offerId,
  productId,
  purchaseId,
} from "../src/domain/brand.js";
import type { Candidate, DemandContract, OfferProposal, Purchase } from "../src/domain/types.js";
import { evaluateEligibility } from "../src/core/eligibility.js";
import { createBanditState, scoreCandidate, updateBandit } from "../src/core/linucb.js";

const contract: DemandContract = {
  consumerId: consumerId("consumer-1"),
  version: 1,
  allowedCategories: ["gaming"],
  blockedCategories: [],
  channels: ["whatsapp"],
  modalities: ["text"],
  discovery: {
    enabled: true,
    complementaryOnly: true,
    maxPresentationsPerWeek: 2,
  },
  interruptionBudgetPerWeek: 3,
};

const consoleOffer: OfferProposal = {
  offerId: offerId("offer-console"),
  merchantId: merchantId("merchant-1"),
  productId: productId("console-1"),
  category: "gaming",
  actionFamily: "baseline",
  price: { currency: "BRL", amountMinor: 300000 },
  channel: "whatsapp",
  modality: "text",
  expiresAt: "2030-01-01T00:00:00Z",
};

const purchase: Purchase = {
  purchaseId: purchaseId("purchase-1"),
  consumerId: contract.consumerId,
  productId: consoleOffer.productId,
  lifecycle: "durable",
  purchasedAt: "2026-09-01T00:00:00Z",
};

test("durable ownership suppresses identical acquisition offer", () => {
  const result = evaluateEligibility({
    contract,
    offer: consoleOffer,
    purchases: [purchase],
    now: new Date("2026-09-03T12:00:00Z"),
    weeklyPresentations: 0,
    weeklyDiscoveryPresentations: 0,
  });
  assert.equal(result.eligible, false);
  assert.ok(result.reasons.includes("ALREADY_OWNED"));
});

test("blocked category is a hard constraint", () => {
  const result = evaluateEligibility({
    contract: { ...contract, blockedCategories: ["gaming"] },
    offer: { ...consoleOffer, productId: productId("new-console") },
    purchases: [],
    now: new Date("2026-09-03T12:00:00Z"),
    weeklyPresentations: 0,
    weeklyDiscoveryPresentations: 0,
  });
  assert.equal(result.eligible, false);
  assert.ok(result.reasons.includes("BLOCKED_CATEGORY"));
});

test("negative feedback lowers the learned mean for the correlated action", () => {
  const state = createBanditState(contract.consumerId, new Date("2026-09-03T00:00:00Z"));
  const candidate: Candidate = {
    actionFamily: "complement_discovery",
    features: [1, 0, 1, 0.5, 0, 0, 0.8, 0],
  };
  const before = scoreCandidate(state, candidate, 0);
  const updated = updateBandit(
    state,
    "complement_discovery",
    candidate.features,
    -0.5,
    new Date("2026-09-03T01:00:00Z"),
  );
  const after = scoreCandidate(updated, candidate, 0);
  assert.ok(after < before);
});
