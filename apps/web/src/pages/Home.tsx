import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [completedLessons, setCompletedLessons] = useState(0);

  useEffect(() => {
    // Load completed lessons count from localStorage
    const count = parseInt(localStorage.getItem("completedLessons") || "0");
    setCompletedLessons(count);
  }, []);

  // Refresh counter when page becomes visible (after completing a lesson)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const count = parseInt(localStorage.getItem("completedLessons") || "0");
        setCompletedLessons(count);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const handleStartLesson = () => {
    navigate("/lesson");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">
            easy-lingo
          </h1>
          <p className="text-xl text-gray-600">
            Nauka angielskiego w prosty sposób
          </p>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm uppercase tracking-wide mb-1">
                Ukończone lekcje
              </p>
              <p className="text-5xl font-bold text-blue-600">
                {completedLessons}
              </p>
            </div>
            <div className="text-6xl">
              {completedLessons === 0
                ? "🎯"
                : completedLessons < 5
                  ? "🌱"
                  : completedLessons < 10
                    ? "🌿"
                    : "🌳"}
            </div>
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={handleStartLesson}
          className="w-full px-8 py-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-2xl font-bold rounded-2xl transition-all shadow-lg hover:shadow-2xl transform hover:scale-105"
        >
          🚀 Rozpocznij lekcję
        </button>

        {/* Info box */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-800 mb-2">Jak to działa?</h3>
          <ul className="text-blue-700 space-y-1 text-sm">
            <li>• Każda lekcja zawiera 5-10 losowych ćwiczeń</li>
            <li>• Ćwicz łączenie par i pisanie tłumaczeń</li>
            <li>• Sprawdź swój wynik na końcu lekcji</li>
            <li>• Im więcej ćwiczysz, tym więcej się uczysz! 📚</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
