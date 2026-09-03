import { randomUUID } from "node:crypto";
import { decisionId } from "../domain/brand.js";
import type {
  ActionFamily,
  BanditStateRecord,
  Candidate,
  ComplementRelation,
  Decision,
  DemandContract,
  Feedback,
  FrameworkConfig,
  OfferProposal,
  PersistedDecision,
  Purchase,
} from "../domain/types.js";
import type { ConsumerId } from "../domain/brand.js";
import { COLLECTIONS, type StoragePort } from "../ports/storage.js";
import { findComplementOffers } from "./complements.js";
import { evaluateEligibility } from "./eligibility.js";
import {
  createBanditState,
  FEATURE_VERSION,
  selectConservative,
  updateBandit,
} from "./linucb.js";

function isIntentMatch(contract: DemandContract, offer: OfferProposal): boolean {
  return (contract.intents ?? []).some((intent) =>
    intent.status === "searching" &&
    (intent.productId === offer.productId || (intent.category !== undefined && intent.category === offer.category)),
  );
}

function priceFit(contract: DemandContract, offer: OfferProposal): number {
  const intent = (contract.intents ?? []).find((candidate) =>
    candidate.status === "searching" &&
    (candidate.productId === offer.productId || candidate.category === offer.category),
  );
  if (!intent?.maxPriceMinor || intent.currency !== offer.price.currency) return 0.5;
  return Math.max(0, Math.min(1, 1 - offer.price.amountMinor / (2 * intent.maxPriceMinor)));
}

function features(
  contract: DemandContract,
  offer: OfferProposal | undefined,
  weeklyPresentations: number,
): number[] {
  if (!offer) {
    const budget = contract.interruptionBudgetPerWeek ?? 1;
    return [1, 0, 0, 0, 0, 0, 1, -Math.min(1, weeklyPresentations / Math.max(1, budget))];
  }
  const budget = contract.interruptionBudgetPerWeek ?? 1;
  return [
    1,
    isIntentMatch(contract, offer) ? 1 : 0,
    offer.complementConfidence ?? 0,
    priceFit(contract, offer),
    offer.actionFamily === "replenishment" ? 1 : 0,
    offer.actionFamily === "baseline" ? 1 : 0,
    offer.merchantQuality ?? 0.5,
    -Math.min(1, weeklyPresentations / Math.max(1, budget)),
  ];
}

function rewardFor(feedback: Feedback): number {
  if (feedback.reward !== undefined) return feedback.reward;
  switch (feedback.type) {
    case "purchased": return 1;
    case "accepted": return 0.6;
    case "presented": return 0;
    case "ignored": return -0.2;
    case "dismissed": return -0.3;
    case "rejected": return -0.4;
    case "blocked_category": return -1;
    case "unsubscribed": return -1;
  }
}

function lastWeek(items: readonly { timestamp: string }[], now: Date): number {
  const threshold = now.getTime() - 7 * 86_400_000;
  return items.filter((item) => Date.parse(item.timestamp) >= threshold).length;
}

export class HyperMarketingEngine {
  constructor(
    private readonly storage: StoragePort,
    private readonly config: FrameworkConfig["decisioning"],
  ) {}

