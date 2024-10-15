const pluralize = require('pluralize')

export const isDerivative = (word: string, baseWord: string): boolean => {
  const suffixes = [
    's',
    'es',
    'ed',
    'ing',
    'er',
    'est',
    'ly',
    'ment',
    'tion',
    'ness',
    'ful',
    'less',
    'able',
    'ible',
    'ize',
    'ise',
  ];
  const prefixes = [
    'un',
    're',
    'in',
    'im',
    'dis',
    'non',
    'pre',
    'post',
    'anti',
    'de',
    'inter',
    'sub',
    'super',
    'trans',
    'over',
    'under',
  ];

  // Check for suffix matches
  if (
    suffixes.some(
      (suffix) =>
        word === baseWord + suffix || word === baseWord + 'e' + suffix,
    )
  ) {
    return true;
  }

  // Check for prefix matches
  if (prefixes.some((prefix) => word === prefix + baseWord)) {
    return true;
  }

  // Check for plural forms (using pluralize library)
  if (pluralize.isPlural(baseWord) && pluralize.singular(baseWord) === word) {
    return true;
  }

  if (pluralize.isSingular(baseWord) && pluralize.plural(baseWord) === word) {
    return true;
  }

  return false;
};
