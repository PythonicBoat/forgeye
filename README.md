# Forgeye

Industrial monitoring interface with a React frontend and Flask REST API.

## Vercel deployment

Deploy the repository root. Vercel builds `client/` and serves the Flask app
through `api/index.py`.

Environment variables:

- `FORGEYE_DATA_MODE=demo` keeps the bundled deterministic demonstration data.
- `FORGEYE_DATA_MODE=live` must only be set after replacing the bundled data
  provider with an authenticated, persistent telemetry integration.
- `FORGEYE_ALLOWED_ORIGIN=https://your-domain.example` enables cross-origin API
  access for one trusted origin. Same-origin frontend requests need no value.

Health endpoint: `/api/health`

The bundled deployment is a stateless demonstration baseline. Vercel Functions
do not provide durable telemetry storage; production device data requires a
managed database or authenticated upstream ingestion service.
