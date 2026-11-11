import { parseDate, now } from '../utils/date';

export const canEdit = (date: string) => {
  const saleDate = parseDate(date).startOf('day');
  const todayMidnight = now().startOf('day');

  const diffDays = todayMidnight.diff(saleDate, 'day');
  return diffDays >= 0 && diffDays <= 2;
};
