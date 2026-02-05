import { ExerciseType, type Exercise } from "@easy-lingo/shared";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Lesson from "../pages/Lesson";

// Mock fetch for vocabulary API
global.fetch = vi.fn();

// Helper to wrap component with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("Lesson - Retry Functionality", () => {
  it("shows retry intro screen when exercises have incorrect answers", async () => {
    const user = userEvent.setup();

    // Provide predetermined exercises: 2 writing exercises
    const exercises: Exercise[] = [
      {
        id: "ex1",
        type: ExerciseType.WRITING,
        pair: { id: "1", polish: "dom", english: "house" },
      },
      {
        id: "ex2",
        type: ExerciseType.WRITING,
        pair: { id: "2", polish: "kot", english: "cat" },
      },
    ];

    renderWithRouter(<Lesson exercises={exercises} />);

    // Wait for first exercise to load
    await waitFor(() => {
      expect(screen.getByText(/Przetłumacz na angielski/i)).toBeInTheDocument();
    });

    // Answer first exercise INCORRECTLY
    const input1 = screen.getByRole("textbox");
    await user.type(input1, "wrong answer");
    await user.click(screen.getByRole("button", { name: /sprawdź/i }));

    // Should show error screen (not success)
    await waitFor(() => {
      expect(screen.getByText(/Nie do końca/i)).toBeInTheDocument();
    });

    // Click "Dalej" to move to next exercise
    await user.click(screen.getByRole("button", { name: /dalej/i }));

    // Should show second exercise
    await waitFor(() => {
      expect(screen.getByText(/Ćwiczenie 2 z 2/i)).toBeInTheDocument();
    });

    // Answer second exercise CORRECTLY
    const input2 = screen.getByRole("textbox");
    await user.type(input2, "cat");
    await user.click(screen.getByRole("button", { name: /sprawdź/i }));

    // Should show success screen
    await waitFor(() => {
      expect(screen.getByText(/Odpowiedź poprawna!/i)).toBeInTheDocument();
    });

    // Click continue
    await user.click(screen.getByRole("button", { name: /dalej/i }));

    // Should show RETRY INTRO screen (because first exercise was incorrect)
    await waitFor(() => {
      expect(screen.getByText(/Czas na poprawki!/i)).toBeInTheDocument();
      expect(screen.getByText(/Masz 1 ćwiczenie do poprawienia/i)).toBeInTheDocument();
    });
  });

  it("retries incorrect exercises until all are correct", async () => {
    const user = userEvent.setup();

    const exercises: Exercise[] = [
      {
        id: "ex1",
        type: ExerciseType.WRITING,
        pair: { id: "1", polish: "dom", english: "house" },
      },
      {
        id: "ex2",
        type: ExerciseType.WRITING,
        pair: { id: "2", polish: "kot", english: "cat" },
      },
    ];

    renderWithRouter(<Lesson exercises={exercises} />);

    // Wait for first exercise to load
    await waitFor(() => {
      expect(screen.getByText(/Przetłumacz na angielski/i)).toBeInTheDocument();
      expect(screen.getByText(/dom/i)).toBeInTheDocument();
    });

    // Answer ex1 INCORRECTLY
    await user.type(screen.getByRole("textbox"), "wrong1");
    await user.click(screen.getByRole("button", { name: /sprawdź/i }));

    // Should show error screen
    await waitFor(() => {
      expect(screen.getByText(/Nie do końca/i)).toBeInTheDocument();
    });

    // Click "Dalej" to move to next exercise
    await user.click(screen.getByRole("button", { name: /dalej/i }));

    // Should show second exercise
    await waitFor(() => {
      expect(screen.getByText(/Ćwiczenie 2 z 2/i)).toBeInTheDocument();
      expect(screen.getByText(/kot/i)).toBeInTheDocument();
    });

    // Answer ex2 INCORRECTLY
    await user.type(screen.getByRole("textbox"), "wrong2");
    await user.click(screen.getByRole("button", { name: /sprawdź/i }));

    // Should show error screen
    await waitFor(() => {
      expect(screen.getByText(/Nie do końca/i)).toBeInTheDocument();
    });

    // Click "Dalej" - now both exercises were incorrect
    await user.click(screen.getByRole("button", { name: /dalej/i }));

    // Should show retry intro (2 exercises to retry)
    await waitFor(() => {
      expect(screen.getByText(/Czas na poprawki!/i)).toBeInTheDocument();
      expect(screen.getByText(/Masz 2 ćwiczenia do poprawienia/i)).toBeInTheDocument();
    });

    // Click "Dalej" to start retrying
    await user.click(screen.getByRole("button", { name: /dalej/i }));

    // Should show first exercise in retry mode
    await waitFor(() => {
      expect(screen.getByText(/Poprawka 1 z 2/i)).toBeInTheDocument();
      expect(screen.getByText(/Tryb poprawek/i)).toBeInTheDocument();
      expect(screen.getByText(/dom/i)).toBeInTheDocument();
    });

    // Answer ex1 INCORRECTLY again - this should move it to end of queue
    await user.type(screen.getByRole("textbox"), "still wrong");
    await user.click(screen.getByRole("button", { name: /sprawdź/i }));

    // Should show error screen
    await waitFor(() => {
      expect(screen.getByText(/Nie do końca/i)).toBeInTheDocument();
    });

    // Click "Dalej" - should move to ex2 (ex1 moved to end)
    await user.click(screen.getByRole("button", { name: /dalej/i }));

    // Should now show ex2 (still showing as 1 of 2 because ex1 moved to end)
    await waitFor(() => {
      expect(screen.getByText(/Poprawka 1 z 2/i)).toBeInTheDocument();
      expect(screen.getByText(/kot/i)).toBeInTheDocument();
    });

    // Answer ex2 CORRECTLY
    await user.type(screen.getByRole("textbox"), "cat");
    await user.click(screen.getByRole("button", { name: /sprawdź/i }));

    // Should show success screen
    await waitFor(() => {
      expect(screen.getByText(/Odpowiedź poprawna!/i)).toBeInTheDocument();
    });

    // Click continue
    await user.click(screen.getByRole("button", { name: /dalej/i }));

    // Should show ex1 again (was moved to end after incorrect answer)
    await waitFor(() => {
      expect(screen.getByText(/Poprawka 2 z 2/i)).toBeInTheDocument();
      expect(screen.getByText(/dom/i)).toBeInTheDocument();
    });

    // Now answer ex1 CORRECTLY
    await user.type(screen.getByRole("textbox"), "house");
    await user.click(screen.getByRole("button", { name: /sprawdź/i }));

    // Should show success screen
    await waitFor(() => {
      expect(screen.getByText(/Odpowiedź poprawna!/i)).toBeInTheDocument();
    });

    // Click continue
    await user.click(screen.getByRole("button", { name: /dalej/i }));

    // Should now show SUMMARY (all exercises completed correctly)
    await waitFor(() => {
      expect(screen.getByText(/Lekcja ukończona!/i)).toBeInTheDocument();
    });
  });

  it("shows summary immediately when all exercises are correct (no retry)", async () => {
    const user = userEvent.setup();

    const exercises: Exercise[] = [
      {
        id: "ex1",
        type: ExerciseType.WRITING,
        pair: { id: "1", polish: "dom", english: "house" },
      },
    ];

    renderWithRouter(<Lesson exercises={exercises} />);

    // Wait for exercise to load
    await waitFor(() => {
      expect(screen.getByText(/Przetłumacz na angielski/i)).toBeInTheDocument();
    });

    // Answer CORRECTLY
    const input = screen.getByRole("textbox");
    await user.type(input, "house");
    await user.click(screen.getByRole("button", { name: /sprawdź/i }));

    // Should show success screen
    await waitFor(() => {
      expect(screen.getByText(/Odpowiedź poprawna!/i)).toBeInTheDocument();
    });

    // Click continue
    await user.click(screen.getByRole("button", { name: /dalej/i }));

    // Should show summary immediately (no retry intro)
    await waitFor(() => {
      expect(screen.getByText(/Lekcja uko\u0144czona!/i)).toBeInTheDocument();
    });

    // Should NOT have shown retry intro
    expect(screen.queryByText(/Czas na poprawki!/i)).not.toBeInTheDocument();
  });

  it("retries multiple incorrect exercises in sequence", async () => {
    const user = userEvent.setup();

    const exercises: Exercise[] = [
      {
        id: "ex1",
        type: ExerciseType.WRITING,
        pair: { id: "1", polish: "dom", english: "house" },
      },
      {
        id: "ex2",
        type: ExerciseType.WRITING,
        pair: { id: "2", polish: "kot", english: "cat" },
      },
      {
        id: "ex3",
        type: ExerciseType.WRITING,
        pair: { id: "3", polish: "pies", english: "dog" },
      },
    ];

    renderWithRouter(<Lesson exercises={exercises} />);

    // Wait for first exercise
    await waitFor(() => {
      expect(screen.getByText(/Ćwiczenie 1 z 3/i)).toBeInTheDocument();
    });

    // Answer ex1 INCORRECTLY
    await user.type(screen.getByRole("textbox"), "wrong1");
    await user.click(screen.getByRole("button", { name: /sprawdź/i }));
    await waitFor(() => expect(screen.getByText(/Nie do końca/i)).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /dalej/i }));

    // Answer ex2 CORRECTLY
    await waitFor(() => expect(screen.getByText(/Ćwiczenie 2 z 3/i)).toBeInTheDocument());
    await user.type(screen.getByRole("textbox"), "cat");
    await user.click(screen.getByRole("button", { name: /sprawdź/i }));
    await waitFor(() => expect(screen.getByText(/Odpowiedź poprawna!/i)).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /dalej/i }));

    // Answer ex3 INCORRECTLY
    await waitFor(() => expect(screen.getByText(/Ćwiczenie 3 z 3/i)).toBeInTheDocument());
    await user.type(screen.getByRole("textbox"), "wrong3");
    await user.click(screen.getByRole("button", { name: /sprawdź/i }));
    await waitFor(() => expect(screen.getByText(/Nie do końca/i)).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /dalej/i }));

    // Should show retry intro (2 incorrect exercises)
    await waitFor(() => {
      expect(screen.getByText(/Czas na poprawki!/i)).toBeInTheDocument();
      expect(screen.getByText(/Masz 2 ćwiczenia do poprawienia/i)).toBeInTheDocument();
    });

    // Start retrying
    await user.click(screen.getByRole("button", { name: /dalej/i }));

    // Retry ex1 CORRECTLY
    await waitFor(() => expect(screen.getByText(/Poprawka 1 z 2/i)).toBeInTheDocument());
    await user.type(screen.getByRole("textbox"), "house");
    await user.click(screen.getByRole("button", { name: /sprawdź/i }));
    await waitFor(() => expect(screen.getByText(/Odpowiedź poprawna!/i)).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /dalej/i }));

    // Retry ex3 CORRECTLY
    await waitFor(() => expect(screen.getByText(/Poprawka 2 z 2/i)).toBeInTheDocument());
    await user.type(screen.getByRole("textbox"), "dog");
    await user.click(screen.getByRole("button", { name: /sprawdź/i }));
    await waitFor(() => expect(screen.getByText(/Odpowiedź poprawna!/i)).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /dalej/i }));

    // Should show summary
    await waitFor(() => {
      expect(screen.getByText(/Lekcja uko\u0144czona!/i)).toBeInTheDocument();
    });
  });
});
