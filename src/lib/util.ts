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

export const getBoolean = (
  key: string,
  defaultValue: boolean = false
): boolean => {
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      const b = JSON.parse(raw);
      if (typeof b === "boolean") {
        return b;
      }
    } catch (ex) {}
  }
  return defaultValue;
};

export const setBoolean = (key: string, b: boolean) => {
  localStorage.setItem(key, JSON.stringify(b));
};
