import assert from "node:assert/strict";
import test from "node:test";
import { createBanditState } from "../src/core/linucb.js";
import { consumerId, merchantId, offerId, productId, purchaseId } from "../src/domain/brand.js";
import type { DemandContract, OfferProposal, Purchase } from "../src/domain/types.js";
import {
  evaluateOfferEligibility,
  explorationCoefficient,
  isoDateTime,
  presentationCount,
  safetyMargin,
  selectNextBestOffer,
  type PrequalifiedCandidate,
} from "../src/allascode/index.js";

const consumer = consumerId("consumer-allascode");
const consoleProduct = productId("console-1");
const headsetProduct = productId("headset-1");

const contract: DemandContract = {
  consumerId: consumer,
  version: 1,
  channels: ["whatsapp"],
  modalities: ["text"],
  discovery: { enabled: true, complementaryOnly: true, maxPresentationsPerWeek: 2 },
};

const purchase: Purchase = {
  purchaseId: purchaseId("purchase-1"),
  consumerId: consumer,
  productId: consoleProduct,
  lifecycle: "durable",
  purchasedAt: "2026-09-01T12:00:00.000Z",
};

function offer(product: ReturnType<typeof productId>, family: OfferProposal["actionFamily"]): OfferProposal {
  return {
    offerId: offerId(`offer-${product}-${family}`),
    merchantId: merchantId("merchant-1"),
    productId: product,
    category: "gaming",
    actionFamily: family,
    price: { currency: "BRL", amountMinor: 30000 },
    channel: "whatsapp",
    modality: "text",
    expiresAt: "2026-10-01T00:00:00.000Z",
  };
}

test("AllasCode atomic eligibility emits Ok with business rejection for owned durable product", () => {
  const result = evaluateOfferEligibility({
    contract,
    offer: offer(consoleProduct, "baseline"),
    purchases: [purchase],
    now: isoDateTime("2026-09-03T12:00:00.000Z"),
    weeklyPresentations: presentationCount(0),
    weeklyDiscoveryPresentations: presentationCount(0),
  });

  assert.equal(result.event, "Ok");
  if (result.event === "Ok") {
    assert.equal(result.value.eligible, false);
    assert.ok(result.value.reasons.includes("ALREADY_OWNED"));
  }
});

test("bandit action accepts only prequalified candidates and can select no_action", () => {
  const eligible = { eligible: true as const, reasons: [] };
  const noAction: PrequalifiedCandidate = { actionFamily: "no_action", features: [0, 0, 0, 0, 0, 0, 0, 0], eligibility: eligible };
  const discovery: PrequalifiedCandidate = { actionFamily: "complement_discovery", offer: offer(headsetProduct, "complement_discovery"), features: [0, 0, 0, 0, 0, 0, 0, 0], eligibility: eligible };

  const result = selectNextBestOffer({
    banditState: createBanditState(consumer, new Date("2026-09-03T12:00:00.000Z")),
    candidates: [noAction, discovery],
    alpha: explorationCoefficient(0),
    safetyMargin: safetyMargin(0),
  });

  assert.equal(result.event, "Ok");
  if (result.event === "Ok") assert.ok(["no_action", "complement_discovery"].includes(result.value.candidate.actionFamily));
});
