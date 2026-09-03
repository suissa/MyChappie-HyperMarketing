import type { CollectionName, StoragePort } from "../ports/storage.js";

export class MemoryStorage implements StoragePort {
  private readonly collections = new Map<CollectionName, unknown[]>();

  seed<T>(name: CollectionName, records: readonly T[]): this {
    this.collections.set(name, structuredClone(records) as unknown[]);
    return this;
  }

  async readCollection<T>(name: CollectionName): Promise<T[]> {
    return structuredClone((this.collections.get(name) ?? []) as T[]);
  }

  async replaceCollection<T>(name: CollectionName, records: readonly T[]): Promise<void> {
    this.collections.set(name, structuredClone(records) as unknown[]);
  }
}
