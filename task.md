# Round 3 — Dashboard/Analytics merge, Log content, Trigger fixes, Template safety, Webhook trigger

Frontend/prototype only, same constraints as prior docs: no backend, no DB, no new npm dependencies, match existing style conventions (`.card`, `CustomSelect`, `lucide-react`, inline style objects).

---

## 1. Merge Dashboard into Analytics

**Current state:** `src/app/page.js` (Dashboard) and `src/app/analytics/page.js` are separate pages with overlapping content — both show KPI cards (Total Dispatched/Delivery Rate vs Analytics' fuller set) and both show a log table (Dashboard: 8 most recent rows, fixed columns; Analytics: full filterable/paginated table). Dashboard already links out to Analytics ("Full Analytics" button, "Explore full logs table" link), so the intent to route people toward Analytics is already there — it's just duplicating content instead of deferring to it.

**Change:** Fold Dashboard into Analytics as the single source of truth for delivery data:
- Make `/analytics` the canonical page. Keep its filters, breakdowns (by Notification / by Trigger), channel deliverability, and full log table as-is.
- Reduce `src/app/page.js` (still the sidebar's "Dashboard"/home entry) to a **true landing page**, not a second metrics view: a short welcome/summary line, then quick-link cards into Templates, Triggers, Notifications, Organization, and Analytics (reuse the card style already used elsewhere, e.g. `organization/page.js`'s list-item cards). If a single top-line number is wanted on the home page (e.g. "128 dispatches today"), pull it from the same computation Analytics already does — don't maintain a second parallel calculation of `dispatchMap`/`deliveryRate` (right now that logic is duplicated near-verbatim between `page.js` and `analytics/page.js`; if kept in both, extract it into a shared helper, e.g. `src/lib/logStats.js`, and import it in both places instead of copy-pasting).
- Remove the now-redundant "Recent Delivery Events" table and its own date-range pill switcher from `page.js` entirely — that's what Analytics' full log table replaces.

---

## 2. Give seeded logs real payload content

**Current state:** `LogDetailModal.jsx` already renders `log.payload` (including HTML rendering via `dangerouslySetInnerHTML` when it looks like markup) — this works correctly for logs created by any of the three existing "send test" flows (`template/page.js`, `notifications/add/page.js`, `notifications/page.js`), which all populate `payload` with the real rendered content. The problem is the **seed data**: the hardcoded `logs: [...]` arrays inside `NotificationContext.jsx` (there are several, one per company) were written before the payload feature existed, so none of them have a `payload` field — meaning clicking "View" on any non-test historical log shows all the metadata but never the actual message content.

**Change:** For every entry in every seeded `logs` array, add a `payload` field:
- For `serviceType: "Email"` entries, generate a small rendered HTML snippet consistent with that log's `notificationId`/`templateId` (pull the matching notification/template's real `emailContent` where one exists and substitute sample variables, same substitution helper already used by the test-send flows — reuse `substituteVariables`/`renderSubstitutedEmail`, don't write a new one).
- For `serviceType: "SMS"` entries, do the same against the matching template/notification's SMS text.
- For App/Mobile notification entries, use the matching `appTextContent` (or a short placeholder like `Opened screen: <screen name>` for App Screen–type actions, matching the existing test-send fallback pattern in `notifications/add/page.js`).
- Where a log's `notificationId`/`templateId` doesn't cleanly match anything (some seed rows may be loosely made up), it's fine to write a plausible placeholder payload rather than leaving it blank — the goal is that "View" never shows an empty content section for a real log again.

This pairs with the §4 mock-data-expansion item from the first change doc (the 30-day log spread) — do them together if that hasn't shipped yet, since both touch the same seed arrays.

---

## 3. Fix the Trigger creation flow

**Current state (`src/app/trigger/page.js`, "Some Platforms" branch, ~line 380-425):** when a trigger's scope is "Some Platforms," the condition row shown (`Platform Name` / `equals` / platform multiselect) has its first two dropdowns **non-functional** — hardcoded `value="Platform Name"` and `value="equals"` with `onChange={() => {}}`. Only the third control (the platform multiselect) actually does anything. This is very likely the "something feels missing" — the row *looks* like a real condition builder but two-thirds of it can't be touched.

**Changes:**
- Make the "Platform Name" field a real `CustomSelect` bound to state (e.g. `triggerFilterField`), with a sensible option set for what you can actually filter a trigger by (start with `["Platform", "Service", "User Type"]` — extend later as needed).
- Make the "equals" operator field a real `CustomSelect` bound to state (`triggerFilterOperator`), options `["equals", "contains"]` (already listed, just wire it up).
- Persist both into the saved trigger object in the `addTrigger(...)` call (currently `filterField`/`filterCondition` are synthesized from `triggerScope` alone — replace that with the real field/operator/value the user picked).
- Add a short **Description** textarea to the Trigger Configuration panel (there's currently no way to leave a note on what a trigger is for — every other object in this app — templates, notifications — has a description field; triggers don't).
- Once §5 (webhook trigger) is added, make sure selecting "Webhook" as the trigger type swaps this whole "fires on" section for the webhook-specific config described in §5, rather than showing the (irrelevant) Platform/scope controls.

---

## 4. Warn before a template selection overwrites edited content

**Current state (`src/app/notifications/add/page.js`, Template `CustomSelect` `onChange`):** selecting a template unconditionally overwrites `emailSubject`, `emailContent`, `smsContent`, `appTextContent` with that template's content — no check for whether the current content has already been hand-edited, and nothing on screen afterward indicates the notification's content has diverged from its source template.

**Changes:**
- Track whether content has been manually edited since the last template selection (e.g. a `contentDirty` boolean, set `true` on any `emailContent`/`smsContent`/`appTextContent` change, reset to `false` right after a template is applied).
- If the user picks a (different) template while `contentDirty` is true, show a confirm step before overwriting — a simple `window.confirm`-style guard is fine for a prototype, or a small inline confirmation row ("Replace your edited content with this template? [Replace] [Cancel]") if you want it to match the app's modal style more closely.
- Add a small "Modified from template" badge near the Template select once `contentDirty` is true, so it's visible at a glance that what's about to be saved differs from the source template — this is the main thing that was actually missing (the editing itself is correct behavior; the silent-overwrite risk and lack of any signal were the bugs).

---

## 5. Add "Webhook" as an inbound trigger type

**Current state:** Organization → Edit already has a full **outbound** webhook feature (a webhook MantraCare calls out to when a delivery event happens — name, service, event, HTTP method, URL, content type, JSON payload template, enabled toggle; see `organization/edit/page.js`). That's a different direction from what's needed here: an **inbound** trigger, where an external system calls *into* MantraCare to kick off a notification (e.g. a payment provider posting "order completed"). Don't reuse that component as-is — the concept is inverted — but its modal layout/field styling is a good visual reference.

**Changes:**
- Add `"Webhook"` to the Event Types list in the "Choose trigger type" drawer (`trigger/page.js`, ~line 448) — this was already spec'd in the previous change doc; confirmed it hasn't shipped yet, still needed.
- When `selectedTriggerType === "Webhook"`, replace the "This trigger fires on" (All/Some Platforms) section in the Trigger Configuration panel with webhook-specific fields:
  - A **read-only generated endpoint URL** for this trigger (prototype can fake it, e.g. `https://hooks.mantra.care/t/<generated-id>`), with a copy-to-clipboard button (matches the pattern already used elsewhere in the app for copyable values, if any exists — otherwise a plain button + `navigator.clipboard.writeText` is fine).
  - A **Secret/Signing Key** field (masked input, generate a placeholder value, with a "Regenerate" button — mirrors how API keys are typically shown; no real security implementation needed since this is a prototype).
  - Optionally, a small read-only "Expected payload" JSON example block, for documentation purposes only (matches the spirit of the outbound webhook modal's payload textarea, just descriptive rather than editable here).
- These fields are prototype-only (no real endpoint is created) — make that implicit through the UI rather than adding a disclaimer banner; e.g., the generated URL can simply be inert.

---

## Non-goals

- No backend/API, no persistence beyond `NotificationContext.jsx`
- No real webhook receiving/sending, no real HMAC/secret validation
- No new npm dependencies
- No changes to Template list, Organization list, or the Notifications add-form sections already covered in the previous two change docs (Chat Message/Service/AI Therapist, Trigger Conditions builder, Send Timing reposition)

## Definition of done

- [ ] `/analytics` is the single source of truth for KPIs/log data; `page.js` (Dashboard) is a lightweight landing page with quick links, no duplicated metrics logic
- [ ] Shared log-stats calculation extracted instead of duplicated between Dashboard and Analytics (if both still compute anything)
- [ ] Every seeded log entry across all companies has a real `payload` so "View" always shows what was actually sent
- [ ] Trigger creation's Platform/operator condition dropdowns are functional and persisted on save
- [ ] Trigger creation has a Description field
- [ ] Selecting a template with unsaved edits present prompts before overwriting, and a "Modified from template" indicator shows once content diverges
- [ ] "Webhook" appears in the trigger type drawer and shows dedicated inbound-webhook config (URL, secret, expected payload) instead of the Platform scope UI
- [ ] No new npm dependencies were added