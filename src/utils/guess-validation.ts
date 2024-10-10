import {
  GUESSER_LEVENSHTEIN_THRESHOLD,
  MIN_LEVENSHTEIN_WORD_LENGTH,
  WordStatus,
} from 'src/types';
import { calculateLevenshteinDistance } from './levenshtein-distance';

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
    return [message, WordStatus.NOT_GUESSED]; // Reject multi-word guesses
  }

  // Exact match check
  if (normalizedMessage === currentWord.toLowerCase()) {
    return [`${message} ✅`, WordStatus.GUESSED]; // Word guessed correctly
  }

  // Levenshtein Distance check (allowing some misspellings)
  // disable checking for short words to avoid false positives
  // check if the distance is less than the threshold
  if (
    normalizedMessage.length > MIN_LEVENSHTEIN_WORD_LENGTH &&
    calculateLevenshteinDistance(
      normalizedMessage,
      currentWord.toLowerCase(),
    ) <= GUESSER_LEVENSHTEIN_THRESHOLD
  ) {
    // Threshold can be 1-2
    return [`${message} 🤏`, WordStatus.SIMILAR]; // Close
  }

  return [message, WordStatus.NOT_GUESSED]; // Guess is incorrect
};
