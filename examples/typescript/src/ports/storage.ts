export const COLLECTIONS = {
  demandContracts: "demand-contracts",
  products: "products",
  offers: "offers",
  purchases: "purchases",
  complements: "complements",
  feedback: "feedback",
  decisions: "decisions",
  banditState: "bandit-state",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

export interface StoragePort {
  readCollection<T>(name: CollectionName): Promise<T[]>;
  replaceCollection<T>(name: CollectionName, records: readonly T[]): Promise<void>;
}

export interface DatabaseGateway {
  readCollection(name: CollectionName): Promise<unknown[]>;
  replaceCollection(name: CollectionName, records: readonly unknown[]): Promise<void>;
}

export type DatabaseGatewayFactory = (
  options: Record<string, unknown>,
) => Promise<DatabaseGateway> | DatabaseGateway;
