import type { LessonSummaryData } from "@easy-lingo/shared";
import { useNavigate } from "react-router-dom";

interface LessonSummaryProps {
  summary: LessonSummaryData;
  onComplete: () => void;
}

export default function LessonSummaryComponent({ summary, onComplete }: LessonSummaryProps) {
  const navigate = useNavigate();
  const percentage = Math.round((summary.correctExercises / summary.totalExercises) * 100);
  const minutes = Math.floor(summary.totalTime / 60);
  const seconds = summary.totalTime % 60;

  const getMessage = () => {
    if (percentage === 100) return "Perfekcyjnie! 🌟";
    if (percentage >= 80) return "Świetna robota! 🎉";
    if (percentage >= 60) return "Dobra robota! 👍";
    return "Nie poddawaj się! 💪";
  };

  const handleReturn = () => {
    onComplete();
    navigate("/");
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 bg-white rounded-2xl shadow-2xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Lekcja ukończona!</h1>
        <p className="text-xl text-gray-600">{getMessage()}</p>
      </div>

      <div className="space-y-6 mb-8">
        {/* Score */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-1">Wynik</p>
              <p className="text-3xl font-bold text-blue-600">
                {summary.correctExercises} / {summary.totalExercises}
              </p>
            </div>
            <div className="text-5xl font-bold text-blue-600">{percentage}%</div>
          </div>
        </div>

        {/* Time */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
          <p className="text-gray-600 mb-1">Czas</p>
          <p className="text-3xl font-bold text-green-600">
            {minutes > 0 && `${minutes} min `}
            {seconds} sek
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
            <p className="text-green-600 text-sm mb-1">Poprawne</p>
            <p className="text-2xl font-bold text-green-700">{summary.correctExercises}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center border border-red-200">
            <p className="text-red-600 text-sm mb-1">Błędne</p>
            <p className="text-2xl font-bold text-red-700">
              {summary.totalExercises - summary.correctExercises}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handleReturn}
        className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-lg font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
      >
        Powrót do ekranu głównego
      </button>
    </div>
  );
}
