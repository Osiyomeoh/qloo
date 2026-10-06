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

---

## Phase 5b: Deep dive on the chosen direction: "Unspoken" (working name, keep private)

**Idea:** photos of a person's things → a vision model detects cultural items → Qloo resolves them to entities → Qloo's taste graph proposes *new* things to try → the caregiver offers them as choices and logs the reaction → the profile sharpens → a weekly plan within sensory, mobility, age-rating and budget limits. For people who can't say what they love, through their caregivers.

### Who it's for (sourced)
| Group | Size | Source |
|---|---|---|
| Autistic children (US) | 1 in 31 8-year-olds (2022 data, CDC 2025 report) | https://abc7.com/post/estimated-1-31-children-have-autism-diagnosis-rates-increase-us-cdc/16179092/ |
| …of whom minimally verbal | 25–35% (definition-dependent) | https://thetransmitter.org/spectrum/whos-minimally-verbal-depends-ask |
| Aphasia (US) | 2M+, possibly up to 4M; about 180K new cases a year; more common than CP or Parkinson's | https://aphasia.org/faq-list/how-common-is-aphasia/ |

### How it's done today (the problem space)
- Clinicians use **stimulus preference assessments** because self-report "is unreliable or impossible due to limited verbal abilities." The main formats are **MSWO** (an array of 6–8 items; the person picks, the picked item is removed, and the next trial repeats until all are picked) and **paired-stimulus** (two items at a time). The candidate list is seeded by a caregiver interview (**RAISD**). https://behavioristbookclub.com/aba-research/evidence/mswo-preference-assessment/
- **Gap:** these methods only *rank items someone already thought of*. Nothing proposes new candidates. Unspoken's Qloo step fills exactly that gap, then reuses the clinically familiar MSWO choice format to test the proposals.
- Closest existing tool: **MSWO PAT**, a free web tool that shows kids short video clips and ranks them by what they touch first. Its first choice matched the best reinforcer in 5 of 7 kids (about 70%). It ranks a fixed set and doesn't discover anything new. https://behavioristbookclub.com/aba-research/assessment-research/the-multiple-stimulus-without-replacement-preference-assessment-tool-a/
- Other apps (AAC, Autism Assist) help a child *communicate a choice among known options*; none discovers new options. Search found no taste-discovery product for this group.
- Evidence that taste fit matters:
  - When leisure tasks matched an autistic adult's preference profile, engagement rose and problem behavior roughly halved.
  - Special interests are linked to higher wellbeing, with a caveat about very high intensity.
  - https://behavioristbookclub.com/aba-research/assessment-research/a-component-based-leisure-activity-assessment-for-adults-with-autism-s/ · https://pubmed.ncbi.nlm.nih.gov/39088145/
- For aphasia and stroke, **preferred, familiar music** is used in rehab, and a trial (MASTER, NCT04441515) tests participant-preferred music within 24 h of stroke. https://clinicaltrials.gov/study/NCT04441515 · https://pmc.ncbi.nlm.nih.gov/articles/PMC12112711/

### Sensitivities to get right (judges include an OpenAI board member)
- **ABA is contested in the autistic community.** Frame the product around *choice, joy and agency*, not compliance or "reinforcers." Use "what they love," never "what to reward with." Borrow only the neutral choice format.
- **Qloo SAFE_USE.md:** don't send personal data and don't infer traits about an individual. Design:
  - Photos are processed by the vision model only and never sent to Qloo.
  - Only public entity names and tags go to Qloo.
  - No diagnosis is stored by default.
  - A "describe this person" request is refused.
- Present Qloo results as aggregate affinity, "people who love X also love Y," never as a claim about the person. The caregiver's logged reactions are the ground truth.

