import { format, parseISO } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'MMM dd, yyyy');
};

export const formatTime = (time) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${period}`;
};

export const formatDateTime = (dateTime) => {
  if (!dateTime) return '';
  const parsedDate = typeof dateTime === 'string' ? parseISO(dateTime) : dateTime;
  return format(parsedDate, 'MMM dd, yyyy hh:mm a');
};

export const getToday = () => {
  return format(new Date(), 'yyyy-MM-dd');
};
