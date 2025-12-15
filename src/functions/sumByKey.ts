export function sumByKey<T extends Record<string, any>>(items: T[], key: keyof T): number {
    return items.reduce((total, item) => {
      const value = item[key];
      return total + (typeof value === 'number' ? value : 0);
    }, 0);
  }
  