import {
  GUESSER_LEVENSHTEIN_THRESHOLD,
  MIN_LEVENSHTEIN_WORD_LENGTH,
  WordStatus,
} from 'src/types';
import { calculateDamerauLevenshteinDistance } from './levenshtein-distance';

import axios from 'axios';
const pluralize = require('pluralize')

/**
 * Function that checks if the guessed word is correct, close, or incorrect.
 * Used in the game mechanics to validate the guessed word.
 * @param currentWord - the current word
 * @param message - the guessed word
 * @returns [validatedMessage, wordStatus] - the validated message and the status of the word
 */

export const checkGuessedWord = async (
  currentWord: string,
  message: string,
): Promise<[string, WordStatus]> => {
  const normalizedMessage = message.toLowerCase().trim();
  const TargetWord = currentWord.toLowerCase();

  // Ensure single-word guesses
  if (normalizedMessage.includes(' ')) {
    return [
      `"${message}" contains multiple words. Please guess a single word!`,
      WordStatus.NOT_GUESSED,
    ];
  }

  // Check if the guessed word is the plural of the current word
  if (normalizedMessage === pluralize(TargetWord)) {
    return [`${message} 🔄`, WordStatus.PLURAL]; // Plural guessed correctly
  }

  // Exact match check
  if (normalizedMessage === TargetWord) {
    return [`${message} ✅`, WordStatus.GUESSED];
  }

  // Check for synonyms using Datamuse API
  const isSynonym = await checkIfSynonym(currentWord, normalizedMessage);
  if (isSynonym) {
    return [`${message} 🔄`, WordStatus.SIMILAR];
  }

  // Levenshtein Distance check (allowing some misspellings)
  if (
    normalizedMessage.length > MIN_LEVENSHTEIN_WORD_LENGTH &&
    calculateDamerauLevenshteinDistance(normalizedMessage, TargetWord) <=
      GUESSER_LEVENSHTEIN_THRESHOLD
  ) {
    return [`${message} 🤏`, WordStatus.SIMILAR];
  }

  return [message, WordStatus.NOT_GUESSED];
};

// Helper function to check synonyms using Datamuse API
const checkIfSynonym = async (
  currentWord: string,
  guessedWord: string,
): Promise<boolean> => {
  try {
    const response = await axios.get(
      `https://api.datamuse.com/words?ml=${currentWord}`,
    );
    const synonyms = response.data.map((entry: { word: string }) =>
      entry.word.toLowerCase(),
    );
    return synonyms.includes(guessedWord.toLowerCase());
  } catch (error) {
    console.error('Error fetching synonyms:', error);
    return false;
  }
};
