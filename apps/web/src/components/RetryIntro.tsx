interface RetryIntroProps {
  incorrectCount: number;
  onContinue: () => void;
}

export default function RetryIntro({ incorrectCount, onContinue }: RetryIntroProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icon */}
        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-12 h-12 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Czas na poprawki!</h2>

        {/* Description */}
        <p className="text-xl text-gray-600 mb-8">
          {incorrectCount === 1
            ? "Masz 1 ćwiczenie do poprawienia."
            : `Masz ${incorrectCount} ćwiczenia do poprawienia.`}
          <br />
          <span className="text-gray-500">
            Powtórzmy je, aby mieć pewność, że wszystko pamiętasz!
          </span>
        </p>

        {/* Continue button */}
        <button
          onClick={onContinue}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-12 py-4 rounded-xl text-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl"
        >
          Dalej
        </button>
      </div>
    </div>
  );
}