### Rival check (2026-10-05)
- `gh search repos`: qloo + photo, camera, vision, image, bookshelf, nonverbal, autism, caregiver, accessibility, disability, aphasia → **0 results**. `gh search code` for Qloo + image payloads → 0.
- 41 cloned rivals: no hits for nonverbal, non-verbal, aphasia or cerebral palsy. The only disability-word hits were 1 "autista" each in booker and newcomer. 24 repos matched the camera/vision keyword pattern; I haven't checked whether any actually work from photos. The closest in spirit (care) are the dementia reminiscence apps memory-lane and encore, which are text-in.

### Qloo data fit (from the docs; live checks need the key)
- Entity types cover what's on a shelf: book, movie, tv_show, artist, video_game, brand, podcast, place, destination. https://docs.qloo.com/reference/qloo-llm-hackathon-developer-guide
- `filter.content_rating` (MPAA) exists for movies and TV, which gives the age-appropriate constraint. https://docs.qloo.com/reference/parameters
- `/search` resolves detected names to entity IDs; `v2/insights` with `signal.interests.entities` gives proposals; `v2/tags` and `analysis/compare` help explain them; `v2/trending` is optional.
- **Day-1 key checks:**
  1. coverage of children's media (Bluey, Pokémon, Thomas, Cocomelon) and of older adults' music by decade
  2. search hit rate on 30 OCR-style noisy titles
  3. location-based place results for sensory-friendly outings

