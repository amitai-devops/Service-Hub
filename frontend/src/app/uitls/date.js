import moment from 'moment';

export const getTimeFormat = (ts, format = 'YYYY-MM-DD HH:MM:SS') => {
  return moment(ts * 1000).format(format);
};

export const getTimeFormatWithoutSeconds = (ts, format = 'YYYY-MM-DD HH:MM') => {
  return moment(ts * 1000).format(format);
};

export const getPresent = (ts) => {
  return new Date(+ts * 1000).toLocaleString().replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$2-$1');
};
