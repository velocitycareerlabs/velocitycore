# Velocity Network Monorepo
![Github CI](https://github.com/velocitycareerlabs/velocitycore/workflows/Node.js%20CI/badge.svg)
[![codecov](https://codecov.io/gh/velocitycareerlabs/velocitycore/branch/dev/graph/badge.svg?token=FZPGEUK91B)](https://codecov.io/gh/velocitycareerlabs/monorepo)
![Vulnerabilities](https://github.com/velocitycareerlabs/velocitycore/workflows/Vulnerability%20Audit/badge.svg)
![Dependency License Check](https://github.com/velocitycareerlabs/velocitycore/workflows/Dependency%20License%20Check/badge.svg)

Contains the Velocity Career Labs
- Credential Agent, 
- "Oracle" server containing the combined 
  - Blockchain oracle
  - registrar
  - push notification gateway 
  - phone/email verifing issuer vendor
  - (Coming soon) network event sink. 
- Mock Vendor Gateway use by VCL in its deployment

## Running Locally

```
yarn
yarn start
```

## Running with Docker

```
docker-compose up
```

## Tests Requirements

### Containers
Containers are required to be running for tests to work:
Use the `docker-compose-unit-testing.yml` for example:
- `docker compose -f ./docker-compose-unit-testing.yml up`

### Migrations
- credentialagent migrations need to be run against test 
  credentialagent database in order to tests to pass locally. 
  For a default configuration that would be: 
  `MONGO_URI=mongodb://localhost:27017/test-credential-agent yarn migrate:up`
  from the `servers/credentialagent` directory.
  
See [Data Migrations](#data-migrations) section below
for more information on migrations

### Environment Variables
The `oracle`'s `.env` file should have `AWS_ENDPOINT` set to the host exposed by `localstack`, which, by default, should be `http://localhost:4566`.

## Data Migrations
* For running oracle migrations, see `servers/oracle/README.md`
* For running credential agent migrations, see `servers/credentialagent/README.md`