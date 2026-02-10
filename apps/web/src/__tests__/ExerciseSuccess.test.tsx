import { render, screen } from "@testing-library/react";
import ExerciseSuccess from "../components/ExerciseSuccess";
import { setupUser } from "./testUtils";

describe("ExerciseSuccess", () => {
  it("renders success message with praise and emoji", () => {
    const onContinue = vi.fn();
    render(<ExerciseSuccess onContinue={onContinue} />);

    // Should show celebration emoji
    expect(screen.getByText("🎉")).toBeInTheDocument();

    // Should show "odpowiedź poprawna" message
    expect(screen.getByText(/odpowiedź poprawna/i)).toBeInTheDocument();

    // Should show one of the random praise messages
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

  it("displays continue button", () => {
    const onContinue = vi.fn();
    render(<ExerciseSuccess onContinue={onContinue} />);

    expect(screen.getByRole("button", { name: /dalej/i })).toBeInTheDocument();
  });

  it("calls onContinue when button is clicked", async () => {
    const user = setupUser();
    const onContinue = vi.fn();
    render(<ExerciseSuccess onContinue={onContinue} />);

    const button = screen.getByRole("button", { name: /dalej/i });
    await user.click(button);

    expect(onContinue).toHaveBeenCalledTimes(1);
  });
});
