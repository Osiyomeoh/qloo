# PLAN

Working name kept neutral in public until launch. Deadline: **Oct 30 2026 23:45 EDT (Oct 31 04:45 Lagos)**. Main is frozen at the deadline.

## What it does (one line)
Helps people who can't easily say what they like (minimally verbal autistic children, aphasia, profound disabilities) **show** it: Qloo proposes candidates from their existing things, the person chooses, the carer learns.

## Loop
1. **Seed:** carer photographs the person's things (or types titles). Vision model lists candidate items; carer confirms.
2. **Resolve:** Qloo `/search` → entity IDs.
3. **Propose:** Qloo `v2/insights` with `signal.interests.entities` = confirmed seeds, `filter.content_rating`, `filter.exclude.entities` = rejected items. Carer constraints (sensory limits, no loud audio) are applied **in our app**, never sent.
4. **Choose:** 2-card (paired) or 3–4-card (MSWO-style) session. First card is a known favourite. The carer guesses first. We log the choice, engagement seconds, and defined reactions.
5. **Learn:** chosen items become new signals; rejected ones are excluded. Repeat.
6. **Share:** one-page profile, with every line labelled **"Qloo: these items share…"** or **"Shown by choice: picked N of M times"**.

## Safe-use rules (from kit `docs/SAFE_USE.md`) — enforced in code and tests
- Nothing personal goes to Qloo: no name, age, diagnosis, location or photo. The only outbound fields are public entity IDs/names and rating filters. A test asserts the request builder rejects anything else.
- Qloo output describes **items**, never the person. Only choices describe the person.
- Every displayed result carries its source label.
- No health inference, no probability about an individual.

## Architecture
- Web app: Vite + React + TypeScript, mobile-first (the carer uses a phone).
- `src/core/` pure logic, fully tested: session engine, preference ranking, profile builder, Qloo request builder and response parser, constraint filter.
- `src/qloo/`: HTTP client behind an interface; fixture client for tests and offline demo (clearly labelled "sample data").
- Server proxy (one serverless function) holds the Qloo key; the browser never sees it.
- Vision: server function calling a vision model; output is only a list of item names for carer confirmation. Photos are not stored.
- Storage: on device (localStorage) only. No accounts.

## Milestones
| Date | Done when |
|---|---|
| Oct 6–8 | Scaffold, license, CI, tests; session engine + ranking + profile; Qloo request builder with privacy guard; fixture client |
| Oct 9–12 | Session UI (cards, timer, reactions, carer guess); profile export; deploy demo URL |
| Key arrives | Day-1 checks: tag richness on kids' media and older music, search hit rate on noisy titles, images for cards, exclusion params. Record results in RESEARCH.md |
| Oct 13–18 | Live Qloo proxy; photo → items; propose screen; learning loop |
| Oct 19–23 | Benchmark script: LLM-only vs Qloo on the same seeds; 20-photo labelled set hit rate |
| Oct 20–27 | Pilot with 2–3 caregivers (Sam recruits); polish; README with honest built/planned |
| Oct 28–29 | Final checklist; Sam decides on making repo public; submit |
| Oct 30 | Freeze main |

## Demo (first 5 minutes of a new carer)
1. Photo of a shelf → "We found 6 things. Confirm?"
2. "What these items have in common (Qloo)" + 3 new candidates, age-rated.
3. Carer guesses which card he'll pick → he picks → "New favourite found" with engagement time.
4. One-page profile to hand to a teacher.
Side toggle: the same seeds through a plain LLM, showing invented/generic titles.

## Judge path
Live URL opens in **sample mode** with no sign-up, then a "use live Qloo" switch. README: one command to run tests, one to run the benchmark.

## Tests
Unit tests on all `src/core`; privacy-guard test; fixture-based Qloo parser tests; one end-to-end session test; the benchmark is reproducible from a committed script.
