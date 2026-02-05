import {
  ExerciseType,
  type Exercise,
  type ExerciseResult,
  type LessonProgress,
  type LessonSummaryData,
  type MatchingPairsExercise,
  type VocabularyPair,
  type WritingExercise,
} from "@easy-lingo/shared";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MatchingPairs from "../components/exercises/MatchingPairs";
import Writing from "../components/exercises/Writing";
import ExerciseSuccess from "../components/ExerciseSuccess";
import LessonSummary from "../components/LessonSummary";
import RetryIntro from "../components/RetryIntro";

enum LessonState {
  LOADING = "loading",
  EXERCISE = "exercise",
  SUCCESS = "success",
  RETRY_INTRO = "retry_intro",
  RETRY = "retry",
  SUMMARY = "summary",
}

interface LessonProps {
  exercises?: Exercise[]; // For tests - if provided, skips random generation
}

export default function Lesson({ exercises: providedExercises }: LessonProps = {}) {
  const navigate = useNavigate();
  const [state, setState] = useState<LessonState>(LessonState.LOADING);
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [retryExercises, setRetryExercises] = useState<Exercise[]>([]);
  const [retryIndex, setRetryIndex] = useState(0);
  const [retryAttempt, setRetryAttempt] = useState(0);

  useEffect(() => {
    initializeLesson();
  }, []);

  const initializeLesson = async () => {
    try {
      let exercises: Exercise[];

      if (providedExercises) {
        // Use provided exercises (test mode)
        exercises = providedExercises;
      } else {
        // Fetch vocabulary from API
        const response = await fetch("/api/vocabulary");
        const vocabulary: VocabularyPair[] = await response.json();

        // Generate random exercises
        exercises = generateExercises(vocabulary);
      }

      const lessonProgress: LessonProgress = {
        lessonId: "lesson-1",
        exercises,
        currentExerciseIndex: 0,
        results: [],
        startTime: Date.now(),
      };

      setProgress(lessonProgress);
      setState(LessonState.EXERCISE);
    } catch (error) {
      console.error("Failed to initialize lesson:", error);
      navigate("/");
    }
  };

  const generateExercises = (vocabulary: VocabularyPair[]): Exercise[] => {
    // Random number of exercises between 5 and 10
    const numExercises = Math.floor(Math.random() * 6) + 5;
    const exercises: Exercise[] = [];

    for (let i = 0; i < numExercises; i++) {
      // Random exercise type
      const isMatchingPairs = Math.random() > 0.5;

      if (isMatchingPairs) {
        // Matching pairs: select 4-6 random pairs
        const numPairs = Math.floor(Math.random() * 3) + 4;
        const selectedPairs = getRandomItems(vocabulary, numPairs);

        exercises.push({
          id: `exercise-${i}`,
          type: ExerciseType.MATCHING_PAIRS,
          pairs: selectedPairs,
        });
      } else {
        // Writing: select 1 random pair
        const selectedPair = getRandomItems(vocabulary, 1)[0];

        exercises.push({
          id: `exercise-${i}`,
          type: ExerciseType.WRITING,
          pair: selectedPair,
        });
      }
    }

    return exercises;
  };

  const getRandomItems = <T,>(array: T[], count: number): T[] => {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, array.length));
  };

  const handleExerciseComplete = (correct: boolean) => {
    if (!progress) return;

    const currentExercise = progress.exercises[progress.currentExerciseIndex];

    const result: ExerciseResult = {
      exerciseId: currentExercise.id,
      exerciseType: currentExercise.type,
      correct,
    };

    const updatedProgress = {
      ...progress,
      results: [...progress.results, result],
    };

    setProgress(updatedProgress);

    // Show success screen only if correct
    if (correct) {
      setShowSuccess(true);
    } else {
      // Move to next exercise or show summary
      moveToNextExercise(updatedProgress);
    }
  };

  const handleSuccessContinue = () => {
    setShowSuccess(false);
    if (progress) {
      moveToNextExercise(progress);
    }
  };

  const moveToNextExercise = (currentProgress: LessonProgress) => {
    if (currentProgress.currentExerciseIndex >= currentProgress.exercises.length - 1) {
      // Last exercise - check if there are any incorrect exercises
      const incorrectExercises = getIncorrectExercises(currentProgress);

      if (incorrectExercises.length > 0) {
        // There are incorrect exercises - show retry intro
        setRetryExercises(incorrectExercises);
        setRetryIndex(0);
        setState(LessonState.RETRY_INTRO);
      } else {
        // All exercises correct - show summary
        const endTime = Date.now();
        const updatedProgress = { ...currentProgress, endTime };
        setProgress(updatedProgress);
        setState(LessonState.SUMMARY);
      }
    } else {
      // Move to next exercise
      setProgress({
        ...currentProgress,
        currentExerciseIndex: currentProgress.currentExerciseIndex + 1,
      });
      setState(LessonState.EXERCISE);
    }
  };

  const getIncorrectExercises = (currentProgress: LessonProgress): Exercise[] => {
    const incorrectExerciseIds = new Set(
      currentProgress.results.filter((r) => !r.correct).map((r) => r.exerciseId),
    );

    return currentProgress.exercises.filter((ex) => incorrectExerciseIds.has(ex.id));
  };

  const handleRetryIntroContinue = () => {
    setState(LessonState.RETRY);
  };

  const handleRetryComplete = (correct: boolean) => {
    if (!progress) return;

    // Show success screen only if correct
    if (correct) {
      setShowSuccess(true);
    } else {
      // Incorrect - move this exercise to the end of retry queue
      const currentExercise = retryExercises[retryIndex];
      const updatedRetryExercises = [
        ...retryExercises.slice(0, retryIndex),
        ...retryExercises.slice(retryIndex + 1),
        currentExercise,
      ];
      setRetryExercises(updatedRetryExercises);
      setRetryAttempt((prev) => prev + 1);

      // If there are more exercises, stay at same index (which now points to next exercise)
      // Otherwise we're done (shouldn't happen as we just added one to the end)
      setState(LessonState.RETRY);
    }
  };

  const handleRetrySuccessContinue = () => {
    setShowSuccess(false);

    if (retryIndex >= retryExercises.length - 1) {
      // Last retry exercise - show summary
      if (progress) {
        const endTime = Date.now();
        const updatedProgress = { ...progress, endTime };
        setProgress(updatedProgress);
        setState(LessonState.SUMMARY);
      }
    } else {
      // Move to next retry exercise
      setRetryIndex(retryIndex + 1);
      setState(LessonState.RETRY);
    }
  };

  const handleLessonComplete = () => {
    // Increment completed lessons counter in localStorage
    const completedLessons = parseInt(localStorage.getItem("completedLessons") || "0");
    localStorage.setItem("completedLessons", (completedLessons + 1).toString());
  };

  if (state === LessonState.LOADING) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Przygotowuję lekcję...</p>
        </div>
      </div>
    );
  }

  if (state === LessonState.SUMMARY && progress) {
    const totalTime = Math.floor((progress.endTime! - progress.startTime) / 1000);
    const correctCount = progress.results.filter((r) => r.correct).length;

    const summary: LessonSummaryData = {
      totalExercises: progress.exercises.length,
      correctExercises: correctCount,
      totalTime,
    };

    return <LessonSummary summary={summary} onComplete={handleLessonComplete} />;
  }

  if (showSuccess) {
    // Determine which continue handler to use based on state
    const onContinue =
      state === LessonState.RETRY ? handleRetrySuccessContinue : handleSuccessContinue;
    return <ExerciseSuccess onContinue={onContinue} />;
  }

  if (state === LessonState.RETRY_INTRO) {
    return (
      <RetryIntro incorrectCount={retryExercises.length} onContinue={handleRetryIntroContinue} />
    );
  }

  if (state === LessonState.RETRY && retryExercises.length > 0) {
    const currentRetryExercise = retryExercises[retryIndex];

    return (
      <div className="min-h-screen py-8">
        {/* Progress bar for retries */}
        <div className="max-w-4xl mx-auto px-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Poprawka {retryIndex + 1} z {retryExercises.length}
            </span>
            <span className="text-sm text-yellow-600 font-semibold">Tryb poprawek</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((retryIndex + 1) / retryExercises.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Current retry exercise */}
        {currentRetryExercise.type === ExerciseType.MATCHING_PAIRS && (
          <MatchingPairs
            key={`${currentRetryExercise.id}-retry-${retryAttempt}`}
            exercise={currentRetryExercise as MatchingPairsExercise}
            onComplete={handleRetryComplete}
          />
        )}
        {currentRetryExercise.type === ExerciseType.WRITING && (
          <Writing
            key={`${currentRetryExercise.id}-retry-${retryAttempt}`}
            exercise={currentRetryExercise as WritingExercise}
            onComplete={handleRetryComplete}
          />
        )}
      </div>
    );
  }

  if (!progress || state !== LessonState.EXERCISE) {
    return null;
  }

  const currentExercise = progress.exercises[progress.currentExerciseIndex];

  return (
    <div className="min-h-screen py-8">
      {/* Progress bar */}
      <div className="max-w-4xl mx-auto px-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">
            Ćwiczenie {progress.currentExerciseIndex + 1} z {progress.exercises.length}
          </span>
          <span className="text-sm text-gray-600">
            Poprawne: {progress.results.filter((r) => r.correct).length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((progress.currentExerciseIndex + 1) / progress.exercises.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Current exercise */}
      {currentExercise.type === ExerciseType.MATCHING_PAIRS && (
        <MatchingPairs
          key={currentExercise.id}
          exercise={currentExercise as MatchingPairsExercise}
          onComplete={handleExerciseComplete}
        />
      )}
      {currentExercise.type === ExerciseType.WRITING && (
        <Writing
          key={currentExercise.id}
          exercise={currentExercise as WritingExercise}
          onComplete={handleExerciseComplete}
        />
      )}
    </div>
  );
}
