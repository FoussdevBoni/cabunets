export function differenceBy<T, K extends keyof T>(
  a: T[],
  b: T[],
  key: K
): T[] {
  const set = new Set(b.map(item => item[key]));
  return a.filter(item => !set.has(item[key]));
}