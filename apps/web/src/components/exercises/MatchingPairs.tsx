import type { MatchingPairsExercise, VocabularyPair } from "@easy-lingo/shared";
import { useEffect, useState } from "react";

interface MatchingPairsProps {
  exercise: MatchingPairsExercise;
  onComplete: (correct: boolean) => void;
}

interface SelectedPair {
  polish?: VocabularyPair;
  english?: VocabularyPair;
}

export default function MatchingPairs({ exercise, onComplete }: MatchingPairsProps) {
  const [selectedPair, setSelectedPair] = useState<SelectedPair>({});
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [errorPair, setErrorPair] = useState<SelectedPair | null>(null);
  const [shuffledEnglish, setShuffledEnglish] = useState<VocabularyPair[]>([]);

  useEffect(() => {
    // Shuffle English words
    const shuffled = [...exercise.pairs].sort(() => Math.random() - 0.5);
    setShuffledEnglish(shuffled);
  }, [exercise]);

  const handlePolishClick = (pair: VocabularyPair) => {
    if (matchedPairs.has(pair.id)) return;

    setSelectedPair((prev) => ({ ...prev, polish: pair }));

    // Check if we have both selected
    if (selectedPair.english) {
      checkMatch(pair, selectedPair.english);
    }
  };

  const handleEnglishClick = (pair: VocabularyPair) => {
    if (matchedPairs.has(pair.id)) return;

    setSelectedPair((prev) => ({ ...prev, english: pair }));

    // Check if we have both selected
    if (selectedPair.polish) {
      checkMatch(selectedPair.polish, pair);
    }
  };

  const checkMatch = (polish: VocabularyPair, english: VocabularyPair) => {
    if (polish.id === english.id) {
      // Correct match!
      setMatchedPairs((prev) => new Set([...prev, polish.id]));
      setSelectedPair({});

      // Check if all pairs are matched
      if (matchedPairs.size + 1 === exercise.pairs.length) {
        setTimeout(() => onComplete(true), 300);
      }
    } else {
      // Wrong match
      setErrorPair({ polish, english });
      setTimeout(() => {
        setErrorPair(null);
        setSelectedPair({});
      }, 800);
    }
  };

  const getTileClass = (pair: VocabularyPair, side: "polish" | "english") => {
    const isMatched = matchedPairs.has(pair.id);
    const isSelected =
      side === "polish"
        ? selectedPair.polish?.id === pair.id
        : selectedPair.english?.id === pair.id;
    const isError =
      side === "polish" ? errorPair?.polish?.id === pair.id : errorPair?.english?.id === pair.id;

    let classes = "p-4 rounded-lg cursor-pointer transition-all border-2 ";

    if (isMatched) {
      classes += "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300";
    } else if (isError) {
      classes += "bg-red-100 border-red-500 text-red-700";
    } else if (isSelected) {
      classes += "bg-blue-100 border-blue-500 text-blue-700";
    } else {
      classes += "bg-white border-gray-300 hover:border-blue-400 hover:shadow-md";
    }

    return classes;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="exercise-heading">Połącz pary słów</h2>

      <div className="grid grid-cols-2 gap-8">
        {/* Polish column */}
        <div className="space-y-3">
          {exercise.pairs.map((pair) => (
            <div
              key={`polish-${pair.id}`}
              className={getTileClass(pair, "polish")}
              onClick={() => handlePolishClick(pair)}
            >
              <p className="text-center font-medium">{pair.polish}</p>
            </div>
          ))}
        </div>

        {/* English column */}
        <div className="space-y-3">
          {shuffledEnglish.map((pair) => (
            <div
              key={`english-${pair.id}`}
              className={getTileClass(pair, "english")}
              onClick={() => handleEnglishClick(pair)}
            >
              <p className="text-center font-medium">{pair.english}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center text-gray-600">
        Dopasowano: {matchedPairs.size} / {exercise.pairs.length}
      </div>
    </div>
  );
}
