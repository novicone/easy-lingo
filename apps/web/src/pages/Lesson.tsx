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

  const showProgressBar = state !== LessonState.LOADING && state !== LessonState.SUMMARY;

  let progressBarProps: { current: number; total: number; isRetry?: boolean; correctCount?: number } | null = null;
  if (showProgressBar) {
    if (state === LessonState.RETRY || state === LessonState.RETRY_INTRO) {
      progressBarProps = {
        current: retryIndex + 1,
        total: retryExercises.length,
        isRetry: true,
      };
    } else if (progress) {
      progressBarProps = {
        current: progress.currentExerciseIndex + 1,
        total: progress.exercises.length,
        correctCount: progress.results.filter((r) => r.correct).length,
      };
    }
  }

  const renderContent = () => {
    if (showSuccess) {
      return <ExerciseSuccess onContinue={handleSuccessContinue} />;
    }

    switch (state) {
      case LessonState.LOADING:
        return (
          <div className="w-full flex justify-center pt-12">
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
          <RetryIntro
            incorrectCount={retryExercises.length}
            onContinue={handleRetryIntroContinue}
          />
        );

      case LessonState.RETRY: {
        if (retryExercises.length === 0) return null;

        const currentRetryExercise = retryExercises[retryIndex];

        return (
          <ExerciseRenderer
            exercise={currentRetryExercise}
            onComplete={handleRetryComplete}
            keyPrefix={`retry-${retryAttempt}`}
          />
        );
      }

      case LessonState.EXERCISE: {
        if (!progress) return null;

        const currentExercise = progress.exercises[progress.currentExerciseIndex];

        return <ExerciseRenderer exercise={currentExercise} onComplete={handleExerciseComplete} />;
      }

      default:
        return null;
    }
  };

  return (
    <div className="page-shell">
      {showProgressBar && progressBarProps && (
        <div className="w-full pt-8">
          <ProgressBar {...progressBarProps} />
        </div>
      )}
      <div className="w-full max-w-4xl px-4 pb-8 flex-grow flex flex-col items-center justify-start">
        {renderContent()}
      </div>
    </div>
  );
}
