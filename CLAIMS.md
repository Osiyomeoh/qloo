# CLAIMS

Every public claim must map to code, a test, or a measurement. Status is updated honestly as work lands.

| Claim | Backed by | Status |
|---|---|---|
| Nothing personal is sent to Qloo | `qlooRequest.ts` allowlist + server proxy `src/server/qlooProxy.ts` blocks other params before calling Qloo; tests | built + tested; every live Qloo call (the browser's `/api/qloo` and the agent's `ServerQlooClient`) goes through `proxyQloo`. **Checked on production** 2026-10-06: a title search returns 200; an insights call with `signal.demographics.age` or a free-text `notes` param is refused with 400 before reaching Qloo. Limit: search sends whatever is typed in the title box (1–120 characters), so a carer who types a name there would send it; the box and hint ask for a title only |
| Each result is labelled by source (Qloo vs choice) | `app/src/core/profile.ts` + test | built (logic + UI on sample data) |
| Choice session follows published preference-assessment formats (paired, MSWO-style, engagement time) | `app/src/core/session.ts` + tests | built (logic + UI on sample data) |
| Standard MSWO assessment after a session (DeLeon & Iwata, 1996): whole array shown, chosen item removed, rest rotated, 3 rounds, a no-choice ends the round; selection % = chosen ÷ times on offer; ties share a rank. Plain code, not the agent: the agent only supplies the items | `app/src/core/mswo.ts` + `mswo.test.ts` (hand-counted cases), `app/src/Mswo.tsx` + `Mswo.test.tsx` | built + tested; run live 2026-10-06 after a Bedrock + Qloo session (6 items, 18 trials, child view used). Not validated with real children or clinicians; the app says one assessment is a snapshot |
| Memory across sessions on this device only (localStorage, Forget button); the next session starts from earlier favourites, and the agent gets a capped summary; assessment results plot as selection % over time | `app/src/core/history.ts` + tests, `App.tsx` `LastTime`/`Trend` | built + tested; checked live 2026-10-06 (reload shows Last time + chart). Only one device; no sharing with school or therapist (planned, not built) |
| App runs end to end on labelled sample data | `app/src/App.test.tsx` click-through test | built |
| Learns from choices (chosen → signal, rejected → excluded) | `nextSignals` + test | built (logic); live Qloo planned |
| Photo → items (vision model lists titles; carer confirms; photo never sent to Qloo, not stored) | `src/server/vision.ts` + tests (model mocked) | built; untested on real photos |
| Photo → items hit rate X% on our 20-photo set | `npm run eval:photos` + `src/eval/metrics.ts` (tested) | script built; needs Sam's 20 photos |
| Qloo vs plain LLM: fewer invented/generic titles | `npm run benchmark` over `eval/seeds.json` (8 cases); `app/eval/results/benchmark-2026-10-06T08-08-42.json` | **run 2026-10-06 (Claude Sonnet 4.6 on Bedrock): not supported.** Qloo 0% unresolved vs LLM 0–30%, but the LLM's misses are mostly real titles under a different name ("Mitchells vs. the Machines", "Angelique Kidjo"), not inventions. Seed-tag overlap: LLM ≥ Qloo in 6 of 8 cases. Do not claim Qloo recommends better than an LLM |
| Pilot: n caregivers, results | Pilot notes; "not a clinical study" | planned (Sam recruits) |

| Agentic: the model chooses each step (Qloo calls, which cards, when to branch or stop) and the person's choices steer it | `app/src/agent/engine.ts`, `unspoken.ts`; tests with a scripted model, incl. full UI → handler → loop | built; Bedrock access verified 2026-10-06 (only Sonnet 4.6 and Haiku 4.5 are enabled on the account, so the default is `us.anthropic.claude-sonnet-4-6`); Unspoken agent run end to end on Sonnet 4.6 + live Qloo 2026-10-06 (`app/scripts/live-agent.ts`, simulated child with a hidden vehicles preference, seed Thomas & Friends): 5 choice trials in ~45s, it found Chuggington (picked 3 times), tested and dropped Peppa Pig on weak engagement, re-queried Qloo with both favourites, and finished with valid ids. Flaw seen: its summary said "6 trials" when there were 5. A simulated person is not evidence about real people |
| Agent cannot show invented items: card ids must come from the carer's seeds or a Qloo result | `present_choice.validate` + `knownIds` + test | built |
| Agent budgets: max 16 model turns, 24 Qloo calls per session; one person-facing action at a time | `engine.ts` + tests | built |
| UI only celebrates favourites the logged choices support | `AgentView.tsx` Finish + test | built |

## Never claim
- Therapy, diagnosis, treatment or clinical outcomes.
- That Qloo knows what a person likes. Qloo describes items; the person's choices are the evidence.
- That the combined approach is proven. Each method is established; the combination is new and is being measured.
- Numbers we have not measured.
| Qloo response shapes match our parsers (search, insights, heatmap) | `RESEARCH.md` → Day-1 live checks | verified live 2026-10-06 |
| Live search: exact titles 15/15 correct; messy titles 3/5, so the carer confirms from the top 3 | `app/scripts/day1.ts` | verified live 2026-10-06 (20 queries; small sample) |
