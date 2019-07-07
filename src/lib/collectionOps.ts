export function pairWise<T>(items: T[]): [T, T][] {
  if (items.length < 2) return [];
  const res: [T, T][] = [];
  for (let i = 0; i < items.length - 1; i++) {
    res.push([items[i], items[i + 1]]);
  }
  return res;
}

export function tripleWise<T>(items: T[]): [T, T, T][] {
  if (items.length < 3) return [];
  const res: [T, T, T][] = [];
  for (let i = 0; i < items.length - 2; i++) {
    res.push([items[i], items[i + 1], items[i + 2]]);
  }
  return res;
}

export function shuffle<T>(items: T[]): T[] {
  let currentIndex = items.length;
  let temporaryValue: T;
  let randomIndex = 0;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = items[currentIndex];
    items[currentIndex] = items[randomIndex];
    items[randomIndex] = temporaryValue;
  }

  return items;
}

export default {
  shuffle,
  pairWise,
  tripleWise
};
