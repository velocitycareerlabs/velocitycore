## Data Migrations
### Local
Where implemented, such as in the credential agent and oracle,
it is possible to run migration commands from the package's root folder:
- `yarn migrate:create migration-name-kebab-case-format` Will create a file in `migrations` folder
- `yarn migrate:up`: Will run all migrations
- `yarn migrate:down`: Will revert the last executed migration
- `yarn migrate:status`: Will show the current migration status

#### Notes for oracle migrations
* Use `MIGRATION_ENV=[localdev|dev|staging|prod]` to pull in the correct config and secrets
  * the script expects a `[migration-env].secrets.env` file in `oracle/migrations/environments`. This is available in keybase
* Use `IGNORE_FINERACT=true` if you don't care about Fineract (typically only for localdev testing the registrar only)
* Use `BLOCKCHAIN_AUTHENTICATION_TOKEN=<token>` if the migration needs to communicate with blockchain nodes