import { ExerciseType, type Exercise } from "@easy-lingo/shared";
import MatchingPairs from "./exercises/MatchingPairs";
import SelectTranslation from "./exercises/SelectTranslation";
import Writing from "./exercises/Writing";

interface ExerciseRendererProps {
  exercise: Exercise;
  onComplete: (correct: boolean) => void;
  keyPrefix?: string;
}

export default function ExerciseRenderer({
  exercise,
  onComplete,
  keyPrefix,
}: ExerciseRendererProps) {
  const key = keyPrefix ? `${exercise.id}-${keyPrefix}` : exercise.id;

  switch (exercise.type) {
    case ExerciseType.MATCHING_PAIRS:
      return <MatchingPairs key={key} exercise={exercise} onComplete={onComplete} />;
    case ExerciseType.WRITING:
      return <Writing key={key} exercise={exercise} onComplete={onComplete} />;
    case ExerciseType.SELECT_TRANSLATION:
      return <SelectTranslation key={key} exercise={exercise} onComplete={onComplete} />;
    default:
      // Exhaustive check: TypeScript error if new exercise type added but not handled
      const _exhaustive: never = exercise;
      return _exhaustive;
  }
}
