import translate from './translations';

const dateOptions = [
  {
    id: -1,
    label: translate('all'),
  },
  {
    id: 0,
    label: translate('today'),
  },
  {
    id: 1,
    label: translate('yesterday'),
  },
];

const months = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
];

const today = new Date();

for (let i = 2; i < 32; i += 1) {
  const date = new Date();
  date.setDate(today.getDate() - i);

  const curMonth = translate(months[date.getMonth()]);
  const curDay = date.getDate();

  dateOptions.push({
    id: i,
    label: `${curMonth} ${curDay}`,
  });
}

export default dateOptions;
