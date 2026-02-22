interface ExerciseCardProps {
  children: React.ReactNode;
  centered?: boolean;
  className?: string;
}

export default function ExerciseCard({ children, centered, className }: ExerciseCardProps) {
  const cardClasses = [
    "bg-white rounded-xl shadow-lg p-8",
    centered ? "text-center" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className={cardClasses}>{children}</div>
    </div>
  );
}
