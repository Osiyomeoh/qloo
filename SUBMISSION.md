# Submission kit (draft, Sam submits)

Deadline: **Oct 30 2026, 11:45 pm ET = Sat Oct 31, 04:45 Lagos** ([rules](https://qloo.devpost.com/rules), as recorded in RESEARCH.md; re-check the page before submitting, Chrome couldn't read it today). Feature freeze: Oct 30, 12:00 Lagos.

Required ([rules](https://qloo.devpost.com/rules)): working demo link · public repo with an open-source licence file · text description · free testing access. Video: "not required" ([overview](https://qloo.devpost.com/)). One prize per project. Judged equally on Tech, Design, Impact, Idea.

## Devpost text

**Name:** Unspoken
**Tagline:** Find what they love, by letting them choose.

**Some children can't tell you what they love. But they can choose.** Unspoken lets carers of non-speaking children find new favourites: Qloo finds what to try, and the child's choices decide. In our demo session the carer guessed right 1 time in 6; the choices found a new favourite in 6 picks.

**Inspiration.** A child who can't speak still has favourites. New ones give comfort, motivation and something to share, but carers find them by trial and error. Behaviour analysts use preference assessments (paired choice, MSWO), but those rank a fixed set of things. They don't discover anything new.

**What it does.** The carer names one thing the child loves, say *Bluey*. Only the title goes to Qloo. An agent (Claude on AWS Bedrock) uses Qloo to find related things that are rated for children and shows two pictures at a time. The carer guesses, the child chooses, the carer logs the pick and the reaction. The agent stays close to what won, branches, or stops: after about 6 choices, once a new favourite is chosen twice, or early if the child stops choosing or is upset (enforced in code). The result is *Their world*, a map of real cover pictures where Qloo draws the links and only the child's choices colour them, and a one-page profile in the child's voice, *Meet me through my choices*, to print for school or a therapist. A picture board lets the child say "I want …" by tapping.

**How Qloo is essential.** Qloo's graph finds the next things to try across shows, films, books, games and music, its content ratings and children's tags keep every card suitable, and its tags explain each link on the map. Measured on 7 pairs of children's favourites: unfiltered, 33 of 210 film, TV and game results were rated teen or adult; of the 191 Unspoken could show, 0 were (CLAIMS.md).

**How we built it.** React 19 + TypeScript + Vite on Vercel. An agent loop with budgets (16 turns, 24 Qloo calls), tools `qloo_search`, `qloo_recommend`, `present_choice`, `ask_carer`, `finish`, and server-signed session state. An allowlist means only titles and Qloo ids reach Qloo. MSWO scoring is plain code. 91 tests.

**Challenges.** Qloo's unfiltered results for a *Thomas & Friends* fan included true-crime podcasts; search returns hotels and restaurants under show names. Both are filtered in code, and the agent can only show filtered results.

**What we learned.** A link from Qloo is a reason to try something, not proof the child will like it. Keeping those two layers apart is the design.

**What's next.** A first pilot with real carers and their children, then a real phone test. Neither has happened yet.

**Honest limits.** Not therapy or diagnosis. No evidence yet about real children. A plain LLM benchmark did not show Qloo recommending better, so we don't claim it.

**Try it:** https://unspoken-mu.vercel.app/?demo=bluey (no account) · Video: https://youtu.be/1WQjsmcRdrg · Repo: https://github.com/Osiyomeoh/qloo

Video: https://youtu.be/1WQjsmcRdrg

Gallery images (upload in this order): `docs/img/1-hook.png`, `2-cards.png`, `3-choose.png`, `4-world.png`, `5-profile.png`, then `hero.png` as the thumbnail.

## Video script (optional, ~2 min)

| Time | Screen | Say |
|---|---|---|
| 0:00 | Start screen | "Some children can't tell you what they like. But they can choose." |
| 0:10 | Type Bluey, pick it | "The carer names one favourite. Only the title goes to Qloo." |
| 0:20 | Agent plan | "An agent uses Qloo to find children's shows close to Bluey, and says why." |
| 0:35 | Two cards, guess, pick, smile | "The carer guesses, the child chooses, one tap logs the reaction." |
| 1:00 | Agent adapts | "It follows what wins, and stops if the child is done." |
| 1:20 | Their world map | "Qloo draws the lines. Only the child's choices colour them." |
| 1:40 | Profile, print | "A page in their voice: every line is something they picked." |
| 1:55 | End | "Unspoken. Find what they love, by letting them choose." |

## Before you press submit (you)

- [ ] Clear test sessions (Forget) in the browser used for screenshots
- [ ] Repo public, licence visible in About
- [x] Gaps filled: no phone or pilot results are claimed
- [ ] Tag `main` at the freeze
