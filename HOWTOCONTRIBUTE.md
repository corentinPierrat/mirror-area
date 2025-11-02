# How to Contribute

This guide explains how to extend the AREA platform safely and consistently. It complements the historical notes in `documentation/CONTRIBUTING.md` with concrete, automation-specific workflows.

---

## 0. Prerequisites

Make sure the following global tools are available on your machine:

- Git ≥ 2.45
- Docker Engine + Docker Compose plugin
- Node.js 20.x with npm
- Python 3.12 (only if you plan to run the backend without Docker)

All project-specific dependencies are installed through the steps below.

---

## 1. Base contribution workflow

1. **Fork / branch**
   ```bash
   git checkout -b feature/<short-topic>
   ```
2. **Install tooling**
   - Backend: `python -m venv .venv && pip install -r backend/requirements.txt`
   - Frontend: `cd frontend && npm install`
   - Mobile: `cd mobile && npm install`
3. **Code style**
   - Python: keep imports sorted, run `ruff check` / `black` if available (CI enforces `pytest`).
   - JavaScript: run `npm run lint` inside `frontend`.
4. **Run the stack**
   ```bash
   docker compose up --build
   ```
   Validate that `http://localhost:8080/about.json` and `http://localhost:8081/` respond correctly.
5. **Tests**
   - Backend: `pytest`
   - Frontend: `npm run lint`
   - Mobile: run the relevant Cypress flow if you touch onboarding or services.
6. **Commit & PR**
   - One logical change per commit.
   - Prefix every commit message with `[ADD]`, `[FIX]` or `[DEL]` before pushing.
   - Reference related issues and describe the user-visible effect.
   - Keep documentation updated (`README.md`, this HOWTO, OpenAPI annotations).

---

## 2. Adding a new OAuth-enabled service

Follow these steps when introducing another third-party provider (e.g. GitHub, Slack):

1. **Configuration**
   - Add `SERVICE_CLIENT_ID` and `SERVICE_CLIENT_SECRET` to `backend/.env.example`.
   - Expose them in `backend/app/config.py::Settings`.
2. **OAuth registration**
   - Update `backend/app/routers/oauth.py`:
     - Register the provider with `oauth.register(...)`.
     - Extend `SERVICES_INFO` so it appears in `/oauth/services`.
   - Ensure the callback URL matches the reverse proxy configuration (`https://trigger.ink/oauth/<provider>/callback` in production).
3. **Token storage**
   - No schema change is required. Tokens are encrypted via `app.services.token_storage`.
4. **Linking UI**
   - Update the web client (typically `frontend/src/Services.jsx`) to display the new provider logo and connection status.
5. **Docs**
   - Document scopes and prerequisites in `README.md` (API section) if they expose new actions/reactions.

---

## 3. Creating a new Action (trigger)

1. **Describe the action**
   - Add an entry to `ACTIONS_CATALOG` in `backend/app/routers/catalog.py`.
     - Define `service`, `event`, `title`, `description`, and the `payload_schema`.
2. **Implement business logic**
   - Add an async function to `backend/app/services/actions.py`.
     - Fetch required OAuth tokens via `refresh_oauth_token`.
     - Validate and normalise `params`.
     - Return a serialisable payload (typically `dict[str, Any]`).
3. **Register the executor**
   - Map `(service, event)` to the new function in `ACTION_DISPATCH`.
4. **Surface in /about.json**
   - Registration in `ACTIONS_CATALOG` is enough—the `about.json` router aggregates entries automatically.
5. **Expose the trigger**
   - If the action depends on an external webhook, wire it in `backend/app/routers/actions.py` (or the Discord bot/Twitch EventSub service).
   - For timer-based actions, ensure the scheduler recognises the new params if needed (`services/timer_utils.py`).
6. **Tests**
   - Add unit tests in `tests/backend` covering happy path and failure cases.
   - Provide a mock fixture for third-party HTTP requests.

---

## 4. Creating a new Reaction

1. **Catalog entry**
   - Update `REACTIONS_CATALOG` in `backend/app/routers/catalog.py` with `service`, `event`, and `payload_schema`.
2. **Implementation**
   - Add an async function in `backend/app/services/reactions.py`.
     - Resolve tokens with `refresh_oauth_token`.
     - Perform the external API call using `httpx` or the provider SDK.
     - Return a lightweight `{ "status": "...", ... }` dict or `{ "error": "..."}`
3. **Register in dispatcher**
   - Append `(service, event)` to `REACTION_DISPATCH`.
4. **Secrets & configuration**
   - If the reaction needs new environment variables (webhooks, bot tokens), update `.env.example` and documentation.
5. **Update clients**
   - Ensure the web/mobile builders expose the new reaction’s form fields and validation rules.

---

## 5. Extending the workflow engine

- **Linking step outputs**: use the `__link` syntax already supported by `prepare_step_params`. Reactions can source values from previous action payloads.
- **Custom filters**: modify `trigger_workflows` in `backend/app/services/workflows.py` to add JSON-based filters (see Discord guild / Twitch streamer examples).
- **Timer-based triggers**: extend `TimerWorkflowScheduler` when introducing new scheduling rules (e.g. cron expressions). Always guard against runaway loops by updating `_next_run`.

---

## 6. Documentation checklist

Every contribution that changes behaviour must:

- Update `README.md` (architecture or API tables).
- Record relevant breaking changes in `documentation/AREA_documentation.pdf` (if applicable).
- Note new environment variables in `.env.example`.
- Mention migration steps (SQL, data transforms) in the PR description.

---

## 7. Release process snapshot

1. Merge feature PR into `main`.
2. Tag release: `git tag -a vX.Y.Z -m "Release notes"` then `git push --tags`.
3. Build & publish Docker images or rely on the Compose workflow.
4. Run `docker compose up --build` on the target server and verify `/about.json`.

Thank you for helping us grow the AREA ecosystem! Reach out to the maintainer team via Discord for clarifications before making large architectural changes.
