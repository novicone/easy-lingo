import type { WritingExercise } from "@easy-lingo/shared";
import { useState } from "react";
import ExerciseCard from "../ExerciseCard";
import WrongAnswerFeedback from "../WrongAnswerFeedback";

interface WritingProps {
  exercise: WritingExercise;
  onComplete: (correct: boolean) => void;
}

export default function Writing({ exercise, onComplete }: WritingProps) {
  const [answer, setAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleCheck = () => {
    const normalizedAnswer = answer.trim().toLowerCase();
    const normalizedCorrect = exercise.pair.english.trim().toLowerCase();
    const correct = normalizedAnswer === normalizedCorrect;

    setIsCorrect(correct);
    setShowResult(true);

    // For correct answer, immediately notify parent
    // Parent (Lesson) will show success screen (ExerciseSuccess)
    if (correct) {
      onComplete(true);
    }
  };

  const handleContinue = () => {
    onComplete(isCorrect);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !showResult) {
      handleCheck();
    }
  };

  if (showResult && !isCorrect) {
    return (
      <WrongAnswerFeedback
        correctAnswer={exercise.pair.english}
        userAnswer={answer}
        onContinue={handleContinue}
      />
    );
  }

  return (
    <ExerciseCard>
      <h2 className="exercise-heading">Przetłumacz na angielski</h2>

      <div className="mb-8 text-center">
        <div className="question-word">
          <p className="text-3xl font-bold text-blue-700">{exercise.pair.polish}</p>
        </div>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Wpisz tłumaczenie..."
          className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          autoFocus
          disabled={showResult}
        />

        <button
          onClick={handleCheck}
          disabled={!answer.trim() || showResult}
          className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
        >
          Sprawdź
        </button>
      </div>
    </ExerciseCard>
  );
}
