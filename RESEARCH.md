# Qloo Agentic Hackathon: research (phases 1–5)

Researched 2026-10-05. Every fact is cited. "Not stated" means the source doesn't say.

Sources:
- Rules: https://qloo.devpost.com/rules
- Overview: https://qloo.devpost.com/
- API guide: https://docs.qloo.com/reference/qloo-llm-hackathon-developer-guide
- Official kit: https://github.com/qloo/qloo-hackathon-kit (commit 0db91b8)
- Harness package: npm `@qloo/qloo-harness` 0.1.26, published 2026-09-23
- 2025 edition: https://qloo-hackathon.devpost.com/ and its /project-gallery

---

## Phase 1: Rules

| Item | Fact | Source |
|---|---|---|
| Submission period | "September 30, 2026 (9:00 am Eastern Time)" to "October 30, 2026 (11:45 pm Eastern Time)" | rules |
| Deadline in Lagos | **Sat Oct 31, 2026, 04:45 WAT** (EDT is UTC−4, WAT is UTC+1) | computed |
| Earlier work | Allowed, but if the project existed before Sep 30 it "must have Qloo" integrated after the start date. Explain the significant updates made during the period | rules |
| Age | "at least the age of majority where they reside" | rules |
| Countries | Excluded: Brazil, Quebec, Russia, Crimea, Cuba, Iran, North Korea, and OFAC comprehensively sanctioned countries. **Nigeria is not excluded** | rules |
| Students only? | No | rules |
| Team size | No limit stated. You may join several teams. Several submissions are allowed if "substantially different" | rules |
| Required tech | "a working software application that integrates the Qloo API and either functions as an agentic tool, is built using an agent framework, or wires Qloo into an agent you already have." No LLM is required (the 2025 edition required one). Overview: "If your submission would work the same without Qloo, you're building the wrong thing." | rules, overview |
| API key | Request it through the form https://forms.gle/zz12orkLHTAneLGz6. Keys are "typically issued within a few business days." Base URL `https://hackathon.api.qloo.com` only. Legacy `/recommendations` and `/recs` aren't supported | API guide |
| Supported surfaces | `qloo explore`, `qloo exec`, `qloo api`, `qloo mcp` from `@qloo/qloo-harness`. Hosted MCP endpoints and the integrate/plan/build modes are excluded | kit manifest.json, docs/API_ACCESS.md |
| Deliverables | A link to a functional demo; a public repo on GitHub, GitLab or Bitbucket "for judging and testing"; an open-source license file; a text description; free testing access | rules |
| Video | "Demo videos are **not** required" | overview |
| Deck, blog, social bonuses | None stated | rules |
| Changes after the deadline | "Once the Submission Period has ended, you may not make any changes or alterations to your Submission" (except for IP or privacy reasons the sponsor permits). **Freeze `main` and tag it** | rules |
| Prizes | 1st $15,000 · 2nd $6,000 · 3rd $4,000. "Each Project is eligible to win one (1) prize." No category or special awards | rules |

Your action: **request the Qloo API key today.** The form is something you fill in yourself, and keys take "a few business days."

## Phase 2: Judging

- **Stage one, pass/fail:** "baseline viability": the project fits the theme and applies the required APIs.
- **Stage two, equally weighted (25% each), quoted:**
  1. **Technological Implementation:** "How thoroughly and skillfully does the project use Qloo? Does the code reflect genuine effort and a working, non-trivial implementation?"
  2. **Design:** "Does the project deliver a complete, coherent product experience, not just a technical proof of concept?"
  3. **Potential Impact:** "Does the project make a credible, specific case for solving a real problem for a real audience and does the solution actually address that problem based on what's demonstrated?"
  4. **Quality of the Idea:** "Is this a creative, non-obvious use of Qloo and does the team demonstrate genuine understanding of the problem space they're working in?"
- **Tie-breakers:** the criteria in the order above (Tech first), then a judges' vote.
- **Judges** (overview): Jason Calacanis (angel investor), Mike Diolosa (Qloo CTO), Nicole Seligman (OpenAI Board), Todd Boehly (Eldridge Industries), Cedric the Entertainer, Michael Abrams (Live Nation). The rules say the panel "may change."

