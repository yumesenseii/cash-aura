# Cashora Manual QA Checklist

Manual Pass/Fail tests for the Cashora PWA (physical cash companion — **not** a wallet or bank app).

**How to use**

1. Run `npm run dev` and open the app (usually `http://localhost:3000` or `3001`).
2. For a clean onboarding test, clear site data for localhost (or use Profile → Reset).
3. Mark each **Result** as `PASS` or `FAIL`. Add a short note if FAIL.

**Scoring**

- **Demo-ready:** TC01–TC08, TC10–TC11, TC14–TC15, TC18–TC20 all PASS  
- **Strong MVP:** also TC09, TC12–TC13, TC16–TC17 PASS  
- Core money math failures (TC03–TC06) = not ready  

---

## Test cases

| ID | Area | Test case | Steps | Expected | Result |
|----|------|-----------|-------|----------|--------|
| TC01 | Landing | Open landing | Go to `/` | Shows Cashora name, tagline, Open Cashora CTA, iPhone install tips | ☐ PASS ☐ FAIL |
| TC02 | Onboarding | First-time setup | Clear site data → open `/app` → complete onboarding (name + starting cash; optional goal/savings) | Lands on Home with starting cash on timeline | ☐ PASS ☐ FAIL |
| TC03 | Home | Safe to Spend math | Set starting ₱500 → save ₱100 → spend ₱50 | Safe to Spend shows ₱350 (Starting − Spent − Saved) | ☐ PASS ☐ FAIL |
| TC04 | Home | Add expense | Home → + Add Expense → enter amount + category → Save | Timeline shows expense; Spent updates; Safe to Spend decreases | ☐ PASS ☐ FAIL |
| TC05 | Home | Add savings | Home → + Add Savings → amount → select goal (if any) → Save | Timeline shows savings; Saved updates; linked goal progress increases | ☐ PASS ☐ FAIL |
| TC06 | Home | Persistence | Log expense/savings → refresh the page | Data still present (local storage) | ☐ PASS ☐ FAIL |
| TC07 | History | Filters | Open History → change Period, Type, Category dropdown, and Search | Filtered list updates correctly; no crash; no horizontal chip clutter | ☐ PASS ☐ FAIL |
| TC08 | History | Grouped day view | With at least one day’s logs | Day groups show Starting Cash → transactions → Ending Cash | ☐ PASS ☐ FAIL |
| TC09 | History | Edit / delete transaction | Tap an expense → Edit amount → Save; then open again → Delete | Amount updates; delete removes transaction and updates totals | ☐ PASS ☐ FAIL |
| TC10 | Goals | Create goal | Goals → Create → name, target, current, date, category → save | Goal appears under Active; pace hint shows if target date set | ☐ PASS ☐ FAIL |
| TC11 | Goals | Add to goal | Open goal card → Add Savings → amount | Goal progress, remaining, and milestones update | ☐ PASS ☐ FAIL |
| TC12 | Goals | Complete goal | Add savings until current ≥ target | Goal moves to Completed section | ☐ PASS ☐ FAIL |
| TC13 | Goals | Edit / delete goal | Edit goal name/target; Delete another (or same) goal | Edits persist; delete removes goal | ☐ PASS ☐ FAIL |
| TC14 | Insights | Narrative & charts | Open Insights with some week activity | Shows week story, activity chart, spent/saved, categories or empty guidance | ☐ PASS ☐ FAIL |
| TC15 | Profile | Settings | Change display name, allowance rhythm, reminder → refresh | Values persist | ☐ PASS ☐ FAIL |
| TC16 | Profile | Export backup | Profile → Export backup (JSON) | JSON file downloads | ☐ PASS ☐ FAIL |
| TC17 | Profile | Reset data | Profile → Reset all data → confirm | Returns to onboarding; previous logs cleared | ☐ PASS ☐ FAIL |
| TC18 | Nav | Bottom navigation | Tap Home, History, Goals, Insights, Profile | Each page opens; nav stays visible (except onboarding) | ☐ PASS ☐ FAIL |
| TC19 | Identity | Not a bank / wallet | Skim Landing, Home, Profile About/FAQ | Messaging is cash companion; not GCash/Maya/bank/wallet claims | ☐ PASS ☐ FAIL |
| TC20 | Build | Production build | From project root: `npm run build` | Build completes with exit code 0 and no TypeScript errors | **PASS** |

---

## Tester notes

| Field | Value |
|-------|--------|
| Tester name | |
| Date | |
| Browser / device | |
| App URL | |
| Build TC20 (automated check) | **PASS** — `npm run build` exit 0 (Next.js 16.3.4, TypeScript OK) |
| Overall | ☐ Demo-ready ☐ Strong MVP ☐ Not ready |
| Failures / bugs | |

---

## Automated tests

Unit tests (Vitest) cover core logic in `src/lib/utils.ts`:

```bash
npm test
```

Mapped roughly to: TC03 (Safe to Spend), category mapping, goal remaining/pace/milestones, `formatPeso`.

### Playwright later (TC01–TC18)

Browser E2E can automate UI flows from this checklist:

1. Add Playwright (`npx playwright install`)
2. Seed/clear `localStorage` per test
3. Cover landing → onboarding → Home expense/savings → History edit → Goals CRUD → Profile export

Keep unit tests for math; use Playwright for navigation and forms.

---

## Product reminder

Cashora tracks **physical cash** (baon / allowance).  
Tagline: *Your everyday cash, made visible.*  
*Not a wallet. Not a bank. Your cash companion.*
