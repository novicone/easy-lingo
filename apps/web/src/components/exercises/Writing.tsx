import type { WritingExercise } from "@easy-lingo/shared";
import { useState } from "react";

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
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Nie do końca...
            </h2>
            <p className="text-gray-600">Poprawna odpowiedź to:</p>
          </div>

          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-2">
            <p className="text-xl font-bold text-green-700">
              {exercise.pair.english}
            </p>
          </div>

          <div className="text-sm text-gray-500 mb-6">
            Twoja odpowiedź: <span className="font-medium">{answer}</span>
          </div>

          <button
            onClick={handleContinue}
            className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
          >
            Dalej
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Przetłumacz na angielski
        </h2>

        <div className="mb-8 text-center">
          <div className="inline-block bg-blue-50 border-2 border-blue-300 rounded-lg px-8 py-4">
            <p className="text-3xl font-bold text-blue-700">
              {exercise.pair.polish}
            </p>
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
      </div>
    </div>
  );
}
