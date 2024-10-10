export const isDerivative = (word: string, baseWord: string): boolean => {
  const suffixes = ['s', 'es', 'ed', 'ing', 'er', 'est', 'ly']; // Common suffixes
  const prefixes = ['un', 're', 'in', 'im', 'dis', 'non']; // Common prefixes

  // Check for prefix/suffix matches
  for (let suffix of suffixes) {
    if (word === baseWord + suffix || word === baseWord + 'e' + suffix) {
      return true;
    }
  }
  for (let prefix of prefixes) {
    if (word === prefix + baseWord) {
      return true;
    }
  }
  return false;
};