  async decide(consumerIdValue: ConsumerId, now = new Date()): Promise<Decision> {
    const contracts = await this.storage.readCollection<DemandContract>(COLLECTIONS.demandContracts);
    const contract = contracts.find((item) => item.consumerId === consumerIdValue);
    if (!contract) throw new Error(`No DemandContract for ${consumerIdValue}`);

    const [offers, purchases, relations, feedback, decisions, states] = await Promise.all([
      this.storage.readCollection<OfferProposal>(COLLECTIONS.offers),
      this.storage.readCollection<Purchase>(COLLECTIONS.purchases),
      this.storage.readCollection<ComplementRelation>(COLLECTIONS.complements),
      this.storage.readCollection<Feedback>(COLLECTIONS.feedback),
      this.storage.readCollection<PersistedDecision>(COLLECTIONS.decisions),
      this.storage.readCollection<BanditStateRecord>(COLLECTIONS.banditState),
    ]);

    const consumerPurchases = purchases.filter((item) => item.consumerId === consumerIdValue);
    const consumerFeedback = feedback.filter((item) => item.consumerId === consumerIdValue);
    const weeklyPresentations = lastWeek(
      consumerFeedback.filter((item) => item.type === "presented"),
      now,
    );
    const weeklyDiscoveryPresentations = lastWeek(
      consumerFeedback.filter((item) => {
        if (item.type !== "presented") return false;
        const persisted = decisions.find((record) => record.decision.decisionId === item.decisionId);
        return persisted?.decision.actionFamily === "complement_discovery";
      }),
      now,
    );
    const recoveryTriggered = [...consumerFeedback]
      .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))[0]?.type === "rejected";

    const complementOffers = findComplementOffers(consumerPurchases, relations, offers);
    const complementIds = new Set(complementOffers.map((offer) => offer.offerId));

    const rawCandidates: OfferProposal[] = [];
    for (const original of offers) {
      const complement = complementOffers.find((candidate) => candidate.offerId === original.offerId);
      if (complement) {
        rawCandidates.push(complement);
        continue;
      }
      const include =
        (original.actionFamily === "intent" && isIntentMatch(contract, original)) ||
        original.actionFamily === "replenishment" ||
        original.actionFamily === "baseline" ||
        (recoveryTriggered && ["discount", "bundle"].includes(original.actionFamily));
      if (include && !complementIds.has(original.offerId)) rawCandidates.push(original);
    }

    const candidates: Candidate[] = [];
    for (const offer of rawCandidates) {
      const eligibility = evaluateEligibility({
        contract,
        offer,
        purchases: consumerPurchases,
        now,
        weeklyPresentations,
        weeklyDiscoveryPresentations,
      });
      if (!eligibility.eligible) continue;
      candidates.push({
        actionFamily: offer.actionFamily,
        offer,
        features: features(contract, offer, weeklyPresentations),
      });
    }

    candidates.push({
      actionFamily: "no_action",
      features: features(contract, undefined, weeklyPresentations),
    });

    const state = states.find((item) => item.consumerId === consumerIdValue) ?? createBanditState(consumerIdValue, now);
    const selected = selectConservative(state, candidates, this.config.alpha, this.config.safetyMargin);
    const id = decisionId(randomUUID());
    const chosen = selected.candidate;
    const decision: Decision = {
      decisionId: id,
      consumerId: consumerIdValue,
      status: chosen.actionFamily === "no_action" ? "no_action" : "present",
      actionFamily: chosen.actionFamily,
      policyVersion: this.config.policyVersion,
      score: selected.score,
      contextFeatureVersion: FEATURE_VERSION,
      createdAt: now.toISOString(),
      ...(chosen.offer ? { offerId: chosen.offer.offerId } : {}),
    };

    await this.storage.replaceCollection(COLLECTIONS.decisions, [
      ...decisions,
      { decision, features: [...chosen.features] },
    ]);
    return decision;
  }

  async recordFeedback(value: Feedback, now = new Date()): Promise<void> {
    const [feedback, decisions, states] = await Promise.all([
      this.storage.readCollection<Feedback>(COLLECTIONS.feedback),
      this.storage.readCollection<PersistedDecision>(COLLECTIONS.decisions),
      this.storage.readCollection<BanditStateRecord>(COLLECTIONS.banditState),
    ]);
    if (feedback.some((item) => item.feedbackId === value.feedbackId)) return;
    const record = decisions.find((item) => item.decision.decisionId === value.decisionId);
    if (!record?.decision.actionFamily) throw new Error(`Unknown decision ${value.decisionId}`);

    const state = states.find((item) => item.consumerId === value.consumerId) ?? createBanditState(value.consumerId, now);
    const updated = updateBandit(
      state,
      record.decision.actionFamily as ActionFamily,
      record.features,
      rewardFor(value),
      now,
    );

    await Promise.all([
      this.storage.replaceCollection(COLLECTIONS.feedback, [...feedback, value]),
      this.storage.replaceCollection(COLLECTIONS.banditState, [
        ...states.filter((item) => item.consumerId !== value.consumerId),
        updated,
      ]),
    ]);
  }

  async recordPurchase(value: Purchase): Promise<void> {
    const purchases = await this.storage.readCollection<Purchase>(COLLECTIONS.purchases);
    if (purchases.some((item) => item.purchaseId === value.purchaseId)) return;
    await this.storage.replaceCollection(COLLECTIONS.purchases, [...purchases, value]);
  }
}
