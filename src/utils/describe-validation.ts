import { DESCRIBER_LEVENSHTEIN_THRESHOLD } from 'src/types';
import { isDerivative } from './is-derivative';
import { calculateLevenshteinDistance } from './levenshtein-distance';

export const validateDescriberMessage = (
  currentWord: string,
  message: string,
): [string, boolean] => {
  const normalizedMessage = message.toLowerCase().replace(/[.,!?:;]/g, ''); // Remove punctuation
  const words = normalizedMessage.split(/\s+/); // Split message into words
  const baseWord = currentWord.toLowerCase();

  // Check each word in the message
  for (let word of words) {
    if (word === baseWord) {
      return [message, false]; // Exact match
    }
    if (isDerivative(word, baseWord)) {
      return [message, false]; // Found a derivative
    }
    if (
      calculateLevenshteinDistance(word, baseWord) <=
      DESCRIBER_LEVENSHTEIN_THRESHOLD
    ) {
      // Threshold can be adjusted
      return [message, false]; // Too similar by Levenshtein Distance
    }
  }
  return [message, true]; // Message is allowed
};
