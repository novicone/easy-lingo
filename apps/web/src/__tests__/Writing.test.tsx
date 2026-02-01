import { ExerciseType, type WritingExercise } from "@easy-lingo/shared";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Writing from "../components/exercises/Writing";

const mockExercise: WritingExercise = {
  id: "test-exercise",
  type: ExerciseType.WRITING,
  pair: { id: "1", polish: "kot", english: "cat", level: 1 },
};

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

    expect(
      screen.getByRole("button", { name: /sprawdź/i }),
    ).toBeInTheDocument();
  });

  it("check button is disabled when input is empty", () => {
    const onComplete = vi.fn();
    render(<Writing exercise={mockExercise} onComplete={onComplete} />);

    const button = screen.getByRole("button", { name: /sprawdź/i });
    expect(button).toBeDisabled();
  });

  it("check button is enabled when input has text", () => {
    const onComplete = vi.fn();
    render(<Writing exercise={mockExercise} onComplete={onComplete} />);

    const input = screen.getByPlaceholderText(/wpisz tłumaczenie/i);
    const button = screen.getByRole("button", { name: /sprawdź/i });

    fireEvent.change(input, { target: { value: "cat" } });

    expect(button).not.toBeDisabled();
  });

  it("calls onComplete with true for correct answer", async () => {
    const onComplete = vi.fn();
    render(<Writing exercise={mockExercise} onComplete={onComplete} />);

    const input = screen.getByPlaceholderText(
      /wpisz tłumaczenie/i,
    ) as HTMLInputElement;
    const button = screen.getByRole("button", { name: /sprawdź/i });

    fireEvent.change(input, { target: { value: "cat" } });
    fireEvent.click(button);

    // Should call onComplete immediately with true
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith(true);
    });
  });

  it("accepts case-insensitive answers", async () => {
    const onComplete = vi.fn();
    render(<Writing exercise={mockExercise} onComplete={onComplete} />);

    const input = screen.getByPlaceholderText(
      /wpisz tłumaczenie/i,
    ) as HTMLInputElement;
    const button = screen.getByRole("button", { name: /sprawdź/i });

    fireEvent.change(input, { target: { value: "CAT" } });
    fireEvent.click(button);

    // Should call onComplete with true
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith(true);
    });
  });

  it("trims whitespace from answer", async () => {
    const onComplete = vi.fn();
    render(<Writing exercise={mockExercise} onComplete={onComplete} />);

    const input = screen.getByPlaceholderText(
      /wpisz tłumaczenie/i,
    ) as HTMLInputElement;
    const button = screen.getByRole("button", { name: /sprawdź/i });

    fireEvent.change(input, { target: { value: "  cat  " } });
    fireEvent.click(button);

    // Should call onComplete with true
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith(true);
    });
  });

  it("shows error screen for incorrect answer", async () => {
    const onComplete = vi.fn();
    render(<Writing exercise={mockExercise} onComplete={onComplete} />);

    const input = screen.getByPlaceholderText(/wpisz tłumaczenie/i);
    const button = screen.getByRole("button", { name: /sprawdź/i });

    fireEvent.change(input, { target: { value: "dog" } });
    fireEvent.click(button);

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
    const onComplete = vi.fn();
    render(<Writing exercise={mockExercise} onComplete={onComplete} />);

    const input = screen.getByPlaceholderText(/wpisz tłumaczenie/i);
    const checkButton = screen.getByRole("button", { name: /sprawdź/i });

    fireEvent.change(input, { target: { value: "dog" } });
    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(screen.getByText(/nie do końca/i)).toBeInTheDocument();
    });

    const continueButton = screen.getByRole("button", { name: /dalej/i });
    fireEvent.click(continueButton);

    expect(onComplete).toHaveBeenCalledWith(false);
  });

  it("submits answer on Enter key press", async () => {
    const onComplete = vi.fn();
    render(<Writing exercise={mockExercise} onComplete={onComplete} />);

    const input = screen.getByPlaceholderText(
      /wpisz tłumaczenie/i,
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: "cat" } });
    fireEvent.keyPress(input, { key: "Enter", code: "Enter", charCode: 13 });

    // Should call onComplete with true
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith(true);
    });
  });

  it("resets component state when key prop changes", () => {
    // This is a regression test for the state persistence bug.
    // When a user answered incorrectly in one Writing exercise and moved to
    // the next Writing exercise, the input field retained the wrong answer.
    //
    // The fix: Add key={exercise.id} prop in Lesson.tsx so React unmounts
    // and remounts the component with fresh state.
    //
    // This test verifies that changing the key prop resets internal state.

    const onComplete = vi.fn();
    const firstExercise: WritingExercise = {
      id: "exercise-1",
      type: ExerciseType.WRITING,
      pair: { id: "1", polish: "kot", english: "cat", level: 1 },
    };

    const secondExercise: WritingExercise = {
      id: "exercise-2",
      type: ExerciseType.WRITING,
      pair: { id: "2", polish: "pies", english: "dog", level: 1 },
    };

    // Render first exercise
    const { rerender } = render(
      <Writing
        key={firstExercise.id}
        exercise={firstExercise}
        onComplete={onComplete}
      />,
    );

    const input1 = screen.getByPlaceholderText(
      /wpisz tłumaczenie/i,
    ) as HTMLInputElement;

    // User enters wrong answer
    fireEvent.change(input1, { target: { value: "wronganswer" } });
    expect(input1.value).toBe("wronganswer");

    // Click check button
    const button1 = screen.getByRole("button", { name: /sprawdź/i });
    fireEvent.click(button1);

    // Error screen appears
    expect(screen.getByText(/nie do końca/i)).toBeInTheDocument();

    // Now simulate moving to next exercise by changing key prop
    // This simulates what Lesson.tsx does: <Writing key={currentExercise.id} ... />
    rerender(
      <Writing
        key={secondExercise.id}
        exercise={secondExercise}
        onComplete={onComplete}
      />,
    );

    // CRITICAL: The input field should be empty because component was remounted
    const input2 = screen.getByPlaceholderText(
      /wpisz tłumaczenie/i,
    ) as HTMLInputElement;
    expect(input2.value).toBe("");

    // Button should be disabled (because input is empty)
    const button2 = screen.getByRole("button", { name: /sprawdź/i });
    expect(button2).toBeDisabled();

    // Error screen should be gone
    expect(screen.queryByText(/nie do końca/i)).not.toBeInTheDocument();

    // New word should be displayed
    expect(screen.getByText("pies")).toBeInTheDocument();
    expect(screen.queryByText("kot")).not.toBeInTheDocument();
  });
});
