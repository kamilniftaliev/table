import az from './az';
import ru from './ru';

import * as Cookies from '../cookies';

const langs = {
  az,
  ru,
};

export default (key, ...args): string => {
  let lang: string = Cookies.get('lang');
  if (!lang) lang = 'ru';

  const translation = langs[lang][key];

  if (!translation) return `No translation for "${key}"`;

  if (typeof translation === 'string') return translation;

  return translation(...args);
};

// setTimeout(() => {
//   Cookies.set('lang', 'ru');
// }, 5000);
