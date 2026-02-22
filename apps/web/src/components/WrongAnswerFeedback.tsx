import ExerciseCard from "./ExerciseCard";

interface WrongAnswerFeedbackProps {
  correctAnswer: string;
  userAnswer: string;
  onContinue: () => void;
}

export default function WrongAnswerFeedback({
  correctAnswer,
  userAnswer,
  onContinue,
}: WrongAnswerFeedbackProps) {
  return (
    <ExerciseCard centered>
      <div className="mb-6">
        <div className="text-6xl mb-4">😔</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Nie do końca...</h2>
        <p className="text-gray-600">Poprawna odpowiedź to:</p>
      </div>

      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-2">
        <p className="text-xl font-bold text-green-700">{correctAnswer}</p>
      </div>

      <div className="text-sm text-gray-500 mb-6">
        Twoja odpowiedź: <span className="font-medium">{userAnswer}</span>
      </div>

      <button onClick={onContinue} className="btn-continue">
        Dalej
      </button>
    </ExerciseCard>
  );
}
