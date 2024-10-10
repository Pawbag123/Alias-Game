import {
  GUESSER_LEVENSHTEIN_THRESHOLD,
  MIN_LEVENSHTEIN_WORD_LENGTH,
  WordStatus,
} from 'src/types';
import { calculateLevenshteinDistance } from './levenshtein-distance';

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
