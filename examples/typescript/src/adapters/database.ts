import type { CollectionName, DatabaseGateway, StoragePort } from "../ports/storage.js";

export class DatabaseStorage implements StoragePort {
  constructor(private readonly gateway: DatabaseGateway) {}

  async readCollection<T>(name: CollectionName): Promise<T[]> {
    return (await this.gateway.readCollection(name)) as T[];
  }

  async replaceCollection<T>(name: CollectionName, records: readonly T[]): Promise<void> {
    await this.gateway.replaceCollection(name, records as readonly unknown[]);
  }
}
