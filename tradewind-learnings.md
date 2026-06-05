# Tradewind - Product Learnings & Strategic Notes

A distillation of the thinking from designing this system. This is the *why* behind the product, not the build instructions (those live in the build spec).

## What Tradewind is

Not a "proposal builder." It's the **embeddable front door** for an HVAC contractor's website that triages every visitor by intent - repair, replacement, or not-sure - and turns each into a qualified lead, producing an instant Good·Better·Best proposal with a monthly payment when replacement is the answer.

The one-line identity that drove every decision: a smart intake that triages all traffic and produces a proposal when replacement is the right call.

## The competitor (Contractor Commerce)

ConCom is the reference point, and studying it was more useful than copying it.

- It is a **commerce / fulfillment platform wearing a proposal-flow hat.** Underneath the flashy Good·Better·Best demo sits drop-ship filters, will-call pickup, wholesale orders, branded packing slips, payouts, coupons, SPIF tracking. The proposal UX is its least-defended surface; the moat is fulfillment + payments + catalog.
- Most of its differentiation budget goes to an **AI persona** (custom agent name, avatar, tone controls). But the actual flow is a themed decision tree - a wizard in a chatbot costume. The "AI salesperson" is sizzle sold to the contractor, not necessarily value to a homeowner making a $10k decision.
- **Memberships / subscriptions are core** to it - they understand recurring revenue.
- **Financing is a single checkbox** in its entire feature matrix.
- Monetization: **GMV tax** - 1.5-2.5% digital sales commission + $750-2,250/mo + a $2,250 setup fee. It earns only when the transaction runs through its checkout.

Structural limit: it only catches people already at the bottom of the funnel - replacement shoppers ready to buy a box.

## Core product insights

**1. Almost none of the intake fields are needed to produce the proposal.** Strictly for the math, the only real input is **square footage** (→ tonnage → price). Everything else does a different job:
- Priority → moves the "Your pick" recommendation, not the price.
- Current system type → scope of what's being replaced (not yet wired to price).
- System age → lead qualification / urgency.
- Stories, year built → trust ("we found your home").
- Contact info → the actual capture.

**2. The intake is a conversion funnel, not a data form.** The multi-step flow exists because each easy tap is a micro-commitment that makes the person far likelier to give a phone number at the end. The data is almost a byproduct. Copying a competitor's fields "because the proposal needs them" is the wrong reason.

**3. The pricing gate is the engine.** Hiding price until contact is the lead-capture mechanism - the contractor's whole ROI. Show price freely and a price-shopper takes the number and leaves with no contact info. But the gate has real costs: it can read as bait-y (especially in HVAC, where buyers are burned by opaque pricing), and what we're gating is a rough sqft-based estimate, not a binding quote. So:
- Gating should be a **contractor setting**, not hardcoded: open / show-range-gate-detail / full gate.
- Strong default: **show the range openly, gate the tailored options + monthly payments.** Keeps trust, still captures.

The "how many fields" and "why gate" questions collapse into one identity decision: transparent estimate widget vs lead-gen funnel.

## The wedge / differentiation

**4. Job type is the question that should come first - the router.** Repair / replace / not sure. Most HVAC inbound is not replacement shoppers; it's "my system stopped working." Forcing that person through a $10k GBB flow mismatches intent and loses them. Job type decides whether the proposal even applies, and it gives system age a real job (an old system with a serious symptom tilts toward replacement; a young one toward repair).

**5. Be the single front door for ALL traffic.** A contractor runs one set of ads and one website CTA. ConCom converts only replacement shoppers, so the majority of that traffic - repair, diagnostic, maintenance - leaks. Capturing it from the same ad spend is the unsexy ROI argument that sells itself.

**6. But the differentiation is NOT "we also do repair."** A generic repair form is a commodity (every FSM tool already books service). The real differentiator is the **not-sure majority**: take the person who doesn't know what they need, triage them, and for borderline cases show the replacement range + financing so the tech arrives to a primed homeowner. That is the path ConCom structurally cannot touch without abandoning what it is.

