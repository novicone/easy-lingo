interface ExerciseSuccessProps {
  onContinue: () => void;
}

export default function ExerciseSuccess({ onContinue }: ExerciseSuccessProps) {
  const praises = [
    "Wspaniale!",
    "Doskonale!",
    "Świetnie!",
    "Brawo!",
    "Fantastycznie!",
    "Znakomicie!",
    "Super!",
    "Perfekcyjnie!",
  ];

  const randomPraise = praises[Math.floor(Math.random() * praises.length)];

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center animate-fade-in">
        <div className="mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-green-600 mb-2">
            {randomPraise}
          </h2>
          <p className="text-gray-600">Odpowiedź poprawna!</p>
        </div>

        <button
          onClick={onContinue}
          className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
        >
          Dalej
        </button>
      </div>
    </div>
  );
}
