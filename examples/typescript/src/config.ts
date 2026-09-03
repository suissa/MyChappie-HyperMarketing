import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { DatabaseStorage } from "./adapters/database.js";
import { JsonFileStorage } from "./adapters/json-file.js";
import type { FrameworkConfig } from "./domain/types.js";
import type { DatabaseGatewayFactory, StoragePort } from "./ports/storage.js";

export async function loadConfig(path: string): Promise<FrameworkConfig> {
  return JSON.parse(await readFile(path, "utf8")) as FrameworkConfig;
}

export async function createStorageFromConfig(
  configPath: string,
  config: FrameworkConfig,
): Promise<StoragePort> {
  const base = dirname(resolve(configPath));

  if (config.storage.kind === "json") {
    return new JsonFileStorage(resolve(base, config.storage.path));
  }

  const modulePath = resolve(base, config.storage.module);
  const module = (await import(pathToFileURL(modulePath).href)) as {
    createDatabaseGateway?: DatabaseGatewayFactory;
  };

  if (!module.createDatabaseGateway) {
    throw new Error(`Database adapter ${modulePath} must export createDatabaseGateway(options)`);
  }

  const gateway = await module.createDatabaseGateway(config.storage.options ?? {});
  return new DatabaseStorage(gateway);
}
