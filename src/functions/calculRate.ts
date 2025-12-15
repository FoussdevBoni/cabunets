type DataItem = {
    date: string; 
  };
  
  export function calculRate(
    data: DataItem[],
    criterion?: 'week' | 'month' | 'day' | 'year'
  ): number {
    const now = new Date();
  
    // Fonction utilitaire pour filtrer les données selon la période
    function filterByPeriod(date: Date, periodOffset: number): number {
      return data.filter(item => {
        const itemDate = new Date(item.date);
        switch (criterion) {
          case 'week':
            return getWeekNumber(itemDate) === getWeekNumber(date) - periodOffset;
          case 'month':
            return itemDate.getFullYear() === date.getFullYear() &&
              itemDate.getMonth() === date.getMonth() - periodOffset;
          case 'day':
            return itemDate.getFullYear() === date.getFullYear() &&
              itemDate.getMonth() === date.getMonth() &&
              itemDate.getDate() === date.getDate() - periodOffset;
          case 'year':
            return itemDate.getFullYear() === date.getFullYear() - periodOffset;
          default:
            return false;
        }
      }).length;
    }
  
    // Récupérer les données de la période actuelle et précédente
    const currentPeriodCount = filterByPeriod(now, 0);
    const previousPeriodCount = filterByPeriod(now, 1);
  
    // Calcul du taux d'évolution
    if (previousPeriodCount === 0) {
      return currentPeriodCount > 0 ? 100 : 0; // Si avant il n’y avait rien et maintenant il y a des données, 100%
    }
  
    return ((currentPeriodCount - previousPeriodCount) / previousPeriodCount) * 100;
  }
  
  // Fonction pour obtenir le numéro de la semaine (ISO 8601)
  function getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + 1) / 7);
  }
  

  
 
  