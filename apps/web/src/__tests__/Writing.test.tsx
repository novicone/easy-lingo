import { render, screen, waitFor } from "@testing-library/react";
import Writing from "../components/exercises/Writing";
import { createWritingExercise, standardVocabulary } from "./testFixtures";
import { setupUser } from "./testUtils";

const mockExercise = createWritingExercise("test-exercise", standardVocabulary[0]);

describe("Writing", () => {
  it("renders exercise title", () => {
    const onComplete = vi.fn();
    render(<Writing exercise={mockExercise} onComplete={onComplete} />);

    expect(screen.getByText(/przetłumacz na angielski/i)).toBeInTheDocument();
  });

  it("displays the polish word to translate", () => {
    const onComplete = vi.fn();
    render(<Writing exercise={mockExercise} onComplete={onComplete} />);

    expect(screen.getByText("kot")).toBeInTheDocument();
  });

  it("displays input field for translation", () => {
    const onComplete = vi.fn();
    render(<Writing exercise={mockExercise} onComplete={onComplete} />);

    const input = screen.getByPlaceholderText(/wpisz tłumaczenie/i);
    expect(input).toBeInTheDocument();
  });

  it("displays check button", () => {
    const onComplete = vi.fn();
    render(<Writing exercise={mockExercise} onComplete={onComplete} />);

    expect(screen.getByRole("button", { name: /sprawdź/i })).toBeInTheDocument();
  });

  it("check button is disabled when input is empty", () => {
    const onComplete = vi.fn();
    render(<Writing exercise={mockExercise} onComplete={onComplete} />);

    const button = screen.getByRole("button", { name: /sprawdź/i });
    expect(button).toBeDisabled();
  });

  it("check button is enabled when input has text", async () => {
    const user = setupUser();
    const onComplete = vi.fn();
    render(<Writing exercise={mockExercise} onComplete={onComplete} />);

    const input = screen.getByPlaceholderText(/wpisz tłumaczenie/i);
    const button = screen.getByRole("button", { name: /sprawdź/i });

    await user.type(input, "cat");

    expect(button).not.toBeDisabled();
  });

  it("calls onComplete with true for correct answer", async () => {
    const user = setupUser();
    const onComplete = vi.fn();
    render(<Writing exercise={mockExercise} onComplete={onComplete} />);

    const input = screen.getByPlaceholderText(/wpisz tłumaczenie/i) as HTMLInputElement;
    const button = screen.getByRole("button", { name: /sprawdź/i });

    await user.type(input, "cat");
    await user.click(button);

    // Should call onComplete immediately with true
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith(true);
    });
  });

  it("accepts case-insensitive answers", async () => {
    const user = setupUser();
    const onComplete = vi.fn();
    render(<Writing exercise={mockExercise} onComplete={onComplete} />);

    const input = screen.getByPlaceholderText(/wpisz tłumaczenie/i) as HTMLInputElement;
    const button = screen.getByRole("button", { name: /sprawdź/i });

    await user.type(input, "CAT");
    await user.click(button);

    // Should call onComplete with true
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith(true);
    });
  });

  it("trims whitespace from answer", async () => {
    const user = setupUser();
    const onComplete = vi.fn();
    render(<Writing exercise={mockExercise} onComplete={onComplete} />);

    const input = screen.getByPlaceholderText(/wpisz tłumaczenie/i) as HTMLInputElement;
    const button = screen.getByRole("button", { name: /sprawdź/i });

    await user.type(input, "  cat  ");
    await user.click(button);

    // Should call onComplete with true
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith(true);
    });
  });

  it("shows error screen for incorrect answer", async () => {
    const user = setupUser();
    const onComplete = vi.fn();
    render(<Writing exercise={mockExercise} onComplete={onComplete} />);

    const input = screen.getByPlaceholderText(/wpisz tłumaczenie/i);
    const button = screen.getByRole("button", { name: /sprawdź/i });

    await user.type(input, "dog");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/nie do końca/i)).toBeInTheDocument();
    });

    // Should show correct answer
    expect(screen.getByText("cat")).toBeInTheDocument();

    // Should show user's wrong answer
    expect(screen.getByText(/twoja odpowiedź:/i)).toBeInTheDocument();
    expect(screen.getByText("dog")).toBeInTheDocument();

    // Should have continue button
    expect(screen.getByRole("button", { name: /dalej/i })).toBeInTheDocument();

    // Should not have called onComplete yet
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("calls onComplete with false when clicking continue after wrong answer", async () => {
    const user = setupUser();
    const onComplete = vi.fn();
    render(<Writing exercise={mockExercise} onComplete={onComplete} />);

    const input = screen.getByPlaceholderText(/wpisz tłumaczenie/i);
    const checkButton = screen.getByRole("button", { name: /sprawdź/i });

    await user.type(input, "dog");
    await user.click(checkButton);

    await waitFor(() => {
      expect(screen.getByText(/nie do końca/i)).toBeInTheDocument();
    });

    const continueButton = screen.getByRole("button", { name: /dalej/i });
    await user.click(continueButton);

    expect(onComplete).toHaveBeenCalledWith(false);
  });

  it("submits answer on Enter key press", async () => {
    const user = setupUser();
    const onComplete = vi.fn();
    render(<Writing exercise={mockExercise} onComplete={onComplete} />);

    const input = screen.getByPlaceholderText(/wpisz tłumaczenie/i) as HTMLInputElement;

    await user.type(input, "cat{Enter}");

    // Should call onComplete with true
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith(true);
    });
  });

  it("resets component state when key prop changes", async () => {
    // Regression test: verify that changing key prop resets internal state
    // Without key={exercise.id} in Lesson.tsx, input would retain wrong answer
    const user = setupUser();
    const onComplete = vi.fn();
    const firstExercise = createWritingExercise("exercise-1", standardVocabulary[0]);
    const secondExercise = createWritingExercise("exercise-2", standardVocabulary[1]);

    // Render first exercise and enter wrong answer
    const { rerender } = render(
      <Writing key={firstExercise.id} exercise={firstExercise} onComplete={onComplete} />,
    );

    const input1 = screen.getByPlaceholderText(/wpisz tłumaczenie/i) as HTMLInputElement;
    await user.type(input1, "wronganswer");
    expect(input1.value).toBe("wronganswer");

    await user.click(screen.getByRole("button", { name: /sprawdź/i }));
    expect(screen.getByText(/nie do końca/i)).toBeInTheDocument();

    // Change key prop to simulate moving to next exercise
    rerender(<Writing key={secondExercise.id} exercise={secondExercise} onComplete={onComplete} />);

    // Input should be empty (component was remounted with new key)
    const input2 = screen.getByPlaceholderText(/wpisz tłumaczenie/i) as HTMLInputElement;
    expect(input2.value).toBe("");
    expect(screen.getByRole("button", { name: /sprawdź/i })).toBeDisabled();
    expect(screen.queryByText(/nie do końca/i)).not.toBeInTheDocument();
    expect(screen.getByText("pies")).toBeInTheDocument();
  });
});
