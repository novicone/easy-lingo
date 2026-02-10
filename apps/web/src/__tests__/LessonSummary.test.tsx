import type { LessonSummaryData } from "@easy-lingo/shared";
import { screen } from "@testing-library/react";
import LessonSummary from "../components/LessonSummary";
import { renderWithRouter, setupUser } from "./testUtils";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("LessonSummary", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("renders completion title and basic summary info", () => {
    const summary: LessonSummaryData = {
      totalExercises: 5,
      correctExercises: 4,
      totalTime: 120,
    };
    const onComplete = vi.fn();

    renderWithRouter(<LessonSummary summary={summary} onComplete={onComplete} />);

    expect(screen.getByText(/lekcja ukończona/i)).toBeInTheDocument();
    expect(screen.getByText("4 / 5")).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
  });

  it("displays time in minutes and seconds", () => {
    const summary: LessonSummaryData = {
      totalExercises: 5,
      correctExercises: 5,
      totalTime: 125, // 2 min 5 sec
    };
    const onComplete = vi.fn();

    renderWithRouter(<LessonSummary summary={summary} onComplete={onComplete} />);

    expect(screen.getByText(/2 min 5 sek/i)).toBeInTheDocument();
  });

  it("displays time in seconds only when under 1 minute", () => {
    const summary: LessonSummaryData = {
      totalExercises: 5,
      correctExercises: 5,
      totalTime: 45, // 45 sec
    };
    const onComplete = vi.fn();

    renderWithRouter(<LessonSummary summary={summary} onComplete={onComplete} />);

    expect(screen.getByText(/45 sek/i)).toBeInTheDocument();
    expect(screen.queryByText(/min/i)).not.toBeInTheDocument();
  });

  it("displays correct and incorrect exercise counts", () => {
    const summary: LessonSummaryData = {
      totalExercises: 10,
      correctExercises: 7,
      totalTime: 180,
    };
    const onComplete = vi.fn();

    renderWithRouter(<LessonSummary summary={summary} onComplete={onComplete} />);

    expect(screen.getByText("7")).toBeInTheDocument(); // Correct
    expect(screen.getByText("3")).toBeInTheDocument(); // Incorrect (10-7)
  });

  it("shows appropriate message for 100% score", () => {
    const summary: LessonSummaryData = {
      totalExercises: 5,
      correctExercises: 5,
      totalTime: 120,
    };
    const onComplete = vi.fn();

    renderWithRouter(<LessonSummary summary={summary} onComplete={onComplete} />);

    expect(screen.getByText(/perfekcyjnie/i)).toBeInTheDocument();
  });

  it("shows appropriate message for 80-99% score", () => {
    const summary: LessonSummaryData = {
      totalExercises: 5,
      correctExercises: 4,
      totalTime: 120,
    };
    const onComplete = vi.fn();

    renderWithRouter(<LessonSummary summary={summary} onComplete={onComplete} />);

    expect(screen.getByText(/świetna robota/i)).toBeInTheDocument();
  });

  it("shows appropriate message for 60-79% score", () => {
    const summary: LessonSummaryData = {
      totalExercises: 10,
      correctExercises: 7,
      totalTime: 120,
    };
    const onComplete = vi.fn();

    renderWithRouter(<LessonSummary summary={summary} onComplete={onComplete} />);

    expect(screen.getByText(/dobra robota/i)).toBeInTheDocument();
  });

  it("shows encouraging message for low score", () => {
    const summary: LessonSummaryData = {
      totalExercises: 10,
      correctExercises: 3,
      totalTime: 120,
    };
    const onComplete = vi.fn();

    renderWithRouter(<LessonSummary summary={summary} onComplete={onComplete} />);

    expect(screen.getByText(/nie poddawaj się/i)).toBeInTheDocument();
  });

  it("displays return button", () => {
    const summary: LessonSummaryData = {
      totalExercises: 5,
      correctExercises: 4,
      totalTime: 120,
    };
    const onComplete = vi.fn();

    renderWithRouter(<LessonSummary summary={summary} onComplete={onComplete} />);

    expect(screen.getByRole("button", { name: /powrót do ekranu głównego/i })).toBeInTheDocument();
  });

  it("calls onComplete and navigates to home when return button is clicked", async () => {
    const user = setupUser();
    const summary: LessonSummaryData = {
      totalExercises: 5,
      correctExercises: 4,
      totalTime: 120,
    };
    const onComplete = vi.fn();

    renderWithRouter(<LessonSummary summary={summary} onComplete={onComplete} />);

    const button = screen.getByRole("button", {
      name: /powrót do ekranu głównego/i,
    });
    await user.click(button);

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
