interface ProgressBarProps {
  current: number;
  total: number;
  correctCount?: number;
  isRetry?: boolean;
}

export default function ProgressBar({
  current,
  total,
  correctCount,
  isRetry = false,
}: ProgressBarProps) {
  return (
    <div className="max-w-4xl mx-auto px-6 mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">
          {isRetry ? "Poprawka" : "Ćwiczenie"} {current} z {total}
        </span>
        {isRetry ? (
          <span className="text-sm text-yellow-600 font-semibold">Tryb poprawek</span>
        ) : (
          <span className="text-sm text-gray-600">Poprawne: {correctCount}</span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${isRetry ? "bg-yellow-500" : "bg-blue-500"}`}
          style={{
            width: `${(current / total) * 100}%`,
          }}
        ></div>
      </div>
    </div>
  );
}
