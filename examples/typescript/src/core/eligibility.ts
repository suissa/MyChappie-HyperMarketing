import type {
  ContactWindow,
  DemandContract,
  EligibilityReason,
  EligibilityResult,
  OfferProposal,
  Purchase,
  Weekday,
} from "../domain/types.js";

export interface EligibilityContext {
  contract: DemandContract;
  offer: OfferProposal;
  purchases: readonly Purchase[];
  now: Date;
  weeklyPresentations: number;
  weeklyDiscoveryPresentations: number;
}

const weekdayMap: Record<string, Weekday> = {
  Mon: "mon",
  Tue: "tue",
  Wed: "wed",
  Thu: "thu",
  Fri: "fri",
  Sat: "sat",
  Sun: "sun",
};

function minutes(value: string): number {
  const [hour = "0", minute = "0"] = value.split(":");
  return Number(hour) * 60 + Number(minute);
}

function currentParts(now: Date, timezone: string): { day: Weekday; minute: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value ?? "";
  const day = weekdayMap[get("weekday")];
  if (!day) throw new Error(`Unsupported weekday returned for timezone ${timezone}`);
  return { day, minute: Number(get("hour")) * 60 + Number(get("minute")) };
}

function windowAllows(window: ContactWindow, now: Date): boolean {
  const local = currentParts(now, window.timezone);
  if (!window.days.includes(local.day)) return false;
  const from = minutes(window.from);
  const to = minutes(window.to);
  return from <= to
    ? local.minute >= from && local.minute <= to
    : local.minute >= from || local.minute <= to;
}

function intentMatches(contract: DemandContract, offer: OfferProposal, status: "searching" | "rejected"): boolean {
  const now = Date.now();
  return (contract.intents ?? []).some((intent) => {
    if (intent.status !== status) return false;
    if (intent.expiresAt && Date.parse(intent.expiresAt) < now) return false;
    const productMatch = intent.productId === offer.productId;
    const categoryMatch = Boolean(intent.category && intent.category === offer.category);
    return productMatch || categoryMatch;
  });
}

function purchaseSuppresses(purchase: Purchase, now: Date): boolean {
  if (purchase.lifecycle === "durable") return true;
  if (purchase.lifecycle === "subscription") {
    return !purchase.activeUntil || Date.parse(purchase.activeUntil) > now.getTime();
  }
  if (purchase.lifecycle === "consumable" || purchase.lifecycle === "quantity_sensitive") {
    if (purchase.replenishAfterDays === undefined) return false;
    const replenishAt = Date.parse(purchase.purchasedAt) + purchase.replenishAfterDays * 86_400_000;
    return now.getTime() < replenishAt;
  }
  return false;
}

export function evaluateEligibility(context: EligibilityContext): EligibilityResult {
  const { contract, offer, purchases, now } = context;
  const reasons: EligibilityReason[] = [];

  if (Date.parse(offer.expiresAt) <= now.getTime()) reasons.push("OFFER_EXPIRED");
  if (contract.blockedCategories?.includes(offer.category)) reasons.push("BLOCKED_CATEGORY");
  if (contract.allowedCategories?.length && !contract.allowedCategories.includes(offer.category)) {
    reasons.push("CONSTRAINT_NOT_SATISFIED");
  }

  if (intentMatches(contract, offer, "rejected")) reasons.push("EXPLICITLY_REJECTED");

  if (offer.channel && !contract.channels.includes(offer.channel)) reasons.push("CHANNEL_NOT_ALLOWED");
  if (offer.modality && !contract.modalities.includes(offer.modality)) reasons.push("MODALITY_NOT_ALLOWED");

  if (contract.contactWindows?.length && !contract.contactWindows.some((window) => windowAllows(window, now))) {
    reasons.push("TIMING_NOT_ALLOWED");
  }

  if (
    contract.interruptionBudgetPerWeek !== undefined &&
    context.weeklyPresentations >= contract.interruptionBudgetPerWeek
  ) {
    reasons.push("INTERRUPTION_BUDGET_EXHAUSTED");
  }

  if (offer.actionFamily === "complement_discovery") {
    if (!contract.discovery.enabled) reasons.push("CONSTRAINT_NOT_SATISFIED");
    if (context.weeklyDiscoveryPresentations >= contract.discovery.maxPresentationsPerWeek) {
      reasons.push("DISCOVERY_BUDGET_EXHAUSTED");
    }
  }

  const matchingIntent = (contract.intents ?? []).find((intent) => {
    if (intent.status !== "searching") return false;
    return intent.productId === offer.productId || (intent.category !== undefined && intent.category === offer.category);
  });
  if (
    matchingIntent?.maxPriceMinor !== undefined &&
    matchingIntent.currency === offer.price.currency &&
    offer.price.amountMinor > matchingIntent.maxPriceMinor
  ) {
    reasons.push("PRICE_NOT_ELIGIBLE");
  }

  const sameProductPurchases = purchases.filter((purchase) => purchase.productId === offer.productId);
  if (sameProductPurchases.some((purchase) => purchaseSuppresses(purchase, now))) {
    reasons.push("ALREADY_OWNED");
  }

  return { eligible: reasons.length === 0, reasons: [...new Set(reasons)] };
}
