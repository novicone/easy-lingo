import { ExerciseType, type Exercise, type VocabularyPair } from "@easy-lingo/shared";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import Lesson from "../pages/Lesson";

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock vocabulary API response
const mockVocabulary: VocabularyPair[] = [
  { id: "1", polish: "kot", english: "cat", level: 1 },
  { id: "2", polish: "pies", english: "dog", level: 1 },
  { id: "3", polish: "dom", english: "house", level: 1 },
  { id: "4", polish: "woda", english: "water", level: 1 },
  { id: "5", polish: "jedzenie", english: "food", level: 1 },
  { id: "6", polish: "dzień", english: "day", level: 1 },
  { id: "7", polish: "noc", english: "night", level: 1 },
];

describe("Lesson", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    localStorage.clear();

    // Mock fetch API
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockVocabulary),
      }),
    ) as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows loading state initially", () => {
    renderWithRouter(<Lesson />);

    expect(screen.getByText(/przygotowuję lekcję/i)).toBeInTheDocument();
  });

  it("fetches vocabulary from API", async () => {
    renderWithRouter(<Lesson />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/vocabulary");
    });
  });

  it("displays progress bar after loading", async () => {
    renderWithRouter(<Lesson />);

    await waitFor(() => {
      expect(screen.getByText(/ćwiczenie \d+ z \d+/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/poprawne: 0/i)).toBeInTheDocument();
  });

  it("displays an exercise after loading", async () => {
    renderWithRouter(<Lesson />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/przygotowuję lekcję/i)).not.toBeInTheDocument();
    });

    // Should display either matching pairs or writing exercise
    const hasMatchingPairs = screen.queryByText(/połącz pary słów/i) !== null;
    const hasWriting = screen.queryByText(/przetłumacz na angielski/i) !== null;

    expect(hasMatchingPairs || hasWriting).toBe(true);
  });

  it("navigates to home on API error", async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error("API Error"))) as any;

    renderWithRouter(<Lesson />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("generates between 5 and 10 exercises", async () => {
    renderWithRouter(<Lesson />);

    await waitFor(() => {
      expect(screen.queryByText(/przygotowuję lekcję/i)).not.toBeInTheDocument();
    });

    // Check progress bar text for exercise count
    const progressText = screen.getByText(/ćwiczenie \d+ z (\d+)/i);
    const match = progressText.textContent?.match(/z (\d+)/);

    if (match) {
      const totalExercises = parseInt(match[1]);
      expect(totalExercises).toBeGreaterThanOrEqual(5);
      expect(totalExercises).toBeLessThanOrEqual(10);
    }
  });

  it("displays vocabulary words in exercises", async () => {
    renderWithRouter(<Lesson />);

    await waitFor(() => {
      expect(screen.queryByText(/przygotowuję lekcję/i)).not.toBeInTheDocument();
    });

    // At least one word from vocabulary should be visible
    const hasVocabularyWord = mockVocabulary.some(
      (pair) =>
        screen.queryByText(pair.polish) !== null || screen.queryByText(pair.english) !== null,
    );

    expect(hasVocabularyWord).toBe(true);
  });

  it("resets Writing component state between consecutive Writing exercises", async () => {
    const user = userEvent.setup();
    // Scenario: two consecutive Writing exercises
    // User answers first incorrectly → moves to second
    // Component state should be reset (thanks to key prop)

    const testExercises: Exercise[] = [
      {
        id: "writing-1",
        type: ExerciseType.WRITING,
        pair: { id: "1", polish: "kot", english: "cat", level: 1 },
      },
      {
        id: "writing-2",
        type: ExerciseType.WRITING,
        pair: { id: "2", polish: "pies", english: "dog", level: 1 },
      },
    ];

    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockVocabulary),
      }),
    ) as any;

    renderWithRouter(<Lesson exercises={testExercises} />);

    // Wait for first exercise to load
    await waitFor(() => {
      expect(screen.getByText("kot")).toBeInTheDocument();
    });

    // Enter wrong answer
    const input = screen.getByPlaceholderText(/wpisz tłumaczenie/i);
    const checkButton = screen.getByRole("button", { name: /sprawdź/i });

    await user.type(input, "wronganswer");
    await user.click(checkButton);

    // Wait for error screen
    await waitFor(() => {
      expect(screen.getByText(/nie do końca/i)).toBeInTheDocument();
    });

    // Click "Continue" to move to second exercise
    const continueButton = screen.getByRole("button", { name: /dalej/i });
    await user.click(continueButton);

    // KEY TEST: without key prop, Writing component is NOT reset
    // and still shows error screen instead of form with new word
    // With key prop: we'll see "pies" in the form
    // Without key prop: we'll see error screen with "dog" (but state showResult=true from first exercise)

    await waitFor(() => {
      // Should see Polish word "pies" in the form
      expect(screen.getByText("pies")).toBeInTheDocument();
    });

    // Input should be empty and not contain "wronganswer"
    const newInput = screen.getByPlaceholderText(/wpisz tłumaczenie/i) as HTMLInputElement;
    expect(newInput.value).toBe("");
    expect(newInput.value).not.toBe("wronganswer");
  });
});