**7. Don't chase ConCom's breadth.** Memberships, drop-ship filters, coupons, SPIFs, email marketing - matching that feature-for-feature is a multi-year trap. Win the wedge (triage + clean instant proposal), then surround it. The only things that genuinely beat ConCom are the triage router and the clean proposal experience.

**8. We don't need a chatbot.** A fast, clean structured flow probably converts better than a conversational UI for a considered $10k purchase, and it's far cheaper to run.

## Business-model thesis (the monetization angle)

ConCom taxes GMV and treats financing as plumbing. The inverted position: **monetize the financing origination, not the transaction.** Consequences:
- A deal pays whether it closes online or in the homeowner's living room - revenue isn't chained to a checkout.
- No need to tax the contractor's jobs. The pitch: *"we don't take a percentage of your sales."* Lean SaaS fee, financing carries the economics. A structural cost advantage a commerce platform can't copy without becoming a lender.
- Caveat: cash/card deals don't monetize on the financing rail, so keep a modest base fee for non-financed jobs.
- The triage funnel raises financing attach rate - funnel and monetization reinforce each other. The repair traffic ConCom leaks is, on this model, leaked financing applications.

## What to steal vs ignore from ConCom

- **Steal:** Quote Compare (upload a competitor's quote, reposition against it) - sharp lead capture and a natural financing hijack ("that's the cash price; here's the same job at $X/mo"). Energy rebates paired with financing in the affordability story.
- **Ignore:** the AI persona arms race, the full commerce/fulfillment suite, deep email-marketing tooling.
- **Beat:** financing (their single checkbox vs a real financing layer) and intent coverage (replacement-only vs the full repair/replace/triage spectrum).

## MVP scope (decided)

In: triage router (repair/replace/unsure) with triage as hero; address → property lookup → sqft; instant GBB proposal with monthly payment + comparison; configurable pricing gate (default: show range); repair → diagnostic booking; optional photo upload; bring-your-own-calendar scheduling; lead inbox + full lead detail + status; lightweight dashboard; new-lead notifications; embed code.

Out (deliberate): accounts/auth/locations/users (Phase 2, and the bridge to selling it as SaaS); cart/checkout/payment (Phase 2+); the commerce breadth; AI chatbot; deep FSM integrations; scope-based pricing, rebates, Quote Compare (all fast-follows once the loop converts).

Minimum test to prove the thesis: triage router → GBB proposal with monthly payment → gated lead capture → lead inbox with detail. The smallest thing that answers "do contractors want a front door instead of a store?"

## Property lookup (how it really works)

Two layers, not one:
1. **Address validation / autocomplete** - Google Places (or Smarty). Clean canonical address.
2. **Property characteristics** (sqft, stories, year built) - a property-data API keyed off the validated address, sourced from county assessor records. RentCast is the cheap, self-serve, no-contract option for MVP; ATTOM / CoreLogic / Smarty are the enterprise tier with broader coverage.

The catch that matters: assessor square footage is frequently stale or missing and varies by county - and sqft drives tonnage drives price. So always let the homeowner confirm/edit, and design for the miss (fall back to "enter approximate square footage"). The lookup is a conversion/wow feature, not a hard requirement; the zero-integration version is just asking for sqft.

## Open questions to validate

- Triage scoring (age weights + symptom scores) - does the repair-vs-replace tilt match real contractor intuition?
- Gate default - confirm "show range" is the right starting posture.
- Recommendation map (priority → tier) - keep fixed, or make it contractor-configurable?
- Scope-based pricing (AC-only vs full changeout) - worth the data-model cost, and when?

## The throughline

Every field and every feature has to earn its place by a clear job. The losing move is cargo-culting the competitor. The winning move is being the one front door that catches everyone, triages the confused majority into primed replacement opportunities, and stays cheap to the contractor because the money is on the rail underneath.
