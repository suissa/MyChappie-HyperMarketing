import type {
  CollectionName,
  DatabaseGateway,
} from "./src/ports/storage.js";

/**
 * Replace this example with PostgreSQL, MongoDB, SQLite, an HTTP data service,
 * or another persistence implementation. HyperMarketing core never imports it.
 */
export async function createDatabaseGateway(
  options: Record<string, unknown>,
): Promise<DatabaseGateway> {
  const connectionUrlEnv = String(options.connectionUrlEnv ?? "DATABASE_URL");
  const connectionUrl = process.env[connectionUrlEnv];
  if (!connectionUrl) throw new Error(`${connectionUrlEnv} is not defined`);

  // Initialize your real database client here.
  void connectionUrl;

  return {
    async readCollection(_name: CollectionName): Promise<unknown[]> {
      throw new Error("Implement readCollection with your database driver");
    },
    async replaceCollection(_name: CollectionName, _records: readonly unknown[]): Promise<void> {
      throw new Error("Implement replaceCollection with your database driver");
    },
  };
}
