import { resolve } from "node:path";
import { consumerId } from "./domain/brand.js";
import { createStorageFromConfig, loadConfig } from "./config.js";
import { HyperMarketingEngine } from "./core/engine.js";

const configPath = resolve(process.argv[2] ?? "hypermarketing.config.json");
const config = await loadConfig(configPath);
const storage = await createStorageFromConfig(configPath, config);
const engine = new HyperMarketingEngine(storage, config.decisioning);

const decision = await engine.decide(consumerId("consumer-1"));
console.log(JSON.stringify(decision, null, 2));
