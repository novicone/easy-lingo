import { fireEvent, render, screen } from "@testing-library/react";
import ExerciseSuccess from "../components/ExerciseSuccess";

describe("ExerciseSuccess", () => {
  it("renders success message", () => {
    const onContinue = vi.fn();
    render(<ExerciseSuccess onContinue={onContinue} />);

    // Should show some praise message (one of the random ones)
    const praises = [
      /wspaniale/i,
      /doskonale/i,
      /świetnie/i,
      /brawo/i,
      /fantastycznie/i,
      /znakomicie/i,
      /super/i,
      /perfekcyjnie/i,
    ];

    const hasPraise = praises.some((praise) => {
      try {
        screen.getByText(praise);
        return true;
      } catch {
        return false;
      }
    });

    expect(hasPraise).toBe(true);
  });

  it("displays celebration emoji", () => {
    const onContinue = vi.fn();
    render(<ExerciseSuccess onContinue={onContinue} />);

    expect(screen.getByText("🎉")).toBeInTheDocument();
  });

  it('displays "odpowiedź poprawna" message', () => {
    const onContinue = vi.fn();
    render(<ExerciseSuccess onContinue={onContinue} />);

    expect(screen.getByText(/odpowiedź poprawna/i)).toBeInTheDocument();
  });

  it("displays continue button", () => {
    const onContinue = vi.fn();
    render(<ExerciseSuccess onContinue={onContinue} />);

    expect(screen.getByRole("button", { name: /dalej/i })).toBeInTheDocument();
  });

  it("calls onContinue when button is clicked", () => {
    const onContinue = vi.fn();
    render(<ExerciseSuccess onContinue={onContinue} />);

    const button = screen.getByRole("button", { name: /dalej/i });
    fireEvent.click(button);

    expect(onContinue).toHaveBeenCalledTimes(1);
  });
});