What each kind of judge rewards (my reading, not stated by the sources):
- **CTO:** depth across Qloo endpoints, correct parameters, a non-trivial pipeline.
- **Calacanis:** a real market and a buyer who would pay.
- **Boehly, Abrams, Cedric:** sports, live events and entertainment.
- **Seligman:** responsible use. This matches the kit's SAFE_USE.md: no inferences about individuals, show provenance.

What a 5/5 looks like, in checkable terms:

| Criterion | 5/5 = |
|---|---|
| Tech | 5 or more distinct Qloo capabilities in one pipeline: search → tags → insights with location/demographic signals → audiences → `analysis/compare` → trending → heatmap. Each result feeds the agent's next step. Measured tests; CI badge; the harness MCP used; graceful errors on quota or auth |
| Design | A live hosted app; one-click judge path into a seeded scenario; finishes as a deliverable (brief, PDF, plan), not raw JSON; every number shows its Qloo source |
| Impact | A named buyer role, a priced pain (hours or $ per decision today), and a demo that reproduces that decision end to end |
| Idea | No rival in the field does it, and it can't be done by a plain LLM. Show side by side: the LLM-only answer vs the Qloo-grounded answer |

## Phase 3: Past winners (Qloo LLM Hackathon 2025)

That edition had 2,847 participants and 344 submissions. Its prizes were a Grand Prize of $10K and three Honorable Mentions of $5K each. **Only 4 winners exist, so a top 10 isn't possible.** Its criteria were LLM use, Qloo integration, technical execution, originality and real-world application, with a video under 3 minutes required.

| Prize | Project | Pitch | Named user | Tech | Repo | Live now? | Qloo files | Test files | Qloo features |
|---|---|---|---|---|---|---|---|---|---|
| Grand | GeoTaste | "transforms location into business insights" | business consultants doing market research for a location | Flask, React, Mapbox, ChatGPT, Railway | github.com/william-Dic/GeoTaste | 404 | 23 | 2 | **heatmap** (247 refs), location filters, tags, insights |
| HM | Resonance AI | "culturally authentic campaign messaging" | political campaign managers | Google ADK, Gemini, Imagen, Streamlit, Cloud Run | github.com/hazardscarn/ResonanceAI | agent 404 · Streamlit 303 | 17 | 0 | **heatmap**, insights, demographics (age, gender, audiences), tags, audiences |
| HM | Zesty | "The Unrecommendation Engine that flips your feed" | people stuck in filter bubbles | Next.js, Gemini, Supabase | github.com/surya4419/Zesty: **repo not found** | 200 | n/a | n/a | n/a |
| HM | Alloy | "The Cultural Due Diligence Engine" | M&A deal makers | FastAPI, Postgres, Next.js, Gemini | github.com/MR-GREEN1337/alloy | 404 | 15 | 5 | search, insights |

Videos: no video URLs were shown on the Devpost pages I fetched.

What the winners had in common:
1. **B2B decision-makers** in 3 of 4 (consultant, campaign manager, M&A). The output is a decision, not a playlist.
2. **Geography and heatmaps** in 2 of 4, including the Grand Prize.
3. **Low test counts** (0–5 files). Last time, tests weren't what separated entries.
4. **A clear "Cultural X" frame**: "Cultural Due Diligence", "culturally authentic messaging".
5. The single consumer winner was a contrarian twist ("unrecommendation"), not a straight recommender.

## Phase 4: Current field

- **543 registered** (overview). The gallery isn't published yet ("The hackathon managers haven't published this gallery yet"). The participant list needs a login.
- **Estimated submissions: about 90–150.** Basis: the 2025 edition converted at 344/2,847 ≈ 12%, which would give about 65. But about 55 public repos already exist in week 1, which points to a higher-intent field. Treat that as an estimate.

## Phase 4b: GitHub crawl

