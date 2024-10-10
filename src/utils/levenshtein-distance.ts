/**
 * Algorithm to calculate the Levenshtein distance between two strings.
 * that checks for similarity by checking
 * the number of single-character edits (insertions, deletions, or substitutions)
 * Used in the game mechanics to check if the guessed word is close enough to the current word.
 * @param a - first string (message)
 * @param b - second string (current word)
 * @returns - the Levenshtein distance between the two strings
 */
export const calculateLevenshteinDistance = (a: string, b: string): number => {
  const matrix: number[][] = Array.from({ length: a.length + 1 }, () =>
    Array.from({ length: b.length + 1 }, () => 0),
  );

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
};
