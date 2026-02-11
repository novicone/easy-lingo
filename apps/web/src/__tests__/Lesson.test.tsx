import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Lesson from "../pages/Lesson";
import { createWritingExercise, standardVocabulary } from "./testFixtures";
import {
  mockVocabularyAPI,
  mockVocabularyAPIError,
  renderWithRouter,
  setupUser,
} from "./testUtils";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Lesson", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    localStorage.clear();
    mockVocabularyAPI(standardVocabulary);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows loading state initially", async () => {
    renderWithRouter(<Lesson />);

    expect(screen.getByText(/przygotowuję lekcję/i)).toBeInTheDocument();

    // Wait for loading to finish to prevent act() warning
    await waitFor(() => {
      expect(screen.queryByText(/przygotowuję lekcję/i)).not.toBeInTheDocument();
    });
  });

  it("fetches vocabulary from API", async () => {
    renderWithRouter(<Lesson />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/vocabulary");
    });

    // Wait for loading to finish to prevent act() warning
    await waitFor(() => {
      expect(screen.queryByText(/przygotowuję lekcję/i)).not.toBeInTheDocument();
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

    // Should display either matching pairs, writing, or select translation exercise
    const hasMatchingPairs = screen.queryByText(/połącz pary słów/i) !== null;
    const hasWriting = screen.queryByText(/przetłumacz na angielski/i) !== null;
    const hasSelectTranslation = screen.queryByText(/przetłumacz na polski/i) !== null;

    expect(hasMatchingPairs || hasWriting || hasSelectTranslation).toBe(true);
  });

  it("generates 3 exercises of requested type when mode query param is set", async () => {
    render(
      <MemoryRouter initialEntries={["/lesson?mode=select"]}>
        <Lesson />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByText(/przygotowuję lekcję/i)).not.toBeInTheDocument();
    });

    // Progress bar should indicate 3 exercises
    expect(screen.getByText(/ćwiczenie \d+ z 3/i)).toBeInTheDocument();

    // First exercise should be select-translation style
    expect(screen.getByText(/przetłumacz na/i)).toBeInTheDocument();
  });

  it("navigates to home on API error", async () => {
    mockVocabularyAPIError();

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
    const hasVocabularyWord = standardVocabulary.some(
      (pair) =>
        screen.queryByText(pair.polish) !== null || screen.queryByText(pair.english) !== null,
    );

    expect(hasVocabularyWord).toBe(true);
  });

  it("resets Writing component state between consecutive Writing exercises", async () => {
    const user = setupUser();
    // Scenario: two consecutive Writing exercises with incorrect first answer
    const testExercises = [
      createWritingExercise("writing-1", standardVocabulary[0]),
      createWritingExercise("writing-2", standardVocabulary[1]),
    ];

    mockVocabularyAPI(standardVocabulary);
    renderWithRouter(<Lesson exercises={testExercises} />);

    // Wait for first exercise and answer incorrectly
    await waitFor(() => expect(screen.getByText("kot")).toBeInTheDocument());

    await user.type(screen.getByPlaceholderText(/wpisz tłumaczenie/i), "wronganswer");
    await user.click(screen.getByRole("button", { name: /sprawdź/i }));

    await waitFor(() => expect(screen.getByText(/nie do końca/i)).toBeInTheDocument());

    // Move to second exercise
    await user.click(screen.getByRole("button", { name: /dalej/i }));

    // KEY TEST: input should be empty (component was remounted with key prop)
    await waitFor(() => expect(screen.getByText("pies")).toBeInTheDocument());

    const newInput = screen.getByPlaceholderText(/wpisz tłumaczenie/i) as HTMLInputElement;
    expect(newInput.value).toBe("");
    expect(newInput.value).not.toBe("wronganswer");
  });
});
