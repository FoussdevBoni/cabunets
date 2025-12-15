
  export function getDataByDate(data: any, criterion?: 'week' | 'month' | 'day' | 'year'): [] {
    const now = new Date();

    if (!criterion) {
      return data
    }
     
    return data.filter((item: any) => {
      const itemDate = new Date(item.date);
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentDate = now.getDate();
      const currentWeek = getWeekNumber(now);
  
      switch (criterion) {
        case 'week':
          return getWeekNumber(itemDate) === currentWeek;
        case 'month':
          return itemDate.getFullYear() === currentYear && 
          itemDate.getMonth() === currentMonth;
        case 'day':
          return itemDate.getFullYear() === currentYear && itemDate.getMonth() === currentMonth && itemDate.getDate() === currentDate;
        case 'year':
          return itemDate.getFullYear() === currentYear;
        default:
          return false;
      }
    });
  }
  
  // Fonction pour obtenir le numéro de la semaine (ISO 8601)
  function getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + 1) / 7);
  }
  
  
  