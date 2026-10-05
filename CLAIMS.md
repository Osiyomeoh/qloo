# CLAIMS

Every public claim must map to code, a test, or a measurement. Status is updated honestly as work lands.

| Claim | Backed by | Status |
|---|---|---|
| Nothing personal is sent to Qloo | `app/src/core/qlooRequest.ts` allowlist + tests | built (builder); proxy planned |
| Each result is labelled by source (Qloo vs choice) | `app/src/core/profile.ts` + test | built (logic); UI planned |
| Choice session follows published preference-assessment formats (paired, MSWO-style, engagement time) | `app/src/core/session.ts` + tests | built (logic); UI planned |
| Learns from choices (chosen → signal, rejected → excluded) | `nextSignals` + test | built (logic); live Qloo planned |
| Photo → items hit rate X% on our 20-photo set | Committed eval script + set | planned (needs set) |
| Qloo vs plain LLM: fewer invented/generic titles | Committed benchmark script | planned (needs key) |
| Pilot: n caregivers, results | Pilot notes; "not a clinical study" | planned (Sam recruits) |

## Never claim
- Therapy, diagnosis, treatment or clinical outcomes.
- That Qloo knows what a person likes. Qloo describes items; the person's choices are the evidence.
- That the combined approach is proven. Each method is established; the combination is new and is being measured.
- Numbers we have not measured.
