# Tradewind - Developer Handoff & Build Spec

## 0. What you're getting

- `tradewind.html` - a single-file runnable prototype of the full experience (contractor Studio + customer Live Form). Open it in any browser; no build step. State persists in `localStorage`.
- `tradewind.jsx` - the same app as a React component, for dropping into a real React/Next project.

This is a **client-only prototype**. It demonstrates the complete UX and business logic, but it has no backend, no auth, and every integration is stubbed. This doc is the punch list for turning it into a real product.

## 1. Target architecture

Three pieces:

- **Embeddable widget** - the customer Live Form. A small JS bundle the contractor drops on their site; it renders the form, themed per contractor, and posts leads to the API.
- **Studio (admin)** - the contractor app: configure packages, pricing, gating, scheduling; view leads + dashboard. Behind auth.
- **Backend API + DB** - tenant config, lead capture, integrations, notifications, analytics.

Recommended (not prescriptive) stack: Next.js for the Studio, a standalone small bundle (Preact or vanilla) for the embeddable widget so it stays light, a Node/TypeScript API, Postgres, hosted on Vercel/Render/Fly. Everything scoped by `contractor_id`.

## 2. What the prototype fakes or hardcodes (the missing list)

1. **Property lookup is mocked.** `lookupProperty()` hashes the address into fake sqft/stories/year. Replace with a real lookup (see §5).
2. **No persistence backend.** Config + leads live in `localStorage`. Needs DB + API (see §3, §4).
3. **No auth / multi-tenancy.** One hardcoded config. Needs accounts, locations, users, roles, tenant isolation (see §6).
4. **Notifications are not sent.** `notifyEmail` is stored but nothing emails. Wire transactional email + optional SMS (see §5).
5. **Scheduling is fire-and-forget.** The calendar embeds, but "I've booked" is a manual button. Capture real bookings via the provider webhook (see §5).
6. **Financing handoff is a static URL.** `preApprovalUrl` opens a new tab with no context. Productionize with a provider interface (see §5).
7. **Photo upload is name-only.** The file isn't actually uploaded. Needs object storage + scanning + attach to lead.
8. **Recommendation + triage logic are hardcoded constants** - `recommendKey`, `triageIntent`, the priority→tier map, symptom scores. Fine for v1; should become tenant-configurable (see §10).
9. **No validation, sanitization, or abuse protection.** Inputs unchecked; the public form is wide open (see §7).
10. **Dashboard is computed from local leads only.** Real version needs server-side aggregation + funnel events (see §8).
11. **Payments / cart deliberately omitted** - Phase 2+ (see §9).

## 3. Data model

Tenancy & access:
- `contractor` - id, name, slug, branding (logo, accent), notify_email, plan, created_at
- `location` - id, contractor_id, name, address, service_area
- `user` - id, contractor_id, email, role (owner/admin/staff), auth fields

Config (per contractor; per-location optional):
- `package` - id, contractor_id, tier (good|better|best), name, brand, blurb, seer, warranty, base_equipment, per_ton, features[]
- `pricing_config` - contractor_id, sqft_per_ton, install_base, labor_per_ton
- `financing_config` - contractor_id, enabled, apr, term_months, preapproval_url
- `gate_config` - contractor_id, mode (open|range|full)
- `diagnostic_config` - contractor_id, label, fee, waived
- `calendar_config` - contractor_id, provider, url

Leads:
- `lead` - id, contractor_id, location_id, created_at, status (new|quoted|booked), job_type (repair|replace|unsure), intent (replacement|diagnostic), name, email, phone, address, sqft, stories, year_built, system_type, system_age, priority, symptom, photo_url, tons, recommended_tier, selected_tier, diagnostic_fee, consent (text + ip + ts)
- `lead_option` - id, lead_id, tier, brand, name, total, monthly

Events:
- `event` - id, contractor_id, session_id, lead_id (nullable), type, payload, ts

Important: snapshot the proposal numbers onto the lead (`lead_option`). Prices change; the quote the homeowner saw must never silently recompute.

## 4. Backend API (minimum endpoints)

