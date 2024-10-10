export const isDerivative = (word: string, baseWord: string): boolean => {
  const suffixes = [
    's', 'es', 'ed', 'ing', 'er', 'est', 'ly', 'ment', 'tion', 'ness', 
    'ful', 'less', 'able', 'ible', 'ize', 'ise'
  ]; // Common suffixes
  const prefixes = [
    'un', 're', 'in', 'im', 'dis', 'non', 'pre', 'post', 'anti', 'de', 
    'inter', 'sub', 'super', 'trans', 'over', 'under'
  ]; // Common prefixes

  // Check for suffix matches
  if (suffixes.some(suffix => word === baseWord + suffix || word === baseWord + 'e' + suffix)) {
    return true;
  }

  // Check for prefix matches
  if (prefixes.some(prefix => word === prefix + baseWord)) {
    return true;
  }

  return false;
};
