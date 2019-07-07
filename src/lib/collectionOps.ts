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
