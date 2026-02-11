import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SelectTranslation from "../components/exercises/SelectTranslation";
import { createSelectTranslationExercise, standardVocabulary } from "./testFixtures";

describe("SelectTranslation", () => {
  it("should render question and options for pl-en direction", () => {
    const correctPair = standardVocabulary[0]; // kot -> cat
    const allOptions = [
      standardVocabulary[0], // kot -> cat
      standardVocabulary[1], // pies -> dog
      standardVocabulary[2], // dom -> house
    ];
    const exercise = createSelectTranslationExercise("ex-1", correctPair, allOptions, "pl-en");
    const onComplete = vi.fn();

    render(<SelectTranslation exercise={exercise} onComplete={onComplete} />);

    // Should show Polish word as question
    expect(screen.getByText("kot")).toBeInTheDocument();

    // Should show header for pl-en direction
    expect(screen.getByText("Przetłumacz na angielski")).toBeInTheDocument();

    // Should show English translations as options
    expect(screen.getByText("cat")).toBeInTheDocument();
    expect(screen.getByText("dog")).toBeInTheDocument();
    expect(screen.getByText("house")).toBeInTheDocument();
  });

  it("should render question and options for en-pl direction", () => {
    const correctPair = standardVocabulary[0]; // kot -> cat
    const allOptions = [
      standardVocabulary[0], // kot -> cat
      standardVocabulary[1], // pies -> dog
      standardVocabulary[2], // dom -> house
    ];
    const exercise = createSelectTranslationExercise("ex-1", correctPair, allOptions, "en-pl");
    const onComplete = vi.fn();

    render(<SelectTranslation exercise={exercise} onComplete={onComplete} />);

    // Should show English word as question
    expect(screen.getByText("cat")).toBeInTheDocument();

    // Should show header for en-pl direction
    expect(screen.getByText("Przetłumacz na polski")).toBeInTheDocument();

    // Should show Polish translations as options
    expect(screen.getByText("kot")).toBeInTheDocument();
    expect(screen.getByText("pies")).toBeInTheDocument();
    expect(screen.getByText("dom")).toBeInTheDocument();
  });

  it("should call onComplete(true) immediately when correct option is clicked", async () => {
    const user = userEvent.setup();
    const correctPair = standardVocabulary[0]; // kot -> cat
    const allOptions = [
      standardVocabulary[0], // kot -> cat
      standardVocabulary[1], // pies -> dog
      standardVocabulary[2], // dom -> house
    ];
    const exercise = createSelectTranslationExercise("ex-1", correctPair, allOptions, "pl-en");
    const onComplete = vi.fn();

    render(<SelectTranslation exercise={exercise} onComplete={onComplete} />);

    const correctButton = screen.getByRole("button", { name: "cat" });
    await user.click(correctButton);

    expect(onComplete).toHaveBeenCalledWith(true);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("should show error screen when incorrect option is clicked, then call onComplete(false) on continue", async () => {
    const user = userEvent.setup();
    const correctPair = standardVocabulary[0]; // kot -> cat
    const allOptions = [
      standardVocabulary[0], // kot -> cat
      standardVocabulary[1], // pies -> dog
      standardVocabulary[2], // dom -> house
    ];
    const exercise = createSelectTranslationExercise("ex-1", correctPair, allOptions, "pl-en");
    const onComplete = vi.fn();

    render(<SelectTranslation exercise={exercise} onComplete={onComplete} />);

    // Click incorrect option
    const incorrectButton = screen.getByRole("button", { name: "dog" });
    await user.click(incorrectButton);

    // Should not call onComplete immediately
    expect(onComplete).not.toHaveBeenCalled();

    // Should show error screen
    await waitFor(() => {
      expect(screen.getByText("Nie do końca...")).toBeInTheDocument();
    });

    expect(screen.getByText("Poprawna odpowiedź to:")).toBeInTheDocument();
    expect(screen.getByText("cat")).toBeInTheDocument();
    expect(screen.getByText(/Twoja odpowiedź:/)).toBeInTheDocument();
    expect(screen.getByText("dog")).toBeInTheDocument();

    // Click continue button
    const continueButton = screen.getByRole("button", { name: "Dalej" });
    await user.click(continueButton);

    expect(onComplete).toHaveBeenCalledWith(false);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("should display all options as clickable buttons", () => {
    const correctPair = standardVocabulary[0]; // kot -> cat
    const allOptions = [
      standardVocabulary[0], // kot -> cat
      standardVocabulary[1], // pies -> dog
      standardVocabulary[2], // dom -> house
      standardVocabulary[3], // woda -> water
      standardVocabulary[4], // jedzenie -> food
    ];
    const exercise = createSelectTranslationExercise("ex-1", correctPair, allOptions, "pl-en");
    const onComplete = vi.fn();

    render(<SelectTranslation exercise={exercise} onComplete={onComplete} />);

    // Should have all option buttons
    expect(screen.getByRole("button", { name: "cat" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "dog" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "house" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "water" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "food" })).toBeInTheDocument();
  });
});
