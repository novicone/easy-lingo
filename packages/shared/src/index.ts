export interface LessonSummary {
  id: string;
  title: string;
  description?: string;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
}

// Vocabulary
export interface VocabularyPair {
  id: string;
  polish: string;
  english: string;
  level?: number;
}

// Exercise types
export enum ExerciseType {
  MATCHING_PAIRS,
  WRITING,
  SELECT_TRANSLATION,
}

export interface BaseExercise {
  id: string;
  type: ExerciseType;
}

export interface MatchingPairsExercise extends BaseExercise {
  type: ExerciseType.MATCHING_PAIRS;
  pairs: VocabularyPair[];
}

export interface WritingExercise extends BaseExercise {
  type: ExerciseType.WRITING;
  pair: VocabularyPair;
}

export interface SelectTranslationExercise extends BaseExercise {
  type: ExerciseType.SELECT_TRANSLATION;
  correctPair: VocabularyPair;
  allOptions: VocabularyPair[];
  direction: "pl-en" | "en-pl";
}

export type Exercise = MatchingPairsExercise | WritingExercise | SelectTranslationExercise;

// Lesson progress
export interface ExerciseResult {
  exerciseId: string;
  exerciseType: ExerciseType;
  correct: boolean;
  timeSpent?: number;
}

export interface LessonProgress {
  lessonId: string;
  exercises: Exercise[];
  currentExerciseIndex: number;
  results: ExerciseResult[];
  startTime: number;
  endTime?: number;
}

export interface LessonSummaryData {
  totalExercises: number;
  correctExercises: number;
  totalTime: number; // in seconds
}
