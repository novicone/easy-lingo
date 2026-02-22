import type { SelectTranslationExercise, VocabularyPair } from "@easy-lingo/shared";
import { useState } from "react";
import ExerciseCard from "../ExerciseCard";
import WrongAnswerFeedback from "../WrongAnswerFeedback";

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
      <WrongAnswerFeedback
        correctAnswer={correctAnswerText}
        userAnswer={userAnswerText}
        onContinue={handleContinue}
      />
    );
  }

  return (
    <ExerciseCard>
      <h2 className="exercise-heading">{headerText}</h2>

      <div className="mb-8 text-center">
        <div className="question-word">
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
    </ExerciseCard>
  );
}
