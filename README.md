# Unspoken

**Find what they love, by letting them choose.** For carers of children who can't say what they like, but can choose between two things.

Live: https://unspoken-mu.vercel.app · Built on [Qloo](https://qloo.com) and Claude · MIT licence

## Why

A child who doesn't speak still has favourites, and finding new ones matters: they give comfort and motivation, and something to share. Carers find them by trial and error. Behaviour analysts use preference assessments, such as paired choice and MSWO (DeLeon & Iwata, 1996), but those rank a fixed set of things someone already chose to bring. They don't discover anything new.

About 75% of autistic young people have at least one special interest, and the most common are vehicles (19%), characters from films, books and cartoons (15%), TV and films (13%) and video games (10%) ([Autism Speaks](https://www.autismspeaks.org/science-news/special-interest-autism), [study](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8213190/)). Those are the kinds of things Qloo's taste graph covers.

## What it does

1. **The carer names one thing the child already loves**, for example *Thomas & Friends*. Only the title goes to Qloo, nothing about the child.
2. **An agent plans a choice session.** Claude (Sonnet 4.6 on AWS Bedrock) uses Qloo to find related things that are suitable for children (see below). It shows two cards at a time and gives its reason for each pair.
3. **The carer guesses, then the child chooses.** The cards go full screen. The carer logs which one the child picked, how long they engaged and how they reacted (smile, reach, look away…).
4. **The agent adapts.** It stays close to what won, branches across categories (show → book, game, music) through Qloo, or drops what isn't working. It stops after about 6 trials, once a new favourite is confirmed twice, or sooner if the child stops choosing or is upset. When a decision depends on something only the carer knows, it asks.
5. **The result is a one-page profile in the child's voice**: *What I love*. Every line on it was chosen by the child, not guessed for them. It can be printed for school or a therapist.
6. **Their world.** A map of the child's interests: their favourite in the middle, related shows around it, each as its cover picture. The lines and their labels come from Qloo (a tag the show shares with the favourite). The ring colour and the count come only from what the child chose: chosen again and again, chosen once, not chosen yet (not a dislike), or not tried yet. Under it, a one-page profile, *Meet me through my choices*, lists what they chose, what they keep coming back to across visits, what is still being explored, and what went less well, with a picture on every line.
7. **A standard check.** A built-in MSWO assessment ranks the items by selection percentage over three rounds. Each assessment is saved on the device, so the trend over sessions shows.

There is also a manual mode without the agent, and photo seeding: snap a shelf or a screen, a vision model reads the titles, and the carer confirms them. The photo is not stored and never goes to Qloo.

## Safety by design

- **Only titles and Qloo ids leave the app for Qloo.** An allowlist (`app/src/core/qlooRequest.ts`) of parameter names and value formats is enforced again at the server proxy. On production, an insights call carrying an age demographic or free text is refused with a 400.
- **Every card is suitable for children.** Films and shows go through Qloo's content-rating filter (G, PG, TV-Y, TV-Y7, TV-G). Books and music go through Qloo's children's genre tags. Games are checked in code for an ESRB rating of E or E10+. There are no podcasts, because Qloo's family podcasts are for parents. Without these filters, Qloo's podcasts for a *Thomas & Friends* fan were true crime (`app/src/core/kids.ts`).
- **The agent can't show invented or unchecked items.** Every card must be one of the carer's seeds or a filtered `qloo_recommend` result from this session (`present_choice.validate`).
- **It only celebrates what the choices support.** An item can be called a new favourite only if the child chose it at least twice in the session; the finish step is refused otherwise.
- **No account, no names, no server-side storage.** Sessions stay in this browser's localStorage, with a Forget button.
- **Not therapy, not diagnosis.** It describes what was chosen and for how long. It makes no claims about feelings or outcomes.

## Built vs planned

All of it is in [CLAIMS.md](CLAIMS.md), with the evidence for each claim. In short:

| | Status |
|---|---|
| Agent session on Claude + live Qloo, child view, reactions, profile, print | built, tested, live |
| MSWO assessment, history and trend on the device | built, tested, live |
| Qloo allowlist (only titles and ids) | built, tested, checked on production |
| Photo → titles | built, tested with a mocked model; not yet measured on real photos |
| Qloo vs a plain LLM for kids' titles | measured once: **not supported**. The LLM's misses were mostly real titles under other names. We don't claim Qloo recommends better |
| A pilot with real carers | planned. Nothing here is evidence about real children yet |

## Run it

```sh
cd app
npm install
npm test                 # 91 tests, no keys needed
npm run dev              # sample mode: clearly labelled sample data, no keys, no network
```

Live mode (real Qloo and the agent, served by the dev server's `/api`):

```sh
cp .env.example .env     # QLOO_API_KEY and Bedrock credentials, all server side; VITE_LIVE=1
node --env-file=.env node_modules/vite/bin/vite.js
```

The dev server reads the keys from its own process environment, so they have to be loaded into it, as above. They never reach the browser.

Live checks (each needs keys):

```sh
npx tsx --env-file=.env scripts/day1.ts                                  # Qloo response shapes and search accuracy, through the same allowlist
AWS_PROFILE=… AWS_REGION=… npx tsx --env-file=.env scripts/live-agent.ts # the agent end to end with a simulated child (not evidence about people)
npx tsx --env-file=.env scripts/benchmark.ts                             # Qloo vs a plain LLM, 8 cases of 2 seed titles each
```

Deploys to Vercel as is: `app/api/*.ts` are the functions (`/api/agent`, `/api/qloo`, `/api/vision`).

## How it's built

React 19 + TypeScript + Vite, with Vercel functions. The agent loop (`app/src/agent/engine.ts`) has budgets: 16 model turns and 24 Qloo calls per session, and one person-facing action at a time. Its tools are `qloo_search`, `qloo_recommend` (filtered for children), `present_choice`, `ask_carer` and `finish`. The MSWO scoring is plain code, not the model (`app/src/core/mswo.ts`). Tests: Vitest + Testing Library, including a scripted-model run from the UI through the handler and the loop.
