# Cosmos Odyssey API

This is test work for internship position at Uptime

## Env Params

These params should be defined in a .env file

| Param |     Description    |
|:-----:|:------------------|
| NODE_ENV | Define node env [development | test | production] |
| POSTGRES_USER | defines the postgres user |
| POSTGRES_PASSWORD | defines the postgres password |
| POSTGRES_DB | Sets the default db |
| DATABASE_URL | postgresql:\[POSTGRES_USER]:\[POSTGRES_PASSWORD]@localhost:5432/\[POSTGRES_DB] |

## NPM Scripts

### build

Builds the app for production

### dev

Runs the app in dev

### start

Runs the built app

### tests

Runs tests

## Run migrations

For migrations to run, you must set DATABASE_URL env variable and then run

```
npm run migrate up
```
