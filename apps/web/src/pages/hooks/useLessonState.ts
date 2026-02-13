import type { Exercise, ExerciseResult, LessonProgress } from "@easy-lingo/shared";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { generateExercises, getForcedExerciseType } from "../utils/lessonHelpers";

export enum LessonState {
  LOADING = "loading",
  EXERCISE = "exercise",
  SUCCESS = "success",
  RETRY_INTRO = "retry_intro",
  RETRY = "retry",
  SUMMARY = "summary",
}

interface UseLessonStateProps {
  exercises?: Exercise[];
}

export function useLessonState({ exercises: providedExercises }: UseLessonStateProps = {}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
        const vocabulary = await response.json();

        const mode = searchParams.get("mode");
        const forcedType = getForcedExerciseType(mode);

        // Generate exercises
        exercises = generateExercises(vocabulary, forcedType);
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

  const getIncorrectExercises = (currentProgress: LessonProgress): Exercise[] => {
    const incorrectExerciseIds = new Set(
      currentProgress.results.filter((r) => !r.correct).map((r) => r.exerciseId),
    );

    return currentProgress.exercises.filter((ex) => incorrectExerciseIds.has(ex.id));
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
    const isRetryMode = state === LessonState.RETRY;

    if (isRetryMode) {
      // Retry mode: move to next retry exercise or show summary
      if (retryIndex >= retryExercises.length - 1) {
        if (progress) {
          const endTime = Date.now();
          const updatedProgress = { ...progress, endTime };
          setProgress(updatedProgress);
          setState(LessonState.SUMMARY);
        }
      } else {
        setRetryIndex(retryIndex + 1);
        setState(LessonState.RETRY);
      }
    } else {
      // Normal mode: move to next exercise
      if (progress) {
        moveToNextExercise(progress);
      }
    }
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

  const handleLessonComplete = () => {
    // Increment completed lessons counter in localStorage
    const completedLessons = parseInt(localStorage.getItem("completedLessons") || "0");
    localStorage.setItem("completedLessons", (completedLessons + 1).toString());
  };

  return {
    state,
    progress,
    showSuccess,
    retryExercises,
    retryIndex,
    retryAttempt,
    handleExerciseComplete,
    handleSuccessContinue,
    handleRetryIntroContinue,
    handleRetryComplete,
    handleLessonComplete,
  };
}
