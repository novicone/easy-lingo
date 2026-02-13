import type { Exercise, LessonSummaryData } from "@easy-lingo/shared";
import ExerciseRenderer from "../components/ExerciseRenderer";
import ExerciseSuccess from "../components/ExerciseSuccess";
import LessonSummary from "../components/LessonSummary";
import ProgressBar from "../components/ProgressBar";
import RetryIntro from "../components/RetryIntro";
import { LessonState, useLessonState } from "./hooks/useLessonState";

interface LessonProps {
  exercises?: Exercise[]; // For tests - if provided, skips random generation
}

export default function Lesson({ exercises: providedExercises }: LessonProps = {}) {
  const {
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
  } = useLessonState({ exercises: providedExercises });

  if (showSuccess) {
    return <ExerciseSuccess onContinue={handleSuccessContinue} />;
  }

  switch (state) {
    case LessonState.LOADING:
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Przygotowuję lekcję...</p>
          </div>
        </div>
      );

    case LessonState.SUMMARY: {
      if (!progress) return null;

      const totalTime = Math.floor((progress.endTime! - progress.startTime) / 1000);
      const correctCount = progress.results.filter((r) => r.correct).length;

      const summary: LessonSummaryData = {
        totalExercises: progress.exercises.length,
        correctExercises: correctCount,
        totalTime,
      };

      return <LessonSummary summary={summary} onComplete={handleLessonComplete} />;
    }

    case LessonState.RETRY_INTRO:
      return (
        <RetryIntro incorrectCount={retryExercises.length} onContinue={handleRetryIntroContinue} />
      );

    case LessonState.RETRY: {
      if (retryExercises.length === 0) return null;

      const currentRetryExercise = retryExercises[retryIndex];

      return (
        <div className="min-h-screen py-8">
          <ProgressBar current={retryIndex + 1} total={retryExercises.length} isRetry={true} />
          <ExerciseRenderer
            exercise={currentRetryExercise}
            onComplete={handleRetryComplete}
            keyPrefix={`retry-${retryAttempt}`}
          />
        </div>
      );
    }

    case LessonState.EXERCISE: {
      if (!progress) return null;

      const currentExercise = progress.exercises[progress.currentExerciseIndex];

      return (
        <div className="min-h-screen py-8">
          <ProgressBar
            current={progress.currentExerciseIndex + 1}
            total={progress.exercises.length}
            correctCount={progress.results.filter((r) => r.correct).length}
          />
          <ExerciseRenderer exercise={currentExercise} onComplete={handleExerciseComplete} />
        </div>
      );
    }

    default:
      return null;
  }
}
