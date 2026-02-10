import { render, screen } from "@testing-library/react";
import ProgressBar from "../components/ProgressBar";

describe("ProgressBar", () => {
  it("renders progress for normal mode", () => {
    render(<ProgressBar current={3} total={10} correctCount={2} />);

    expect(screen.getByText("Ćwiczenie 3 z 10")).toBeInTheDocument();
    expect(screen.getByText("Poprawne: 2")).toBeInTheDocument();
    expect(screen.queryByText("Tryb poprawek")).not.toBeInTheDocument();
  });

  it("renders progress for retry mode", () => {
    render(<ProgressBar current={2} total={5} isRetry={true} />);

    expect(screen.getByText("Poprawka 2 z 5")).toBeInTheDocument();
    expect(screen.getByText("Tryb poprawek")).toBeInTheDocument();
    expect(screen.queryByText(/Poprawne:/)).not.toBeInTheDocument();
  });

  it("calculates correct progress width", () => {
    const { container } = render(<ProgressBar current={3} total={10} correctCount={2} />);

    const progressBar = container.querySelector(".bg-blue-500");
    expect(progressBar).toHaveStyle({ width: "30%" });
  });

  it("uses yellow color for retry mode", () => {
    const { container } = render(<ProgressBar current={2} total={5} isRetry={true} />);

    const progressBar = container.querySelector(".bg-yellow-500");
    expect(progressBar).toBeInTheDocument();
  });

  it("uses blue color for normal mode", () => {
    const { container } = render(<ProgressBar current={1} total={5} correctCount={0} />);

    const progressBar = container.querySelector(".bg-blue-500");
    expect(progressBar).toBeInTheDocument();
  });

  it("handles 100% progress", () => {
    const { container } = render(<ProgressBar current={10} total={10} correctCount={10} />);

    const progressBar = container.querySelector(".bg-blue-500");
    expect(progressBar).toHaveStyle({ width: "100%" });
  });

  it("handles first exercise", () => {
    render(<ProgressBar current={1} total={5} correctCount={0} />);

    expect(screen.getByText("Ćwiczenie 1 z 5")).toBeInTheDocument();
  });
});
