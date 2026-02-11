import type { SelectTranslationExercise, VocabularyPair } from "@easy-lingo/shared";
import { useState } from "react";

interface SelectTranslationProps {
  exercise: SelectTranslationExercise;
  onComplete: (correct: boolean) => void;
}

export default function SelectTranslation({ exercise, onComplete }: SelectTranslationProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleOptionClick = (pair: VocabularyPair) => {
    const correct = pair.id === exercise.correctPair.id;

    setSelectedAnswer(pair.id);
    setIsCorrect(correct);
    setShowResult(true);

    // For correct answer, immediately notify parent
    if (correct) {
      onComplete(true);
    }
  };

  const handleContinue = () => {
    onComplete(false);
  };

  // Determine question text and option text based on direction
  const questionText =
    exercise.direction === "pl-en" ? exercise.correctPair.polish : exercise.correctPair.english;

  const headerText =
    exercise.direction === "pl-en" ? "Przetłumacz na angielski" : "Przetłumacz na polski";

  const getOptionText = (pair: VocabularyPair) => {
    return exercise.direction === "pl-en" ? pair.english : pair.polish;
  };

  const selectedPair = exercise.allOptions.find((p) => p.id === selectedAnswer);
  const userAnswerText = selectedPair ? getOptionText(selectedPair) : "";
  const correctAnswerText = getOptionText(exercise.correctPair);

  if (showResult && !isCorrect) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Nie do końca...</h2>
            <p className="text-gray-600">Poprawna odpowiedź to:</p>
          </div>

          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-2">
            <p className="text-xl font-bold text-green-700">{correctAnswerText}</p>
          </div>

          <div className="text-sm text-gray-500 mb-6">
            Twoja odpowiedź: <span className="font-medium">{userAnswerText}</span>
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
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">{headerText}</h2>

        <div className="mb-8 text-center">
          <div className="inline-block bg-blue-50 border-2 border-blue-300 rounded-lg px-8 py-4">
            <p className="text-3xl font-bold text-blue-700">{questionText}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          {exercise.allOptions.map((pair) => (
            <button
              key={pair.id}
              onClick={() => handleOptionClick(pair)}
              disabled={showResult}
              className="inline-flex items-center justify-center px-5 py-3 rounded-lg border-2 border-gray-300 bg-white hover:border-blue-400 hover:shadow-md transition-all text-center font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {getOptionText(pair)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
