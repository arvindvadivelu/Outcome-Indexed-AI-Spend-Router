# Outcome-Indexed AI Spend Router — Workflow Audit & Continuous Debugging Registry

This registry tracks application workflows across full-stack debugging and verification iterations.

---

## Workflow Registry

### WF-001
- **Page / Route**: `/api/v1/feedback/outcome`, `/api/feedback/outcome`, `/api/v1/outcomes`, `/v1/outcomes`
- **User Action**: Automated SDK callback or manual feedback submission recording binary task outcome (success/failure) for a routed request.
- **Expected Behavior**: Record outcome trace, compute Bayesian Thompson posterior updates (alpha/beta Dirichlet parameters), update Pareto leaderboard rankings, and return status 200 with updated priors.
- **Actual Behavior**: Previously returned 404 on some aliased endpoints or lacked live Thompson Sampling recalculation.
- **Root Cause**: Missing dedicated route handler and endpoint aliasing for SDK interoperability.
- **Files Involved**: `src/app/api/v1/feedback/outcome/route.ts`, `src/app/api/feedback/outcome/route.ts`, `src/app/api/v1/outcomes/route.ts`, `src/app/v1/outcomes/route.ts`
- **Fix Applied**: Implemented canonical route handler and aliased proxy handlers with live Beta-distribution posterior updates.
- **Test Performed**: Automated test suite `scripts/verify-all-endpoints.mjs` (Suite 1: POST /api/v1/feedback/outcome).
- **Verification Status**: VERIFIED

---

### WF-002
- **Page / Route**: `/v1/chat/completions` & `/api/v1/chat/completions`
- **User Action**: Drop-in OpenAI-compatible client sending chat completion requests with optional `stream: true`.
- **Expected Behavior**: Return outcome-indexed headers (`X-Outcome-Cost-Usd`, `X-Outcome-Routed-Model`, `X-Outcome-Win-Rate-Pct`, `X-Outcome-Escrow-Status`) and deliver real Server-Sent Events (SSE) chunks when streaming.
- **Actual Behavior**: Missing standard outcome response headers and SSE streaming was previously incomplete.
- **Root Cause**: Streaming branch lacked chunk generator and headers were not appended to streaming response object.
- **Files Involved**: `src/app/v1/chat/completions/route.ts`, `src/app/api/v1/chat/completions/route.ts`
- **Fix Applied**: Built complete chunked SSE streamer with standard headers.
- **Test Performed**: Automated test suite `scripts/verify-all-endpoints.mjs` (Suites 2 & 3: standard and streaming completions).
- **Verification Status**: VERIFIED

---

### WF-003
- **Page / Route**: `/api/benchmarks`
- **User Action**: Frontend dashboard or API client fetching real-time Pareto-frontier model benchmark statistics.
- **Expected Behavior**: Return JSON list of models with live win-rates, Pareto tier classification, cost per 1k tokens, and Thompson sampling scores.
- **Actual Behavior**: Route previously missing, causing benchmark table to fall back to static data.
- **Root Cause**: Dedicated API route `/api/benchmarks` was not implemented.
- **Files Involved**: `src/app/api/benchmarks/route.ts`
- **Fix Applied**: Created dynamic benchmark route exposing Pareto frontier calculations.
- **Test Performed**: Automated test suite `scripts/verify-all-endpoints.mjs` (Suite 4: GET /api/benchmarks).
- **Verification Status**: VERIFIED

---

### WF-004
- **Page / Route**: `/api/v1/health`
- **User Action**: Load balancer / Kubernetes health check polling cluster status.
- **Expected Behavior**: Return HTTP 200 with `{ status: "ok", gateway: "healthy" }`.
- **Actual Behavior**: Route returned 404 because health check was only under `/api/health`.
- **Root Cause**: Missing `/api/v1/health` alias for enterprise gateway clusters.
- **Files Involved**: `src/app/api/v1/health/route.ts`
- **Fix Applied**: Added `/api/v1/health` endpoint returning system readiness and uptime.
- **Test Performed**: Automated test suite `scripts/verify-all-endpoints.mjs` (Suite 5: GET /api/v1/health).
- **Verification Status**: VERIFIED

---

### WF-005
- **Page / Route**: `/api/billing/forecast`
- **User Action**: FinOps dashboard requesting budget projections with custom query params `?budget=...&mode=...`.
- **Expected Behavior**: Return dynamic forecast calculating projected spend, burn ratio, and exhaustion date for provided parameters.
- **Actual Behavior**: Query parameters were ignored, always calculating forecast against hardcoded defaults.
- **Root Cause**: Route did not parse `searchParams` from URL.
- **Files Involved**: `src/app/api/billing/forecast/route.ts`
- **Fix Applied**: Extracted query params and parameterized calculation engine.
- **Test Performed**: Automated test suite `scripts/verify-all-endpoints.mjs` (Suite 6: GET /api/billing/forecast).
- **Verification Status**: VERIFIED

---

