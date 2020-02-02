import translation from './translations';

export const shifts = [
  {
    value: 1,
    label: translation('shift', 1),
  },
  {
    value: 2,
    label: translation('shift', 2),
  },
];

export const classes = [
  { value: 1, label: 1 },
  { value: 2, label: 2 },
  { value: 3, label: 3 },
  { value: 4, label: 4 },
  { value: 5, label: 5 },
  { value: 6, label: 6 },
  { value: 7, label: 7 },
  { value: 8, label: 8 },
  { value: 9, label: 9 },
  { value: 10, label: 10 },
  { value: 11, label: 11 },
];

export const letters = [
  'a',
  'b',
  'c',
  'ç',
  'd',
  'e',
  'ə',
  'f',
  'g',
  'ğ',
  'h',
  'x',
  'ı',
  'i',
  'j',
  'k',
  'q',
  'l',
  'm',
  'n',
  'n',
  'o',
  'ö',
  'p',
  'r',
  's',
  'ş',
  't',
  'u',
  'ü',
  'v',
  'y',
  'z',
];

export const sectors = [
  {
    value: 'az',
    label: translation('az'),
  },
  {
    value: 'ru',
    label: translation('ru'),
  },
];

export const educationLevels = [
  {
    value: 'all',
    match: ({ number }): boolean => number,
    label: translation('all'),
  },
  {
    value: 'beginner',
    match: ({ number }): boolean => number > 0 && number < 5,
    label: translation('educationLevelBeginner'),
  },
  {
    value: 'middle',
    match: ({ number }): boolean => number >= 5 && number <= 9,
    label: translation('educationLevelMiddle'),
  },
  {
    value: 'high',
    match: ({ number }): boolean => number > 9,
    label: translation('educationLevelHigh'),
  },
];
