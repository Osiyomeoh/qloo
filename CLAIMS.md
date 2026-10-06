# CLAIMS

Every public claim must map to code, a test, or a measurement. Status is updated honestly as work lands.

| Claim | Backed by | Status |
|---|---|---|
| Nothing personal is sent to Qloo | `qlooRequest.ts` allowlist + server proxy `src/server/qlooProxy.ts` blocks other params before calling Qloo; tests | built; not yet run against live Qloo |
| Each result is labelled by source (Qloo vs choice) | `app/src/core/profile.ts` + test | built (logic + UI on sample data) |
| Choice session follows published preference-assessment formats (paired, MSWO-style, engagement time) | `app/src/core/session.ts` + tests | built (logic + UI on sample data) |
| App runs end to end on labelled sample data | `app/src/App.test.tsx` click-through test | built |
| Learns from choices (chosen → signal, rejected → excluded) | `nextSignals` + test | built (logic); live Qloo planned |
| Photo → items (vision model lists titles; carer confirms; photo never sent to Qloo, not stored) | `src/server/vision.ts` + tests (model mocked) | built; untested on real photos |
| Photo → items hit rate X% on our 20-photo set | `npm run eval:photos` + `src/eval/metrics.ts` (tested) | script built; needs Sam's 20 photos |
| Qloo vs plain LLM: fewer invented/generic titles | `npm run benchmark` over `eval/seeds.json` (8 cases); `app/eval/results/benchmark-2026-10-06T08-08-42.json` | **run 2026-10-06 (Claude Sonnet 4.6 on Bedrock): not supported.** Qloo 0% unresolved vs LLM 0–30%, but the LLM's misses are mostly real titles under a different name ("Mitchells vs. the Machines", "Angelique Kidjo"), not inventions. Seed-tag overlap: LLM ≥ Qloo in 6 of 8 cases. Do not claim Qloo recommends better than an LLM |
| Pilot: n caregivers, results | Pilot notes; "not a clinical study" | planned (Sam recruits) |

| Agentic: the model chooses each step (Qloo calls, which cards, when to branch or stop) and the person's choices steer it | `app/src/agent/engine.ts`, `unspoken.ts`; tests with a scripted model, incl. full UI → handler → loop | built; Bedrock access verified 2026-10-06 (only Sonnet 4.6 and Haiku 4.5 are enabled on the account, so the default is `us.anthropic.claude-sonnet-4-6`); the Unspoken agent itself not yet run end to end on the real model |
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