### WF-006
- **Page / Route**: `/api/payments/verify-utr`
- **User Action**: Customer submits a bank wire / UPI UTR transaction reference with custom plan tier and currency.
- **Expected Behavior**: Verify transaction, update user's plan tier and monthly token quota in `users.json`, sync event to Google Sheets ledger, and return status 200.
- **Actual Behavior**: Plan tier defaulted to static `growth` regardless of user's selected tier.
- **Root Cause**: `verify-utr` route payload lacked dynamic `planTier` parameter extraction.
- **Files Involved**: `src/app/api/payments/verify-utr/route.ts`
- **Fix Applied**: Enabled dynamic plan tier and currency assignment with quota calculation and Google Sheets webhook sync.
- **Test Performed**: Automated test suite `scripts/verify-all-endpoints.mjs` (Suite 7: POST /api/payments/verify-utr).
- **Verification Status**: VERIFIED

---

### WF-007
- **Page / Route**: App Console (`SimulateRequestModal.tsx`)
- **User Action**: User simulates a request in modal and clicks "Report Outcome (Success / Failure)".
- **Expected Behavior**: Send live feedback payload to `/api/v1/feedback/outcome`, update local Bayesian priors, and update global store.
- **Actual Behavior**: Previously only updated local React state without network request.
- **Root Cause**: Modal had simulated timeout instead of real `fetch("/api/v1/feedback/outcome")`.
- **Files Involved**: `src/components/SimulateRequestModal.tsx`
- **Fix Applied**: Connected feedback buttons to live `/api/v1/feedback/outcome` endpoint.
- **Test Performed**: Component verified with active mock/network payload test.
- **Verification Status**: VERIFIED

---

### WF-008
- **Page / Route**: `/app/logs`
- **User Action**: User views historical request logs and updates outcome status from table row.
- **Expected Behavior**: Transmit outcome feedback to `/api/v1/feedback/outcome` and update telemetry store in real time.
- **Actual Behavior**: Handlers were local-only stubs.
- **Root Cause**: Missing API integration in log list component.
- **Files Involved**: `src/app/app/logs/page.tsx`
- **Fix Applied**: Connected table actions to live feedback API with Bayesian score recalculation.
- **Test Performed**: Component verified with log update flow.
- **Verification Status**: VERIFIED

---

### WF-009
- **Page / Route**: `/auth/reset-password`
- **User Action**: User navigates directly to reset password page or refreshes browser during reset flow without `?email=` in URL.
- **Expected Behavior**: Display email input field to allow user to specify registered email, validate non-empty email format, update security PIN in backend database via `/api/auth/session`, sync to Google Sheets, and redirect to sign-in.
- **Actual Behavior**: `email` state was initialized to empty string `""`, causing submission to fail with HTTP 400 "Email parameter is required".
- **Root Cause**: Component assumed `email` query parameter would always be present and lacked fallback input.
- **Files Involved**: `src/app/auth/reset-password/page.tsx`
- **Fix Applied**: Added email query parameter detection, conditional fallback email input field, input validation, and clear error messaging.
- **Test Performed**: Build verification and validation tests.
- **Verification Status**: VERIFIED

---

### WF-010
- **Page / Route**: `/auth/signup` & `/api/auth/register`
- **User Action**: New user fills name, email, workspace, plan tier, and 6-digit PIN to register organization.
- **Expected Behavior**: Server creates user record with default API key in `users.json`, returns full user payload including `apiKeys`, and client store initializes `apiKeys` in Zustand state so `/app/keys` displays keys immediately without page reload.
- **Actual Behavior**: Server created initial API key on disk but omitted `apiKeys` in response payload; client store did not set `apiKeys`, leaving client store's key list empty on first navigation to `/app/keys`.
- **Root Cause**: Omission of `apiKeys` in `/api/auth/register` response JSON and missing `apiKeys` setter in `signup/page.tsx`.
- **Files Involved**: `src/app/api/auth/register/route.ts`, `src/app/auth/signup/page.tsx`
- **Fix Applied**: Added `apiKeys: user.apiKeys || [initialKey]` to response in `register/route.ts` and wired `apiKeys: data.user.apiKeys || []` in `signup/page.tsx`.
- **Test Performed**: Build verification and registration endpoint flow.
- **Verification Status**: VERIFIED

---

### WF-011
- **Page / Route**: App Header (`AppHeader.tsx`), Sidebar (`AppSidebar.tsx`), Settings (`SettingsPage.tsx`)
- **User Action**: User toggles currency switch ($ USD ↔ ₹ INR).
- **Expected Behavior**: Currency preference updates immediately across all UI calculations and is automatically persisted to backend `/api/auth/session` so that refreshing or logging in on another device preserves currency selection.
- **Actual Behavior**: `toggleCurrency()` and `setCurrency()` only updated client-side Zustand store; backend user record remained with stale currency.
- **Root Cause**: Store actions lacked bidirectional synchronization call to `/api/auth/session`.
- **Files Involved**: `src/lib/store.ts`
- **Fix Applied**: Added `syncUserSession` helper in `src/lib/store.ts` to automatically persist currency changes to `/api/auth/session`.
- **Test Performed**: State change and session persistence validation.
- **Verification Status**: VERIFIED

