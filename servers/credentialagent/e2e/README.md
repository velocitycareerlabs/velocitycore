# Steps to run e2e tests

## Quickstart

1. Run docker compose `docker compose up`
1. Run blockchain contract installation `RPC_NODE_URL=http://localhost:18545 node ../../../tools/contracts-deployment/index.js`
1. Double check that the CONTRACT_* values are identical to those in `../localdev.env`
1. Run oracle migrations `MIGRATION_ENV=localdev yarn --cwd ../../oracle migrate:up`
1. Set the `NODE_TLS_REJECT_UNAUTHORIZED` environment variable to `0`
1. Run tests using `yarn nx run @velocitycareerlabs/server-credentialagent:test:e2e`

## Docker Compose

- Run docker compose using `docker compose up`
- Rebuild any broken container using `docker compose up --build --force-recreate --no-deps`
