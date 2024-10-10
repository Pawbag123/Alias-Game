import {
  GUESSER_LEVENSHTEIN_THRESHOLD,
  MIN_LEVENSHTEIN_WORD_LENGTH,
  WordStatus,
} from 'src/types';
import { calculateLevenshteinDistance, calculateDamerauLevenshteinDistance } from './levenshtein-distance';

/**
 * Function that checks if the guessed word is correct, close, or incorrect.
 * Used in the game mechanics to validate the guessed word.
 * @param currentWord - the current word
 * @param message - the guessed word
 * @returns [validatedMessage, wordStatus] - the validated message and the status of the word
 */
export const checkGuessedWord = (
  currentWord: string,
  message: string,
): [string, WordStatus] => {
  const normalizedMessage = message.toLowerCase().trim();

  // Ensure single-word guesses
  if (normalizedMessage.includes(' ')) {
    return [`"${message}" is not a single word.`, WordStatus.NOT_GUESSED];
  } // Reject multi-word guesses

  // Exact match check
  if (normalizedMessage === currentWord.toLowerCase()) {
    return [`"${message}" is correct! ✅`, WordStatus.GUESSED];
  } // Word guessed correctly  

  // Levenshtein Distance check (allowing some misspellings)
  // disable checking for short words to avoid false positives
  // check if the distance is less than the threshold
  if (
    normalizedMessage.length > MIN_LEVENSHTEIN_WORD_LENGTH
    &&
    // Using DamerauLevenshtein instead LevenshteinDistance
    calculateDamerauLevenshteinDistance(normalizedMessage, currentWord.toLowerCase()) <= GUESSER_LEVENSHTEIN_THRESHOLD
  ) {
    return [`"${message}" is close, but not quite. 🤏`, WordStatus.SIMILAR]; // Close
  }

  return [`"${message}" is incorrect.`, WordStatus.NOT_GUESSED];  // Guess is incorrect
};
