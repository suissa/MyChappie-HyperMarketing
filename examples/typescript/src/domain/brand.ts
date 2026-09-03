declare const semanticBrand: unique symbol;

export type Nominal<T, Name extends string> = T & {
  readonly [semanticBrand]: Name;
};

export type ConsumerId = Nominal<string, "ConsumerId">;
export type MerchantId = Nominal<string, "MerchantId">;
export type ProductId = Nominal<string, "ProductId">;
export type OfferId = Nominal<string, "OfferId">;
export type PurchaseId = Nominal<string, "PurchaseId">;
export type DecisionId = Nominal<string, "DecisionId">;
export type FeedbackId = Nominal<string, "FeedbackId">;
export type IntentId = Nominal<string, "IntentId">;

function nonEmpty<Name extends string>(value: string, name: Name): Nominal<string, Name> {
  if (value.trim().length === 0) throw new Error(`${name} cannot be empty`);
  return value as Nominal<string, Name>;
}

export const consumerId = (value: string): ConsumerId => nonEmpty(value, "ConsumerId");
export const merchantId = (value: string): MerchantId => nonEmpty(value, "MerchantId");
export const productId = (value: string): ProductId => nonEmpty(value, "ProductId");
export const offerId = (value: string): OfferId => nonEmpty(value, "OfferId");
export const purchaseId = (value: string): PurchaseId => nonEmpty(value, "PurchaseId");
export const decisionId = (value: string): DecisionId => nonEmpty(value, "DecisionId");
export const feedbackId = (value: string): FeedbackId => nonEmpty(value, "FeedbackId");
export const intentId = (value: string): IntentId => nonEmpty(value, "IntentId");
