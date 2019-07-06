export const getNumber = (key: string): number | null => {
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      const n = JSON.parse(raw);
      if (typeof n === "number") {
        return n;
      }
    } catch (ex) {}
  }
  return null;
};

export const setNumber = (key: string, n: number) => {
  localStorage.setItem(key, JSON.stringify(n));
};
