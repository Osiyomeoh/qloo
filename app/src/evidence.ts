// The public research behind each design choice, shown on the start screen. Each fact is worded from the
// source's own abstract or page (checked 2026-10-28); never make a line stronger than its source.
export interface Evidence { fact: string; so: string; cite: string; url: string }

export const EVIDENCE = {
  minimallyVerbal: {
    fact: 'About 30% of autistic children remain minimally verbal, even after years of support.',
    so: 'So Unspoken asks them to choose, not to say.',
    cite: 'Tager-Flusberg & Kasari, Autism Research, 2013',
    url: 'https://doi.org/10.1002/aur.1329',
  },
  mswo: {
    fact: 'In a study of 7 people, MSWO, a published preference assessment, took less than half the time of offering every pair.',
    so: 'So the profile is confirmed with MSWO.',
    cite: 'DeLeon & Iwata, JABA, 1996',
    url: 'https://doi.org/10.1901/jaba.1996.29-519',
  },
  shifts: {
    fact: 'Preferences can shift over time.',
    so: 'So each session is saved on the device, and the next one builds on it.',
    cite: 'Hanley, Iwata & Roscoe, JABA, 2006',
    url: 'https://doi.org/10.1901/jaba.2006.163-04',
  },
  aacSpeech: {
    fact: 'In a review of picture and sign communication, none of 27 cases spoke less, and most spoke a little more.',
    so: 'So their board is offered alongside speech, not instead of it.',
    cite: 'Millar, Light & Schlosser, JSLHR, 2006',
    url: 'https://doi.org/10.1044/1092-4388(2006/021)',
  },
  access: {
    fact: 'Across 35 countries, access to assistive products ranged from 3% in poorer nations to 90% in wealthy ones.',
    so: 'So it runs free in a phone browser, with no account.',
    cite: 'WHO & UNICEF, 2022',
    url: 'https://www.who.int/news-room/releases/16-05-2022-almost-one-billion-children-and-adults-with-disabilities-and-older-persons-in-need-of-assistive-technology-denied-access--according-to-new-report',
  },
} satisfies Record<string, Evidence>