Public (widget; unauthenticated; rate-limited; CORS locked to contractor domains):
- `GET /v1/config/:slug` - public config only (branding, packages, pricing, gate mode, calendar). No secrets.
- `POST /v1/leads` - capture a lead, returns id.
- `PATCH /v1/leads/:id` - update selected tier / status.
- `POST /v1/property-lookup` - `{ address }` → `{ sqft, stories, yearBuilt }` (server-side so the data-API key isn't exposed).
- `POST /v1/photo-upload` - presigned-URL flow.

Authenticated (Studio): CRUD config, list/read leads, dashboard aggregates, user/location management.

Webhooks:
- `POST /v1/webhooks/calendar/:provider` - booking confirmed → mark lead booked.
- `POST /v1/webhooks/financing` - prequal/approval result → enrich lead.

## 5. Integrations

- **Property lookup.** Google Places Autocomplete (client, address) + RentCast (server, characteristics; upgrade to ATTOM/CoreLogic if coverage demands). Always behind a server endpoint to hide the key, cache by normalized address, and fall back to manual sqft entry on miss/null. Treat returned sqft as confirmable, not gospel - it drives tonnage and price.
- **Notifications.** Postmark/SendGrid for the new-lead email to `notify_email`; Twilio optional SMS (homeowner confirmation + contractor alert). Fire on lead create and on booking.
- **Scheduling.** Embed the contractor's link (Calendly/Acuity/Google). To know a visit was truly booked, subscribe to the provider webhook (e.g., Calendly `invitee.created`) and PATCH the lead to Booked. Keep the manual confirm as fallback.
- **Financing handoff (lender-agnostic).** A provider interface taking `{ amount, termMonths, customer }` and returning a hosted apply URL or embedded flow; capture the result via webhook. Do not hardcode a lender.
- **FSM / CRM (later).** Push repair/diagnostic leads into the contractor's dispatch (ServiceTitan, Housecall Pro, Jobber). We capture and route - we do not replace dispatch. Start with a generic webhook + Zapier; native FSM integrations as a fast-follow.

## 6. Multi-tenancy & auth (required to actually sell it)

- Accounts: contractor org → users (owner/admin/staff) → locations.
- Tenant isolation on every query (`contractor_id` scoping). Never trust a client-supplied tenant id on authed routes.
- The public widget resolves tenant by slug and only ever reads public config.
- If pricing tiers by service areas / states / seats (as the market does), enforce those entitlements server-side.
- SSO / SCIM are later, for larger accounts.

## 7. Security, compliance, abuse

- **PII.** Leads hold contact info + home address. Encrypt at rest, restrict by tenant, define retention.
- **Consent / TCPA.** The "agree to receive communications" line is a legal prerequisite for SMS/auto-calls. Store the consent text + timestamp + IP on the lead.
- **Abuse.** Public endpoints are magnets: rate-limit by IP, add a honeypot + invisible captcha (Turnstile/hCaptcha), validate and sanitize all inputs, and cap property-lookup calls per session (cost control).
- **CORS.** Restrict the widget API to each contractor's registered domain(s).

## 8. Analytics / funnel events to instrument

Per session: `form_open`, `job_type_selected`, `address_resolved` (hit/miss), `step_completed{step}`, `pricing_unlocked`, `tier_selected`, `schedule_opened`, `booking_confirmed`. These power real conversion and drop-off, replacing the client-only counts. The two numbers to watch: gate unlock rate and per-step drop-off - that is how you tune the funnel.

## 9. Payments / cart (deferred - Phase 2+)

Out of MVP. When added: deposit or full payment via Stripe (financing / Apple Pay / card), order summary, post-payment scheduling. Revisit once the lead loop is converting.

## 10. Product decisions to lock

- Gate default per tenant (prototype defaults to `range`). Confirm.
- Triage tuning: the `triageIntent` scoring (age weights + symptom scores). Validate against real contractor intuition before launch.
- Recommendation map (priority → tier): tenant-configurable, or fixed for v1?
- Scope-based pricing (AC-only vs full changeout): bigger data model (per-scope package prices). Fast-follow, not v1.
- Quote Compare (upload a competitor quote): fast-follow; needs OCR/extraction.

## 11. Suggested build sequence

1. Backend skeleton + DB + tenant config + public `GET /config`, with the widget reading real config.
2. Lead capture (`POST /leads`) + notify email + Studio lead inbox/detail (replace `localStorage`).
3. Property-lookup endpoint (Places + RentCast) + manual fallback.
4. Auth + multi-tenant Studio (accounts/locations/users).
5. Scheduling webhook → Booked; analytics events + real dashboard.
6. Financing handoff interface; photo upload.
7. Fast-follows: FSM integrations, scope-based pricing, Quote Compare, payments.
