export function excludeBy<TSource, TExisting, K>(
  source: TSource[],
  existing: TExisting[],
  sourceKey: (item: TSource) => K,
  existingKey: (item: TExisting) => K
): TSource[] {
  const existingValues = new Set(existing.map(existingKey));
  return source.filter(item => !existingValues.has(sourceKey(item)));
}