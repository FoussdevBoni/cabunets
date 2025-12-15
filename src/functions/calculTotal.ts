export function calculerTotalGenerique<T>(
    data: T[],
    key1: keyof T,
    key2: keyof T
  ): number {
    return data.reduce((total, item) => {
      const valeur1 = Number(item[key1]) || 0;
      const valeur2 = Number(item[key2]) || 0;
      
      return total + (valeur1 * valeur2);
    }, 0)
  }
  

  