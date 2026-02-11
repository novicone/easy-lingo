import {
  ExerciseType,
  MatchingPairsExercise,
  SelectTranslationExercise,
  WritingExercise,
  type Exercise,
  type VocabularyPair,
} from "@easy-lingo/shared";

/**
 * Standard vocabulary pairs for testing
 */
export const standardVocabulary: VocabularyPair[] = [
  { id: "1", polish: "kot", english: "cat", level: 1 },
  { id: "2", polish: "pies", english: "dog", level: 1 },
  { id: "3", polish: "dom", english: "house", level: 1 },
  { id: "4", polish: "woda", english: "water", level: 1 },
  { id: "5", polish: "jedzenie", english: "food", level: 1 },
  { id: "6", polish: "dzień", english: "day", level: 1 },
  { id: "7", polish: "noc", english: "night", level: 1 },
];

/**
 * Creates a Writing exercise with given pair (or default)
 */
export function createWritingExercise(id: string, pair = standardVocabulary[0]): WritingExercise {
  return {
    id,
    type: ExerciseType.WRITING,
    pair,
  };
}

/**
 * Creates a MatchingPairs exercise with given pairs (or default)
 */
export function createMatchingPairsExercise(
  id: string,
  pairs = standardVocabulary.slice(0, 3),
): MatchingPairsExercise {
  return {
    id,
    type: ExerciseType.MATCHING_PAIRS,
    pairs,
  };
}

/**
 * Creates a SelectTranslation exercise with given parameters
 */
export function createSelectTranslationExercise(
  id: string,
  correctPair: VocabularyPair,
  allOptions: VocabularyPair[],
  direction: "pl-en" | "en-pl",
): SelectTranslationExercise {
  return {
    id,
    type: ExerciseType.SELECT_TRANSLATION,
    correctPair,
    allOptions,
    direction,
  };
}

/**
 * Creates a set of mixed exercises for testing
 */
export function createExerciseSet(count: number): Exercise[] {
  const exercises: Exercise[] = [];
  for (let i = 0; i < count; i++) {
    const pairIndex = i % standardVocabulary.length;
    if (i % 2 === 0) {
      exercises.push(createWritingExercise(`ex-${i}`, standardVocabulary[pairIndex]));
    } else {
      exercises.push(
        createMatchingPairsExercise(`ex-${i}`, standardVocabulary.slice(pairIndex, pairIndex + 3)),
      );
    }
  }
  return exercises;
}
