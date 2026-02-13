import { ExerciseType, type Exercise, type VocabularyPair } from "@easy-lingo/shared";

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDirection(): "pl-en" | "en-pl" {
  return Math.random() < 0.5 ? "pl-en" : "en-pl";
}

function randomExerciseType(): ExerciseType {
  const types = Object.values(ExerciseType).filter((v): v is ExerciseType => typeof v === "number");
  return types[Math.floor(Math.random() * types.length)];
}

export function getForcedExerciseType(mode: string | null): ExerciseType | null {
  if (mode === "matching") return ExerciseType.MATCHING_PAIRS;
  if (mode === "writing") return ExerciseType.WRITING;
  if (mode === "select") return ExerciseType.SELECT_TRANSLATION;
  return null;
}

export function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = shuffle(array);
  return shuffled.slice(0, Math.min(count, array.length));
}

function generateMatchingPairsExercise(id: string, vocabulary: VocabularyPair[]): Exercise {
  const numPairs = randomInRange(4, 6);
  const selectedPairs = getRandomItems(vocabulary, numPairs);

  return {
    id,
    type: ExerciseType.MATCHING_PAIRS,
    pairs: selectedPairs,
  };
}

function generateWritingExercise(id: string, vocabulary: VocabularyPair[]): Exercise {
  const selectedPair = getRandomItems(vocabulary, 1)[0];

  return {
    id,
    type: ExerciseType.WRITING,
    pair: selectedPair,
  };
}

function generateSelectTranslationExercise(id: string, vocabulary: VocabularyPair[]): Exercise {
  const numOptions = randomInRange(3, 5);
  const selectedPairs = getRandomItems(vocabulary, numOptions);
  const correctPair = selectedPairs[0];
  const allOptions = shuffle(selectedPairs);
  const direction = randomDirection();

  return {
    id,
    type: ExerciseType.SELECT_TRANSLATION,
    correctPair,
    allOptions,
    direction,
  };
}

export function generateExercises(
  vocabulary: VocabularyPair[],
  forcedType: ExerciseType | null,
): Exercise[] {
  const numExercises = forcedType !== null ? 3 : randomInRange(5, 10);
  const exercises: Exercise[] = [];

  for (let i = 0; i < numExercises; i++) {
    const exerciseId = `exercise-${i}`;
    const exerciseType = forcedType ?? randomExerciseType();

    let exercise: Exercise;

    if (exerciseType === ExerciseType.MATCHING_PAIRS) {
      exercise = generateMatchingPairsExercise(exerciseId, vocabulary);
    } else if (exerciseType === ExerciseType.WRITING) {
      exercise = generateWritingExercise(exerciseId, vocabulary);
    } else {
      exercise = generateSelectTranslationExercise(exerciseId, vocabulary);
    }

    exercises.push(exercise);
  }

  return exercises;
}
