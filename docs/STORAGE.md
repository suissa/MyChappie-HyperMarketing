# Storage Architecture

AHMP core logic depends on a `StoragePort`, not on PostgreSQL, MongoDB, Redis, filesystem APIs or any ORM.

## Required logical collections

A conforming minimal implementation needs access to:

- consumers / demand contracts;
- products;
- offers;
- purchases;
- complement relations;
- feedback;
- bandit state.

## JSON mode

For development, local-first installations and demonstrations:

```json
{
  "storage": {
    "kind": "json",
    "path": "./data"
  }
}
```

The reference adapter maps logical collections to `.json` files.

## Database mode

Core code does not know a database SDK. A deployment supplies a module implementing a tiny gateway:

```ts
interface DatabaseGateway {
  readCollection(name: string): Promise<unknown[]>;
  replaceCollection(name: string, value: unknown[]): Promise<void>;
}
```

Configuration:

```json
{
  "storage": {
    "kind": "database",
    "module": "./my-database-gateway.js"
  }
}
```

The external module may internally use PostgreSQL, MongoDB, SQLite, DynamoDB, an HTTP data service or anything else.

## Production guidance

`replaceCollection` is intentionally minimal for protocol portability, not a recommendation for database implementation. Production adapters SHOULD implement atomic/transactional operations internally and MAY expose an optimized `StoragePort` directly.

## Event sourcing

An implementation MAY derive current state from events. AHMP does not mandate CRUD or Event Sourcing. The conformance requirement is behavioral: given equivalent state and input, protocol decisions must obey the same normative constraints.
