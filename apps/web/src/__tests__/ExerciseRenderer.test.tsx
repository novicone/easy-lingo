import { screen, waitFor } from "@testing-library/react";
import ExerciseRenderer from "../components/ExerciseRenderer";
import {
  createMatchingPairsExercise,
  createWritingExercise,
  standardVocabulary,
} from "./testFixtures";
import { renderWithRouter, setupUser } from "./testUtils";

const mockMatchingPairsExercise = createMatchingPairsExercise(
  "ex-1",
  standardVocabulary.slice(0, 2),
);
const mockWritingExercise = createWritingExercise("ex-2", standardVocabulary[2]);

describe("ExerciseRenderer", () => {
  it("renders MatchingPairs exercise", () => {
    const onComplete = vi.fn();
    renderWithRouter(
      <ExerciseRenderer exercise={mockMatchingPairsExercise} onComplete={onComplete} />,
    );

    expect(screen.getByText("Połącz pary słów")).toBeInTheDocument();
    expect(screen.getByText("kot")).toBeInTheDocument();
    expect(screen.getByText("pies")).toBeInTheDocument();
  });

  it("renders Writing exercise", () => {
    const onComplete = vi.fn();
    renderWithRouter(<ExerciseRenderer exercise={mockWritingExercise} onComplete={onComplete} />);

    expect(screen.getByText("Przetłumacz na angielski")).toBeInTheDocument();
    expect(screen.getByText("dom")).toBeInTheDocument();
  });

  it("calls onComplete for MatchingPairs", async () => {
    const user = setupUser();
    const onComplete = vi.fn();
    renderWithRouter(
      <ExerciseRenderer exercise={mockMatchingPairsExercise} onComplete={onComplete} />,
    );

    // Click matching pairs in correct order
    await user.click(screen.getByText("kot"));
    await user.click(screen.getByText("cat"));
    await user.click(screen.getByText("pies"));
    await user.click(screen.getByText("dog"));

    // onComplete should be called automatically after all pairs matched (with 300ms delay)
    await waitFor(() => expect(onComplete).toHaveBeenCalledWith(true), { timeout: 1000 });
  });

  it("calls onComplete for Writing", async () => {
    const user = setupUser();
    const onComplete = vi.fn();
    renderWithRouter(<ExerciseRenderer exercise={mockWritingExercise} onComplete={onComplete} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "house");

    const button = screen.getByRole("button", { name: /sprawdź/i });
    await user.click(button);

    expect(onComplete).toHaveBeenCalledWith(true);
  });
});
