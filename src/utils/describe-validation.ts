import { DESCRIBER_LEVENSHTEIN_THRESHOLD } from 'src/types';
import { isDerivative } from './is-derivative';
import { calculateLevenshteinDistance } from './levenshtein-distance';

/**
 * Function that validates the message from the describer.
 * Checks if the message contains the current word, a derivative of the word,
 * or is too similar to the word by Levenshtein Distance.
 * @param currentWord - the current word
 * @param message - the message from the describer
 * @returns - boolean indicating if the message is valid
 */
export const validateDescriberMessage = (
  currentWord: string,
  message: string,
): boolean => {
  const normalizedMessage = message.toLowerCase().replace(/[.,!?:;]/g, ''); // Remove punctuation
  const words = normalizedMessage.split(/\s+/); // Split message into words
  const baseWord = currentWord.toLowerCase();

  // Check each word in the message
  for (let word of words) {
    if (word === baseWord) {
      return false; // Exact match
    }
    if (isDerivative(word, baseWord)) {
      return false; // Found a derivative
    }
    if (
      calculateLevenshteinDistance(word, baseWord) <=
      DESCRIBER_LEVENSHTEIN_THRESHOLD
    ) {
      // Threshold can be adjusted
      return false; // Too similar by Levenshtein Distance
    }
  }
  return true; // Message is allowed
};
