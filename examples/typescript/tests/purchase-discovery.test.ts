import assert from "node:assert/strict";
import test from "node:test";
import { consumerId, merchantId, offerId, productId, purchaseId } from "../src/domain/brand.js";
import type { ComplementRelation, OfferProposal, Purchase } from "../src/domain/types.js";
import {
  complementConfidence,
  discoverComplements,
  isoDateTime,
  recordPurchaseMarketingState,
  updateOwnership,
} from "../src/allascode/index.js";

const consumer = consumerId("consumer-cycle");
const consoleProduct = productId("console-cycle");
const headsetProduct = productId("headset-cycle");
const controllerProduct = productId("controller-cycle");

function makeOffer(product: ReturnType<typeof productId>): OfferProposal {
  return {
    offerId: offerId(`offer-${product}`),
    merchantId: merchantId("merchant-cycle"),
    productId: product,
    category: "gaming",
    actionFamily: "baseline",
    price: { currency: "BRL", amountMinor: 19900 },
    expiresAt: "2026-10-01T00:00:00.000Z",
  };
}

test("durable purchase becomes an indefinite marketing suppression and complement source", () => {
  const purchase: Purchase = {
    purchaseId: purchaseId("purchase-console"),
    consumerId: consumer,
    productId: consoleProduct,
    lifecycle: "durable",
    purchasedAt: "2026-09-03T10:00:00.000Z",
  };

  const result = recordPurchaseMarketingState({ purchase, now: isoDateTime("2026-09-03T10:00:01.000Z") });
  assert.equal(result.event, "Ok");
  if (result.event === "Ok") {
    assert.equal(result.value.suppressMarketing, true);
    assert.equal(result.value.suppressionUntil, undefined);
    assert.equal(result.value.complementSourceEligible, true);
  }
});

test("consumable purchase receives a replenishment window instead of permanent suppression", () => {
  const purchase: Purchase = {
    purchaseId: purchaseId("purchase-consumable"),
    consumerId: consumer,
    productId: productId("coffee-cycle"),
    lifecycle: "consumable",
    replenishAfterDays: 30,
    purchasedAt: "2026-09-01T00:00:00.000Z",
  };

  const result = recordPurchaseMarketingState({ purchase, now: isoDateTime("2026-09-03T00:00:00.000Z") });
  assert.equal(result.event, "Ok");
  if (result.event === "Ok") {
    assert.equal(result.value.suppressMarketing, true);
    assert.equal(result.value.replenishmentEligibleAt, "2026-10-01T00:00:00.000Z");
  }
});

test("ownership update keeps one consumer/product projection and increments purchase history", () => {
  const firstPurchase: Purchase = {
    purchaseId: purchaseId("purchase-1"),
    consumerId: consumer,
    productId: consoleProduct,
    lifecycle: "durable",
    purchasedAt: "2026-09-01T00:00:00.000Z",
  };
  const secondPurchase: Purchase = {
    ...firstPurchase,
    purchaseId: purchaseId("purchase-2"),
    purchasedAt: "2026-09-03T00:00:00.000Z",
  };

  const firstState = recordPurchaseMarketingState({
    purchase: firstPurchase,
    now: isoDateTime("2026-09-01T00:00:01.000Z"),
  });
  assert.equal(firstState.event, "Ok");
  if (firstState.event !== "Ok") return;

  const firstOwnership = updateOwnership({ current: [], marketingState: firstState.value });
  assert.equal(firstOwnership.event, "Ok");
  if (firstOwnership.event !== "Ok") return;

  const secondState = recordPurchaseMarketingState({
    purchase: secondPurchase,
    now: isoDateTime("2026-09-03T00:00:01.000Z"),
  });
  assert.equal(secondState.event, "Ok");
  if (secondState.event !== "Ok") return;

  const secondOwnership = updateOwnership({ current: firstOwnership.value.entries, marketingState: secondState.value });
  assert.equal(secondOwnership.event, "Ok");
  if (secondOwnership.event === "Ok") {
    assert.equal(secondOwnership.value.entries.length, 1);
    assert.equal(Number(secondOwnership.value.updated.purchaseCount), 2);
    assert.equal(secondOwnership.value.updated.latestPurchaseId, secondPurchase.purchaseId);
  }
});

test("complement discovery uses active ownership, confidence threshold and avoids suppressed owned targets", () => {
  const sourcePurchase: Purchase = {
    purchaseId: purchaseId("purchase-source"),
    consumerId: consumer,
    productId: consoleProduct,
    lifecycle: "durable",
    purchasedAt: "2026-09-03T00:00:00.000Z",
  };
  const ownedTargetPurchase: Purchase = {
    purchaseId: purchaseId("purchase-owned-target"),
    consumerId: consumer,
    productId: controllerProduct,
    lifecycle: "durable",
    purchasedAt: "2026-09-03T00:00:00.000Z",
  };

  const sourceState = recordPurchaseMarketingState({ purchase: sourcePurchase, now: isoDateTime("2026-09-03T00:00:01.000Z") });
  const ownedTargetState = recordPurchaseMarketingState({ purchase: ownedTargetPurchase, now: isoDateTime("2026-09-03T00:00:01.000Z") });
  assert.equal(sourceState.event, "Ok");
  assert.equal(ownedTargetState.event, "Ok");
  if (sourceState.event !== "Ok" || ownedTargetState.event !== "Ok") return;

  const sourceOwnership = updateOwnership({ current: [], marketingState: sourceState.value });
  assert.equal(sourceOwnership.event, "Ok");
  if (sourceOwnership.event !== "Ok") return;
  const allOwnership = updateOwnership({ current: sourceOwnership.value.entries, marketingState: ownedTargetState.value });
  assert.equal(allOwnership.event, "Ok");
  if (allOwnership.event !== "Ok") return;

  const relations: ComplementRelation[] = [
    { sourceProductId: consoleProduct, targetProductId: headsetProduct, confidence: 0.92, relation: "complement" },
    { sourceProductId: consoleProduct, targetProductId: controllerProduct, confidence: 0.99, relation: "complement" },
  ];
  const result = discoverComplements({
    consumerId: consumer,
    ownership: allOwnership.value.entries,
    relations,
    offers: [makeOffer(headsetProduct), makeOffer(controllerProduct)],
    minimumConfidence: complementConfidence(0.8),
  });

  assert.equal(result.event, "Ok");
  if (result.event === "Ok") {
    assert.equal(result.value.length, 1);
    assert.equal(result.value[0]?.targetProductId, headsetProduct);
    assert.equal(result.value[0]?.offer.actionFamily, "complement_discovery");
  }
});