---

### WF-012
- **Page / Route**: `/app/routing` (`RoutingRules`)
- **User Action**: User creates, enables/disables, deletes, reorders, or updates model priorities for routing rules.
- **Expected Behavior**: Routing rules state is updated in memory and instantly synchronized to `/api/auth/session` and `users.json`.
- **Actual Behavior**: Modifications were only saved to local storage, not synced to backend user account database.
- **Root Cause**: Store actions `addRule`, `toggleRule`, `deleteRule`, `reorderRule`, `updateRulePriority` lacked backend sync calls.
- **Files Involved**: `src/lib/store.ts`
- **Fix Applied**: Wired `syncUserSession(state.user?.email, { rules: updated })` to all rule mutation actions.
- **Test Performed**: Verified rule mutation methods invoke session sync.
- **Verification Status**: VERIFIED

---

### WF-013
- **Page / Route**: `/app/settings/api-keys`
- **User Action**: User creates new gateway API key, deletes key, revokes key, or updates rate limits.
- **Expected Behavior**: API key array in `users.json` is updated in real time.
- **Actual Behavior**: Keys created via UI remained in browser localStorage and were not persisted to server database.
- **Root Cause**: Store actions `createApiKey`, `deleteApiKey`, `revokeApiKey`, `updateApiKeyRateLimit` lacked backend session sync.
- **Files Involved**: `src/lib/store.ts`
- **Fix Applied**: Wired `syncUserSession(get().user?.email, { apiKeys: updatedKeys })` to all API key mutations.
- **Test Performed**: Verified key creation and deletion trigger session sync.
- **Verification Status**: VERIFIED

---

### WF-014
- **Page / Route**: App Header Edit Profile Modal (`AppHeader.tsx`)
- **User Action**: User opens "Edit Profile & Credentials" modal and updates name, email, or 6-digit security PIN.
- **Expected Behavior**: Submitting form updates name and security PIN in `users.json` database.
- **Actual Behavior**: PIN input was present in modal UI but ignored in `handleSaveProfile` request payload.
- **Root Cause**: `body: JSON.stringify({ email: user.email, name: editName.trim() })` omitted `pin: editPin.trim()`.
- **Files Involved**: `src/components/AppHeader.tsx`
- **Fix Applied**: Added `...(editPin.trim().length === 6 ? { pin: editPin.trim() } : {})` to request payload.
- **Test Performed**: Verified profile save payload contains PIN.
- **Verification Status**: VERIFIED

---

### WF-015
- **Page / Route**: `/app/settings` & FinOps Controls
- **User Action**: User adjusts monthly budget ceiling, auto-pilot pacing strategy, or differential privacy ε.
- **Expected Behavior**: Updated parameters are saved to backend session and reflected across all telemetry calculations.
- **Actual Behavior**: Some store-level changes did not automatically dispatch to `/api/auth/session`.
- **Root Cause**: `setMonthlyBudget`, `setAutopilotMode`, `setWebhookConfig`, `setFederationWeight`, `toggleFederation` lacked direct session sync.
- **Files Involved**: `src/lib/store.ts`, `src/app/app/settings/page.tsx`
- **Fix Applied**: Wired store setters to `syncUserSession`.
- **Test Performed**: Verified settings update flow and build.
- **Verification Status**: VERIFIED

---

## Run History

### Run 01
- **Focus Area**: Real-time Backend Endpoints, Thompson Sampling Feedback, SSE Streaming & Aliasing
- **Fixed Workflows**:
  - `WF-001` (Outcome Feedback API & Dirichlet Posterior Calculation)
  - `WF-002` (Chat Completions Streaming & Standard Outcome Headers)
  - `WF-003` (Pareto Benchmark Leaderboard API)
  - `WF-004` (Cluster Readiness Health Check Alias)
  - `WF-005` (Billing Forecast Dynamic Query Parameters)
  - `WF-006` (Dynamic Plan Tier & Currency UTR Payment Verification)
  - `WF-007` (Request Simulator Feedback Dispatch)
  - `WF-008` (Telemetry Log Outcome Feedback Dispatch)
- **Verified**:
  - 9/9 Automated Endpoint Test Suites (`scripts/verify-all-endpoints.mjs`) passing at 100%.

### Run 02
- **Focus Area**: Authentication Edge Cases, State Synchronization, Cross-Device Persistence & Store Reactivity
- **Fixed Workflows**:
  - `WF-009` (Reset Password direct access & email validation)
  - `WF-010` (Signup initial API key synchronization to client store)
  - `WF-011` (Global Currency preference bidirectional session persistence)
  - `WF-012` (Routing Rules lifecycle backend session persistence)
  - `WF-013` (Gateway API Key lifecycle backend session persistence)
  - `WF-014` (Edit Profile modal Security PIN update persistence)
  - `WF-015` (FinOps Autopilot, Federation & Webhook configuration backend persistence)
- **Verified**:
  - Full TypeScript compilation and production build (`npm run build`).
  - All automated test suites running and passing.
