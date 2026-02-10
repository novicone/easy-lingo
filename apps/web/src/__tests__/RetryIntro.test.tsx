import { render, screen } from "@testing-library/react";
import RetryIntro from "../components/RetryIntro";
import { setupUser } from "./testUtils";

describe("RetryIntro", () => {
  it("renders with correct message for single incorrect exercise", () => {
    const mockOnContinue = vi.fn();

    render(<RetryIntro incorrectCount={1} onContinue={mockOnContinue} />);

    expect(screen.getByText("Czas na poprawki!")).toBeInTheDocument();
    expect(screen.getByText(/Masz 1 ćwiczenie do poprawienia/i)).toBeInTheDocument();
    expect(screen.getByText(/Powtórzmy je, aby mieć pewność/i)).toBeInTheDocument();
  });

  it("renders with correct message for multiple incorrect exercises", () => {
    const mockOnContinue = vi.fn();

    render(<RetryIntro incorrectCount={3} onContinue={mockOnContinue} />);

    expect(screen.getByText("Czas na poprawki!")).toBeInTheDocument();
    expect(screen.getByText(/Masz 3 ćwiczenia do poprawienia/i)).toBeInTheDocument();
  });

  it("calls onContinue when button is clicked", async () => {
    const user = setupUser();
    const mockOnContinue = vi.fn();

    render(<RetryIntro incorrectCount={2} onContinue={mockOnContinue} />);

    const button = screen.getByRole("button", { name: /dalej/i });
    await user.click(button);

    expect(mockOnContinue).toHaveBeenCalledTimes(1);
  });

  it("displays warning icon", () => {
    const mockOnContinue = vi.fn();

    render(<RetryIntro incorrectCount={1} onContinue={mockOnContinue} />);

    // Check for SVG icon (warning triangle)
    const icon = screen
      .getByRole("button", { name: /dalej/i })
      .closest("div")
      ?.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });
});