`gh search repos qloo --sort updated` (repos created after Sep 1) and `gh search code hackathon.api.qloo.com`. I cloned 41 rivals blobless into the scratchpad and measured them at HEAD on 2026-10-05.

**Strongest rivals:**

| Repo | Idea | Commits | Qloo files | Harness files | Test files | Qloo features | Live |
|---|---|---|---|---|---|---|---|
| SebAustin/memory-lane | Dementia reminiscence sessions | 24 | 146 | 3 | 80 | compare, heatmap, audiences, insights, tags, trending | memory-lane-filou1.vercel.app |
| Bowen1314/shelfwise | Library readers' advisory (+ Nebius) | 2 | 55 | 16 | 15 | all of the above + 5 harness workflows | — |
| danielhagever/booker | Venue booking by crowd taste | 112 | 25 | 0 | 10 | heatmap, insights, tags | workers.dev |
| danielhagever/newcomer | Find a neighborhood that matches your taste | 59 | 19 | 1 | 11 | heatmap, insights, tags | workers.dev |
| popcorntoocold/sidecar | Local collaboration agent | 14 | 39 | 5 | 15 | — | — |
| Xio-Shark/undercard | Support-act audit vs headliner's fans | 2 | 76 | 13 | 8 | compare_audiences, rank | undercard.wangbohan.biz |
| seypherWork/affinityqa | Profile integrity QA for personalized agents | 3 | 98 | 0 | 11 | insights | — |

**Crowded ideas (avoid):**

| Cluster | Count | Repos |
|---|---|---|
| Group consensus or date night | 9 | squadvibe, tastebridge-ai, common-ground ×2, CommonGround, palatable, afterhours, afterglow, double-bill |
| Marketing, audience or sponsorship briefs | 8 | kindred, adjacent, hayy, audience-brief, sponsorship-scout, cold-open, dealdesk, Quorum |
| Outing or week planners | 7 | tasteroute, taste-concierge, tasteloop, taste-route-agent, tastetable, culture-weave, event-mosaic |
| Relocation or new city | 6 | newcomer, soft-landing, tastes-like-home, tastebridge, home2here, rihla |
| Music booking or touring | 4 | booker, undercard, tour-scout, advance |
| Raw MCP wrappers | 3 | qloo-taste-mcp, NoBanks/qloo-mcp, plus the official kit |
| Dementia or eldercare | 3 | memory-lane, encore, tastetable |

**Barely-used sponsor features**, out of 41 repos:
- `v2/trending`: 2
- harness `qloo_where_popular` / `qloo_trends`: 2
- `v2/audiences`: 4
- `analysis/compare`: 5
- harness MCP at all: 13 repos have any reference
- `urn:heatmap`: 7

The harness's validated workflows were published on Sep 23; per the kit README they are describe, recommend, compare audiences, rank shortlist, trends and where_popular. Using them end to end is new and rare.

**Gaps (no rival found):**
- Sports
- Film and TV distribution or territory sales
- Africa or emerging-market framing
- Podcasts
- Retail merchandising
- An LLM-vs-Qloo "grounding" audit

## Phase 5: Ideas

Scoring: Tech, Design, Impact and Idea are 1–5 each, weighted equally (25% each). Each idea is also scored for Uniqueness (U), Buildability by Oct 30 (B) and Demo in under 3 minutes (D). **Total = mean of the four criteria + 0.25 × (U + B + D)/3.** Weight shown: the criteria are what the judges score; the rest is risk.

