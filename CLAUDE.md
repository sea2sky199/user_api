# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start (production)
npm start

# Development with auto-reload and debug logging
npm run dev

# Run all pending migrations
knex migrate:latest

# Run a specific migration file directly
node -e "require('./services/database/migrations/<filename>').up(require('knex')(require('./knexfile').development))"
```

Debug output uses the `debug` package namespaced under `CHEM:*`. The `npm run dev` script sets `DEBUG=CHEM*` automatically.

## Architecture

This is a Node.js/Express REST API (port 8001) for managing users in the CHEM/Compound Match application. It follows a layered MVC pattern:

```
routes/users.js       → defines HTTP endpoints, delegates to controller
controllers/users.js  → handles request/response, input validation, business logic
models/users.js       → direct Knex queries against MySQL `users` table
config/database.js    → Knex config (dev/bdd/production), all currently point to the same hardcoded local MySQL
```

**Database:** MySQL via Knex. The `models/users.js` always uses `development` env (hardcoded). The `config/database.js` reads `CHEM_APP_DB_URL` from env but currently uses a hardcoded local connection instead. Migrations live in `services/database/migrations/` and must be run in order — they define the full schema evolution of the `users` table.

**Users table key fields:** `id`, `user_id` (WebSSO ID), `name`, `email`, `role` (GUEST/ADMIN/etc.), `privileged_permission`, `is_deleted` (soft delete), `last_access_time`, `datetime_added`, `column_config`, `similarity_column_config` (JSON strings).

**Auth:** Optional HTTP Basic Auth controlled by `CHEM_AUTH_TOKEN` env var — if set, all routes require the credential `gateway:<token>`.

**Soft deletes:** `DELETE /user/:id` does not remove the row; it sets `is_deleted=true`, `role=GUEST`, and clears `privileged_permission`. A soft-deleted user can be restored via `POST /createUser` with their WebSSO ID.

**Role logic:** First user ever added automatically gets `ADMIN` role. GUEST role always forces `privileged_permission=false`. A user cannot modify or delete their own account.

**API docs:** Swagger UI at `/api-docs`, sourced from JSDoc annotations in `docs/`.
