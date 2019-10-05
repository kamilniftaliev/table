const russianAlphabet = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'q',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'j',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'x',
  ц: 'c',
  ч: 'ch',
  ш: 'sh',
  щ: 'sh',
  ъ: '',
  ы: 'i',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
};

export function generateSlug(title: string): string {
  let slug = title
    .toLowerCase()
    .replace(/\s/gi, '_')
    .replace(/ə/gi, 'e')
    .replace(/ö/gi, 'o')
    .replace(/ü/gi, 'u')
    .replace(/i/gi, 'i')
    .replace(/İ/gi, 'i')
    .replace(/ı/gi, 'i')
    .replace(/ş/gi, 'sh')
    .replace(/ç/gi, 'ch')
    .replace(/ğ/gi, 'gh');

  Object.keys(russianAlphabet).forEach(russianLetter => {
    slug = slug.replace(
      new RegExp(russianLetter, 'gi'),
      russianAlphabet[russianLetter],
    );
  });

  return slug;
}

export default generateSlug;
