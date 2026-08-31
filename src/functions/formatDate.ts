export const formatDate = (date: Date | string): string => {
  const parsedDate = new Date(date);

  return parsedDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};