### Risks
1. Vision misreads (spines at an angle, glare). Mitigation: a one-tap confirm or correct screen before any Qloo call; measure the detection hit rate on a fixed set of photos (that's the demo number).
2. Kids' media coverage unverified. Mitigation: day-1 check; fall back to tags-level signals.
3. Impact credibility. Mitigation: Sam recruits 2–3 real caregivers, SLPs or support workers to try it and quote. That's the one thing AI-built rivals can't fake.
4. Tone. Mitigation: review the copy against neurodiversity-affirming language; no medical claims.

### Impact model (deep dive, 2026-10-05)

**Scale: people who can't reliably say what they like**
| Figure | Value | Source | Note |
|---|---|---|---|
| People with complex communication needs, worldwide | **97M+** | Beukelman & Light Q&A, https://brookespublishing.com/?p=26384 | Widely cited; confirm the primary source before the pitch |
| …in the US | about **5M** | same | |
| UK share who could benefit from AAC | **0.5%** of the population (536 per 100K); 97.8% of them fall under 9 conditions (dementia, Parkinson's, autism, learning disability, stroke, CP, head injury, MS, MND) | Creer et al., https://eprints.whiterose.ac.uk/110386 | Peer-reviewed |
| AAC abandonment | **30–50%** of people given an AAC system abandon or under-use it | Communication Matters, https://www.communicationmatters.org.uk/wp-content/uploads/2019/10/AAC_Evidence_Base_Findings.pdf | Shows tools fail when they don't fit the person |
| Autism, global | about **1 in 100** children (WHO average) | https://pmc.ncbi.nlm.nih.gov/articles/PMC9310578/ | US: 1 in 31 |
| CP: unable to speak | **20–44%** of children with CP (24% at age 5–6 in a population sample) | https://pmc.ncbi.nlm.nih.gov/articles/PMC6986977 | |
| Aphasia: isolation | **90%+** feel isolated; aphasia had the **largest negative effect on quality of life**, above cancer and Alzheimer's, in a population study | https://pmc.ncbi.nlm.nih.gov/articles/PMC3869916 · https://www.dovepress.com/quality-of-life-measurement-and-outcome-in-aphasia-peer-reviewed-fulltext-article-NDT | Leisure and social activity drop sharply |

**Why not knowing someone's preferences hurts (the causal chain)**
1. No reliable way to express a preference → the caregiver guesses → the same few activities and shows on repeat.
2. **Low meaningful activity** is a named driver of challenging behavior in intellectual disability, alongside communication difficulty. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12569614/
3. Preferred activities **reduce problem behavior and increase desirable behavior**, and choice-making interventions reduce challenging behavior. https://behavioristbookclub.com/aba-research/school-classroom/preferred-curricular-activities-and-reduced-problem-behaviors-in-stude/
4. Caregivers of autistic children report higher burden and lower quality of life than caregivers of children without a disability, across all four quality-of-life domains. https://pmc.ncbi.nlm.nih.gov/articles/PMC11495581/
5. In aphasia, lost leisure and social activity tracks loneliness and depression. Preferred, familiar music is already used in rehab (MASTER trial, NCT04441515).

→ **Unspoken's claim:** widen the set of things a person gets to choose from, chosen by real taste data instead of guesswork, so they have more moments of genuine enjoyment and agency, and the caregiver has less trial and error. We claim to improve **choice and engagement**, not medical outcomes.

**What the demo can actually show (measured, honest)**
| Metric | How we measure it | Claim allowed |
|---|---|---|
| Detection hit rate | A fixed set of about 20 shelf and room photos with hand-labelled items → % of items detected and resolved to the correct Qloo entity | "Recognizes X% of items in our test set" plus the reproduce command |
| Novelty | % of proposals the caregiver hadn't listed (the RAISD-style seed list) | "N new candidates per session" |
| LLM-only vs Qloo | For the same seeds, a blind comparison: are the LLM-only suggestions generic or popular (popularity percentile), and does the LLM hallucinate titles that don't resolve in Qloo search? | "LLM-only picks: X% unresolvable or top-percentile generic; Qloo: Y%" |
| Choice-session uptake (pilot) | With 2–3 real caregivers: % of proposed items chosen or enjoyed in a pick-from-a-set session | Only with real pilot data, labelled as a pilot (n=…) |

**Not claimed:** therapy, diagnosis, behavior reduction, or clinical efficacy. Those need trials. Any sentence implying them is a CLAIMS.md FAIL.

### Making it effective: evidence-based design rules (2026-10-05)

| # | Finding | Source | Design rule for Unspoken |
|---|---|---|---|
| 1 | Partners predicted the topic preferences of adults with aphasia with only **65% accuracy**. Accuracy rose with time spent together, shared activities, and the partner's belief in the person's competence. People with moderate to severe aphasia *could* state preferences when given the Talking Mats framework | https://repository.up.ac.za/handle/2263/30371 | **"Guess first" mode:** before each choice session the caregiver predicts which card the person will pick. The app logs prediction vs actual choice, which makes the core problem measurable (a live "caregiver guessed right X% of the time" number) and shows the person's own voice beating the guess |
| 2 | Video-based preference assessments correlated strongly with tangible ones (3 of 4 kids, same top items). For social and dynamic items, GIF/video matched true preference for 4 of 4 vs pictures for 2 of 4. Pictures are faster | https://pmc.ncbi.nlm.nih.gov/articles/PMC3405936 · https://behavioristbookclub.com/aba-research/assessment-research/a-comparison-of-picture-and-gif-based-preference-assessments-for-socia/ | **Choice cards use motion and sound where possible** (a short clip, an audio snippet); a still image is the fallback. The source of previews is an open question (Qloo returns entity images; clips need another source). Check on day 1 |
| 3 | Free-operant (engagement-duration) assessment infers preference from **how long** someone engages, avoids taking items away, and is linked to lower problem behavior during assessment | https://behavioristbookclub.com/aba-research/topic/free-operant-preference-assessment/ | **Measure engagement time, not just the tap.** When chosen content plays inside the app, record seconds engaged before they leave. Nothing is ever snatched away; the person leaves when they want. Two signals: the choice (tap) plus engagement (duration) |
| 4 | People with severe or profound disabilities may not reliably handle 6–8-item arrays | https://behavioristbookclub.com/aba-research/evidence/mswo-preference-assessment/ | **An adjustable array size of 2, 3 or 4 cards**, defaulting to 2 (paired) for people with the highest support needs |
| 5 | "Indices of happiness": observable smiles, laughs and excited vocalizations vs frowns and cries, operationally defined and validated by Green & Reid for people with profound multiple disabilities | https://pmc.ncbi.nlm.nih.gov/articles/PMC1284173 | **Reaction logging uses defined, observable behaviors** (smiled or laughed, vocalized happily, reached for it again / turned away, covered ears, cried), not a vague 😊. Optionally two carers log independently, and the app shows their agreement |
| 6 | Preferences were stable for about 80% of people over 3–6 months, but shift with satiation; reassess regularly | https://pmc.ncbi.nlm.nih.gov/articles/PMC1479785 | **Freshness and novelty built in:** every set mixes 1 proven favorite with 1–2 new options, weights recent choices more, and flags fatigue ("chosen less over the last 2 weeks") so the profile never freezes |
| 7 | The one-page profile ("what people like and admire about me / what's important to me / how best to support me") is the standard person-centred-planning handover tool for new staff, schools and providers | https://www.dshs.wa.gov/sites/default/files/ALTSA/tbi/documents/One-PagePersonCenteredProfile.pdf · https://clep.rutgers.edu/educational-resources/person-centered-thinking-planning | **Export the profile as a one-page profile in that exact 3-heading format**, filled from *evidence* ("chose machine show 4/5 times"). Supported-living staff already use it, so it slots into their workflow with nothing new to learn |

**Revised loop**
```
photos → detect items → caregiver confirms
→ Qloo proposes related options (age-rated, within limits)
→ caregiver GUESSES the pick (logged)
→ 2–4 motion/sound cards (1 known favorite + new options)
→ person chooses → engagement seconds measured in-app → defined reactions logged
→ chosen/engaged items weighted up, rejected weighted down → next Qloo request
→ profile traits = Qloo tags shared across their real choices
→ one-page profile export (evidence-backed)
```

**Demo numbers this enables (no clinical claims)**
- Caregiver guess accuracy vs the person's actual choice (the research baseline is 65%).
- New items chosen per week that weren't on the caregiver's original list.
- Engagement seconds: new picks vs the old repeat favorites.

### Evidence base: what's proven, what's new, how we'll prove the new part (2026-10-05)

**Every step of the loop is an established method with years of peer-reviewed research behind it:**

| Step in Unspoken | Established method | Since | Key evidence | Source |
|---|---|---|---|---|
| Offer items, watch which one the person approaches | Stimulus preference assessment | **1985** | Pace et al., JABA 18(3): approach behavior separates preferred from non-preferred stimuli in people with profound disabilities | https://pmc.ncbi.nlm.nih.gov/articles/PMC1279894 |
| 2-card choice (default for the highest support needs) | Paired-stimulus (forced choice) | **1992** | Fisher et al., JABA 25(2): two items at a time gave better differentiation and **better predicted** what the person actually works for | https://pmc.ncbi.nlm.nih.gov/articles/PMC1279726 |
| 3–4-card choice | MSWO | **1996** | DeLeon & Iwata, JABA 29(4): moderate to high rank agreement with paired-stimulus at **less than half the time** | https://pmc.ncbi.nlm.nih.gov/articles/PMC1284008 |
| Measure how long they engage, never snatch anything away | Free-operant (engagement-duration) assessment | 1990s → | Measures cumulative engagement time, avoids item removal, and is linked to less problem behavior during assessment. Kang et al. (2013) showed format choice changes problem behavior | https://behavioristbookclub.com/aba-research/topic/free-operant-preference-assessment/ · https://pmc.ncbi.nlm.nih.gov/articles/PMC3251285 |
| Log reactions as defined behaviors | Indices of happiness | **1996** | Green & Reid: validated observable happiness and unhappiness indicators for people with profound multiple disabilities | https://pmc.ncbi.nlm.nih.gov/articles/PMC1284173 |
| Cards with motion and sound | Video-based preference assessment | 2010s | Video rankings correlate strongly with tangible ones; GIFs beat pictures for dynamic items | https://pmc.ncbi.nlm.nih.gov/articles/PMC3405936 |
| Giving real choices | Choice-making interventions | **2004 review** | Shogren et al., meta-analysis (J. Positive Behavior Interventions 6(4)): choice-making **reduces problem behavior**; choice contributes to quality of life | https://link.springer.com/article/10.1007/s40489-018-00154-7 (cites it) |
| Visual choice framework for people who can't speak | Talking Mats | **1998** (Univ. of Stirling, from CP research) | A scoping review found positive effects on communication effectiveness and involvement in decisions; evidence level "limited" | https://cris.maastrichtuniversity.nl/en/publications/using-talking-mats-to-support-conversations-with-communication-vu/ |
| Caregiver guess vs actual choice | Partner prediction studies | 2010s | Partners got aphasia topic preferences right only **65%** of the time | https://repository.up.ac.za/handle/2263/30371 |
| One-page profile handover | Person-centred planning | 1990s → | The standard tool to introduce a person to new staff, providers and schools | https://clep.rutgers.edu/educational-resources/person-centered-thinking-planning |

**Why taste-graph proposals should fit this group (evidence that the content overlaps):**
- **75%** of autistic youth have at least one special interest; 50% of those have two or more. Common topics: **vehicles/transport 19%, characters from movies/books/cartoons 15%, TV/DVDs/movies 13%, computers/video games 10%**, construction toys 9%, mechanical objects 9%. https://www.autismspeaks.org/science-news/special-interest-autism · https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8213190/
- Characters, TV and films, games and books are exactly the entity types Qloo covers (movie, tv_show, book, video_game, artist, podcast, brand, place).
- **Honest gap:** the largest category, **sensory-related interests at 44%**, is *not* a Qloo entity type. Unspoken handles it with caregiver-entered constraints and non-Qloo items (the "washing machine"), and says so in the README.

**What is NEW and unproven (we say this plainly):**
1. Using a **taste graph to propose candidates** for preference assessment. Today candidates come only from carer interviews (RAISD). No study has tested this; Unspoken is the first.
2. **Photos of a person's things** as the seed list.
3. Whether Qloo's general-population affinities transfer to individuals in this group.

**How we'll generate our own evidence before Oct 30 (no clinical claims):**
| Question | Measure | Allowed wording |
|---|---|---|
| Does photo → Qloo work? | Detection and entity-resolution hit rate on a labelled set of 20 photos (reproducible script) | "X% of items resolved on our test set" |
| Do proposals add anything? | % of proposals not on the carer's own list | "N new candidates per session" |
| Better than a generic LLM? | The same seeds into LLM-only vs Qloo: % unresolvable or hallucinated titles, popularity percentile (genericness), tag overlap with the seeds | "In our benchmark…" plus the command |
| Does anyone actually choose the new items? | Pilot with 2–3 real caregivers (Sam recruits): choice rate and engagement seconds for new vs old items; carer guess accuracy vs the 65% baseline | "Pilot, n=3, not a clinical study" |

## Three entries, three different ways to win (2026-10-06)

Rules: several submissions allowed if "substantially different"; one prize per project; 4 equal criteria (Tech, Design, Impact, Idea). Each entry is aimed at a different strength and different judges so they don't compete with each other.

### #1 Unspoken: wins on Impact + Idea
- Judges it plays to: everyone on "Impact"; Seligman (AI for good). No rival in 41 repos targets nonverbal users or uses photos with Qloo.
- Market: no incumbent. The nearest tool (MSWO PAT) ranks a fixed set and doesn't discover. Evidence: sections above.
- Main risk: Qloo coverage of kids' media (day-1 check); SAFE_USE limits (handled: items, not people).

### #2 Territory: wins on Tech + the 2025 winner pattern (B2B + geography)
- Who: foreign sales agents who license a film territory by territory. Cannes (May) locks presales, Toronto (Sep) moves finished titles, AFM (Nov) fills the gap; Germany/France/UK/Japan are the core MG block banks want before lending; Spain, Benelux, Scandinavia, South Korea, MENA usually close at AFM. https://vitrina.ai/?p=141396 · https://thegotham.org/distribution-101-foreign-sales-agents/
- Pain, in an incumbent's own words: agents decide "based on historical licensing data or festival performance" rather than forward-looking signals. https://www.muso.com/blog/what-film-sales-agents-dont-know-yet
- **Incumbents exist** (so the idea is validated, not empty): MUSO (piracy/viewing demand by country, 850,000 titles), Vitrina (deal tracking), Cinando (buyer directory). Our edge must be what they don't do: **taste affinity** — "audiences who like your comparables also like X; in market Y that taste is over-indexed" — plus Qloo-generated comparable titles and pitch angles per territory. Don't claim "no tool exists".
- Hackathon field: 0 of 41 rival repos touch film distribution. Timing: AFM is in November, right after judging.
- Qloo fit: search → movie entity → insights with `filter.location.query` per territory city, heatmap (`urn:heatmap`, geohash-based) for where the taste concentrates, tags for pitch angles. Documented: https://docs.qloo.com/reference/insights-api-deep-dive
- Judges: Calacanis (investor), Cedric (film/TV), Diolosa (heavy Qloo use).
- Risk: Qloo location data may be strongest in US/EU cities, weaker for Lagos/Accra → check day 1; keep the demo on territories where data is strong.

### #3 Away Day: wins on judge fit + a crisp business story
- Who: partnerships/commercial staff at a club choosing tour cities and local sponsors. Tours are money events: Man United's 2025 Kuala Lumpur + Hong Kong trip reported at >$10m; Liverpool's Hong Kong + Japan £8–10m. Clubs pick on fan data (Liverpool cites 26m US fans) and sign local sponsors around tours (Spurs + Coupang in Korea; Liverpool + Japan Airlines). https://www.cityam.com/?p=2450573 · https://insidersport.com/2025/04/10/manchester-united-asia-preseason-tour/
- **Incumbents exist**: Nielsen Sports Fan Insights (survey panels, about 9–12 countries), Two Circles (data agency for 400+ properties). https://www.research-live.com/article/news/nielsen-launches-sports-fan-insight-tool/id/5059862 · https://charterhouse.co.uk/portfolio/two-circles
  Our edge: instant, any city, and cross-domain — "people here who like the club also like these brands/artists/places" → sponsor and activation shortlist, at agent speed, without a survey.
- Judges: Boehly (owns Chelsea and Dodgers stakes), Abrams (Live Nation: events and venues).
- Biggest risk: **Qloo coverage of sports clubs is unverified** (no "team" entity type is listed; clubs may sit under brand or person). Day-1 check decides go / no-go; fallback is the same tool for a touring artist or festival (fits Abrams).

### How the three avoid hurting each other
- Different users, different screens, different Qloo paths → clearly "substantially different".
- Shared engineering (key proxy, allowlist, parser, eval tooling) is reused, so #2 and #3 start with tested infrastructure.
- Order of effort stays: #1 first. #2 and #3 are each one sharp workflow, not half-built extras.

### Day-1 checks that decide #2 and #3
1. `filter.location.query` + heatmap results for 6 territory cities (Berlin, Paris, London, Tokyo, Seoul, Lagos): are results non-empty and different by city?
2. `/search` for 10 clubs (Chelsea, Liverpool, Arsenal, Real Madrid, Barcelona, LA Dodgers, Lakers, Man United, PSG, Enyimba): do they resolve, and as what type?
3. Insights with a club as the signal and `filter.type=brand` in one city: sensible sponsors?

## Day-1 live Qloo checks (2026-10-06)

Run with `app/scripts/day1.ts` (repo #1) and `scripts/day1.ts` (qloo-two), every call through `proxyQloo`'s allowlist. About 60 requests in total.

**Response shapes (match our parsers):**
- `/search` returns `results[]`.
- `/v2/insights` returns `{success, results: {entities: [...]}}`.
- Each entity has `entity_id`, `name`, `types`, `popularity`, `properties.image.url`, `properties.content_rating` (on film and TV), `tags[] = {id, name, type}` and `query.affinity` (about 0.92–0.96 for top results).
- The heatmap returns `results.heatmap[] = {location: {latitude, longitude, geohash}, query: {affinity, affinity_rank, popularity}}`, and `parseHeatmap` already reads this.

**#1 Unspoken:**
- Coverage:
  - Kids' TV, kids' film and older music all resolve, with images.
  - Tags are rich: 108–163 per kids' show, 270–340 per film, 42–52 per artist.
- Search on exact titles: 15 of 15 found the right item. On messy titles, 3 of 5 did:
  - "bluey season 2" returned *The Jinx*.
  - "Cocomelon" returned the spin-off *CoComelon Lane*.
  - "thomas the tank engine" returned *All Engines Go*.
  - So the app should show the top 3 for the carer to confirm instead of taking the first result automatically. This is already the UX, so keep it.
- Exclusion works: the seed was never returned. `filter.content_rating=G,PG` worked: every film returned was G or PG.
- Recommendations look sensible: Bluey → Peppa Pig, Pocoyo, Sarah & Duck, Hey Duggee.

**#2 Territory:**
- **`filter.location.query` has no effect on entity insights.** We seeded with Parasite and asked for movies in Berlin, Paris, London, Tokyo, Seoul and Lagos. All six cities returned the same list with the same affinities.
- So the current `App.tsx`, which ranks territories with location-filtered movie insights, **would produce a meaningless ranking when live**.
- The heatmap *does* respond to the city (Lagos returned cells around Lagos), so territory fit has to come from heatmap affinity instead. **Needs a redesign before any claim.**

**#3 Away Day:**
- Clubs are `urn:entity:brand`: Chelsea, Liverpool, Arsenal, Real Madrid, Barcelona, the Dodgers and the Lakers each have 87–114 tags.
- Man United and PSG resolve as a *place* on an untyped search, so a brand-typed search is needed (it returns "Manchester United F.C." and "PSG").
- Enyimba has no brand entity; only its stadium (a place) exists.
- Brand insights seeded with Chelsea in London: Man City, Premier League, Liverpool, Juventus, Arsenal… These are other clubs and leagues, not sponsors.
- The location filter likely doesn't apply here either.
- So the sponsor shortlist has to exclude sports clubs and leagues (by tag), and the city part has to come from the heatmap.

### Day-1 follow-ups: redesign of #2 and #3 (2026-10-06)
- **Heatmap fields:**
  - `query.affinity` is rescaled within each request (the mean is about 0.5 in every city), so it can't compare one city with another.
  - `query.affinity_rank` can: Parasite scores Seoul 0.96 vs Lagos 0.82, and Amélie scores Paris 0.99 vs Tokyo 0.71.
  - Cell counts vary a lot: Amélie had 1,662 cells in Paris but 3 in Lagos.
  - `take` doesn't limit heatmap cells; one request returned 3,991.
  - With no location, the heatmap returned 0 cells.
- **Request limits:**
  - Insights reject `take=100` (Qloo returns 400); 50 works.
  - 6 parallel calls produced a 429, and even 2 at a time sometimes do.
  - The live clients now retry a 429 twice with backoff (0.6 s, then 1.2 s), then show the error, and send at most 2 requests at a time.
- **`filter.exclude.tags` works.** Excluding the `urn:tag:genre:brand:sports_organization*` tags (plus `mobile_app:sports`) turned Chelsea's brand list into Nike, Umbro, Adidas, Puma, Mercedes-Benz, Huawei, PlayStation and Hugo Boss.
- **#2 Territory** now ranks territories by mean heatmap `affinity_rank` and shows the evidence count.
  - Live: Amélie → France 0.99; King of Boys → Nigeria 0.98 (209 cells, every other territory under 4 cells or empty); Parasite → Germany 0.97, South Korea 0.96.
  - Comparables are now global and labelled that way.
- **#3 Away Day** now ranks cities the same way.
  - Live: Lakers → Los Angeles 0.94; Real Madrid → São Paulo 0.85; Chelsea → Lagos 0.69.
  - Sponsors come from one tag-excluded brand call, labelled as global.
