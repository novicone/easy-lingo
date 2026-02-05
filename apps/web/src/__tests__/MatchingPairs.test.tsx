import { ExerciseType, type MatchingPairsExercise } from "@easy-lingo/shared";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MatchingPairs from "../components/exercises/MatchingPairs";

const mockExercise: MatchingPairsExercise = {
  id: "test-exercise",
  type: ExerciseType.MATCHING_PAIRS,
  pairs: [
    { id: "1", polish: "kot", english: "cat", level: 1 },
    { id: "2", polish: "pies", english: "dog", level: 1 },
    { id: "3", polish: "dom", english: "house", level: 1 },
  ],
};

describe("MatchingPairs", () => {
  it("renders exercise title", () => {
    const onComplete = vi.fn();
    render(<MatchingPairs exercise={mockExercise} onComplete={onComplete} />);

    expect(screen.getByText(/połącz pary słów/i)).toBeInTheDocument();
  });

  it("displays all polish words", () => {
    const onComplete = vi.fn();
    render(<MatchingPairs exercise={mockExercise} onComplete={onComplete} />);

    expect(screen.getByText("kot")).toBeInTheDocument();
    expect(screen.getByText("pies")).toBeInTheDocument();
    expect(screen.getByText("dom")).toBeInTheDocument();
  });

  it("displays all english words", () => {
    const onComplete = vi.fn();
    render(<MatchingPairs exercise={mockExercise} onComplete={onComplete} />);

    expect(screen.getByText("cat")).toBeInTheDocument();
    expect(screen.getByText("dog")).toBeInTheDocument();
    expect(screen.getByText("house")).toBeInTheDocument();
  });

  it("displays progress counter", () => {
    const onComplete = vi.fn();
    render(<MatchingPairs exercise={mockExercise} onComplete={onComplete} />);

    expect(screen.getByText(/dopasowano: 0 \/ 3/i)).toBeInTheDocument();
  });

  it("allows selecting a polish word", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<MatchingPairs exercise={mockExercise} onComplete={onComplete} />);

    const kotTile = screen.getByText("kot").parentElement;
    await user.click(kotTile!);

    // Should highlight selected tile (checking class change)
    expect(kotTile).toHaveClass("bg-blue-100");
  });

  it("matches correct pairs and greys them out", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<MatchingPairs exercise={mockExercise} onComplete={onComplete} />);

    // Click polish word
    const kotTile = screen.getByText("kot").parentElement;
    await user.click(kotTile!);

    // Click matching english word
    const catTile = screen.getByText("cat").parentElement;
    await user.click(catTile!);

    // Wait for match to be processed
    await waitFor(() => {
      expect(kotTile).toHaveClass("bg-gray-200");
      expect(catTile).toHaveClass("bg-gray-200");
    });

    // Counter should update
    expect(screen.getByText(/dopasowano: 1 \/ 3/i)).toBeInTheDocument();
  });

  it("highlights incorrect pairs in red and then deselects them", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<MatchingPairs exercise={mockExercise} onComplete={onComplete} />);

    // Click polish word
    const kotTile = screen.getByText("kot").parentElement;
    await user.click(kotTile!);

    // Click wrong english word
    const dogTile = screen.getByText("dog").parentElement;
    await user.click(dogTile!);

    // Should briefly show red
    await waitFor(() => {
      expect(kotTile).toHaveClass("bg-red-100");
      expect(dogTile).toHaveClass("bg-red-100");
    });

    // After timeout, should deselect
    await waitFor(
      () => {
        expect(kotTile).not.toHaveClass("bg-red-100");
        expect(kotTile).not.toHaveClass("bg-blue-100");
      },
      { timeout: 1000 },
    );
  });

  it("calls onComplete when all pairs are matched", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<MatchingPairs exercise={mockExercise} onComplete={onComplete} />);

    // Match all pairs
    const pairs = [
      { polish: "kot", english: "cat" },
      { polish: "pies", english: "dog" },
      { polish: "dom", english: "house" },
    ];

    for (const pair of pairs) {
      const polishTile = screen.getByText(pair.polish).parentElement;
      const englishTile = screen.getByText(pair.english).parentElement;

      await user.click(polishTile!);
      await user.click(englishTile!);

      await waitFor(() => {
        expect(
          screen.getByText(new RegExp(`dopasowano: ${pairs.indexOf(pair) + 1}`, "i")),
        ).toBeInTheDocument();
      });
    }

    // Should call onComplete with true after last match
    await waitFor(
      () => {
        expect(onComplete).toHaveBeenCalledWith(true);
      },
      { timeout: 1000 },
    );
  });

  it("does not allow clicking already matched tiles", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<MatchingPairs exercise={mockExercise} onComplete={onComplete} />);

    // Match first pair
    const kotTile = screen.getByText("kot").parentElement;
    const catTile = screen.getByText("cat").parentElement;

    await user.click(kotTile!);
    await user.click(catTile!);

    await waitFor(() => {
      expect(kotTile).toHaveClass("bg-gray-200");
    });

    // Try clicking again
    await user.click(kotTile!);

    // Should stay grey (not change to blue)
    expect(kotTile).toHaveClass("bg-gray-200");
    expect(kotTile).not.toHaveClass("bg-blue-100");
  });
});
