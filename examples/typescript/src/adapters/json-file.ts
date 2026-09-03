import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { CollectionName, StoragePort } from "../ports/storage.js";

export class JsonFileStorage implements StoragePort {
  constructor(private readonly basePath: string) {}

  async readCollection<T>(name: CollectionName): Promise<T[]> {
    const file = join(this.basePath, `${name}.json`);
    try {
      const raw = await readFile(file, "utf8");
      const value: unknown = JSON.parse(raw);
      if (!Array.isArray(value)) throw new Error(`${file} must contain a JSON array`);
      return value as T[];
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code === "ENOENT") return [];
      throw error;
    }
  }

  async replaceCollection<T>(name: CollectionName, records: readonly T[]): Promise<void> {
    await mkdir(this.basePath, { recursive: true });
    const file = join(this.basePath, `${name}.json`);
    const temp = `${file}.tmp`;
    await writeFile(temp, `${JSON.stringify(records, null, 2)}\n`, "utf8");
    await rename(temp, file);
  }
}
