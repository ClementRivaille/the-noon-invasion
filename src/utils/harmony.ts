import { NB_LANES } from '../objects/Battleground';

interface Harmony {
  strong: number[];
  avoid: number[];
}

const barsHarmonies: Harmony[] = [
  { strong: [0, 2, 4, 7, 9, 11, 14], avoid: [1, 5, 8, 12] },
  { strong: [0, 2, 4, 7, 9, 11, 14], avoid: [1, 5, 8, 12] },
  { strong: [0, 3, 5, 7, 10, 12, 14], avoid: [1, 8] },
  { strong: [2, 4, 6, 9, 11, 13], avoid: [] },
  { strong: [0, 2, 4, 7, 9, 11, 14], avoid: [1, 8] },
  { strong: [0, 2, 4, 7, 9, 11, 14], avoid: [1, 5, 8, 12] },
  { strong: [1, 3, 6, 8, 10, 13], avoid: [5, 12] },
  { strong: [0, 3, 4, 5, 7, 10, 11, 12, 14], avoid: [] },
];

export function pickLane(bar: number, beat: number) {
  const harmony = barsHarmonies[bar];

  let favoriteProb = 0.3;
  let avoidProb = 0.6;
  if (beat % 4 === 0) {
    favoriteProb = 0.8;
    avoidProb = 1;
  } else if (beat % 2 === 0) {
    favoriteProb = 0.7;
    avoidProb = 0.8;
  }

  const pickFavorite = Math.random() < favoriteProb;
  if (pickFavorite) {
    return harmony.strong[Math.floor(Math.random() * harmony.strong.length)];
  }

  const avoid = Math.random() < avoidProb;
  let randomNote = Math.floor(NB_LANES * Math.random());
  while (avoid && harmony.avoid.includes(randomNote)) {
    randomNote = Math.floor(NB_LANES * Math.random());
  }
  return randomNote;
}
