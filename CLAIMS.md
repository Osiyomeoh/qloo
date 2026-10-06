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
| Photo → items hit rate X% on our 20-photo set | Committed eval script + set | planned (needs set) |
| Qloo vs plain LLM: fewer invented/generic titles | Committed benchmark script | planned (needs key) |
| Pilot: n caregivers, results | Pilot notes; "not a clinical study" | planned (Sam recruits) |

## Never claim
- Therapy, diagnosis, treatment or clinical outcomes.
- That Qloo knows what a person likes. Qloo describes items; the person's choices are the evidence.
- That the combined approach is proven. Each method is established; the combination is new and is being measured.
- Numbers we have not measured.