| # | Idea: "X for Y" | Named user and pain | Qloo pipeline | Guarantee shown failing safely | Demo number | T | Ds | Im | Id | U | B | D | Total |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Territory: "Bloomberg terminal for film sales agents"** | Adaeze, a Lagos sales agent selling a Nollywood slate to foreign buyers. Today she picks markets by gut feel and pays for festival trips | search → entity → where_popular/heatmap → audiences + demographics → compare vs comps → trending → ranked territory brief with comps per market | **No territory claim ships without a Qloo receipt.** The LLM drafts the pitch; a verifier blocks any sentence whose number or comp isn't in the evidence ledger. On camera: an injected hallucinated comp gets rejected | "Ranks 30 territories for one title in about 60 s; top-3 picks cited to N Qloo calls" | 5 | 4 | 4 | 5 | 5 | 4 | 5 | **5.17** |
| 2 | **Away Day: "scouting report for a club's global fanbase"** | Partnerships manager at a football club opening a new market (e.g. Lagos), choosing pre-season tour cities and local sponsors | where_popular for the club entity → heatmap → audiences → brands that over-index → trending → tour plus partner brief | Same receipt verifier, plus a **refusal to profile individual fans** (SAFE_USE.md) shown on camera | "Picks 3 tour cities out of 25" | 5 | 4 | 4 | 5 | 5 | 3 | 4 | **4.92** |
| 3 | GroundCheck: "fact-checker for any agent's cultural claims" | Product lead shipping an LLM concierge whose recommendations are made up | Intercepts agent output → search/resolves entities → insights/compare to verify → flags | Blocks an unsupported claim live | "% of GPT picks Qloo contradicts" | 4 | 3 | 3 | 5 | 4 | 4 | 4 | 4.42 |
| 4 | Podcast guest booker: "Moneyball for podcast guests" | Indie podcast producer who needs guests that bring new listeners | podcast entity → audiences → compare → rank | Receipt verifier | "Overlap lift %" | 4 | 4 | 3 | 4 | 5 | 4 | 4 | 4.42 |
| 5 | Franchise menu localization | Ops lead at a Nigerian quick-service chain entering Accra | place/brand insights by location → tags (cuisine) → trending | Receipt verifier | "3 menu swaps" | 4 | 4 | 4 | 3 | 3 | 4 | 4 | 4.42 |
| 6 | Store buy plan: "taste-aware merchandising" | Retail buyer for a new store location | brand insights by location → heatmap → trending | Receipt verifier | "Top 20 brands" | 4 | 3 | 4 | 3 | 4 | 4 | 4 | 4.25 |
| 7 | Comedy special router (for Cedric) | Touring comedian picking markets | Similar to tour-scout | — | — | 4 | 4 | 3 | 3 | 2 | 4 | 4 | 4.00 |
| 8 | CareCircle + Qloo reminiscence (reuse) | Caregiver of a parent with dementia | insights by decade or demographics | — | — | 4 | 4 | 4 | 3 | 1 | 5 | 4 | 4.08 |
| 9 | Halftime-show / stadium music director | Stadium entertainment director | artist audiences vs venue location | — | — | 4 | 3 | 3 | 4 | 4 | 3 | 4 | 4.00 |
| 10 | Unrecommendation for brands (contrarian) | Brand strategist avoiding saturated audiences | insights negative signals + trending | — | — | 3 | 3 | 3 | 3 | 3 | 4 | 4 | 3.58 |

Reusing your existing projects:
- Rules allow a pre-existing project if Qloo is integrated after Sep 30 and the updates are explained.
- **CareCircle** would lose on uniqueness: memory-lane already has 146 Qloo files and 80 test files in the same niche.
- **Conductor's "cannot report done without proof" hook pattern** carries over as the receipt verifier in ideas 1–2. Reuse the design, not the code: Conductor's repo is frozen until its results are out.
- Weekend Markets, HALT and Crucible: no fit.

### Recommendation

**Top pick: #1 Territory.**
- It sits in an empty niche: 0 of 41 rivals touch film or TV distribution.
- It plays straight to Cedric and Calacanis, and to the 2025 winner pattern (a B2B decision-maker plus geography and heatmap, as in the Grand Prize).
- It needs the barely-used features (where_popular, trending, audiences, compare), which earns Tech depth with the CTO.
- Your Lagos base makes "genuine understanding of the problem space" credible.
- The receipt verifier gives Seligman a responsible-AI story and a failure you can show on camera.

**Runner-up: #2 Away Day.** It's equally unique and aims at Boehly. It ranks lower on buildability because Qloo coverage of sports entities is unverified until your key arrives; check it with one `qloo api` search on day one.

You pick. Phase 6 (PLAN.md, CLAIMS.md, checklist) starts after that.
