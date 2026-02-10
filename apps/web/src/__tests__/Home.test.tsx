import { screen } from "@testing-library/react";
import Home from "../pages/Home";
import { renderWithRouter } from "./testUtils";

describe("Home", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders app title", () => {
    renderWithRouter(<Home />);
    expect(screen.getByText(/easy-lingo/i)).toBeInTheDocument();
  });

  it("displays start lesson button", () => {
    renderWithRouter(<Home />);
    expect(screen.getByRole("button", { name: /rozpocznij lekcję/i })).toBeInTheDocument();
  });

  it("displays completed lessons counter starting at 0", () => {
    renderWithRouter(<Home />);
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText(/ukończone lekcje/i)).toBeInTheDocument();
  });

  it("reads completed lessons count from localStorage", () => {
    localStorage.setItem("completedLessons", "5");
    renderWithRouter(<Home />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("displays appropriate emoji for different progress levels", () => {
    // 0 lessons: 🎯
    const { unmount } = renderWithRouter(<Home />);
    expect(screen.getByText("🎯")).toBeInTheDocument();
    unmount();

    // 5 lessons: 🌿
    localStorage.setItem("completedLessons", "5");
    renderWithRouter(<Home />);
    expect(screen.getByText("🌿")).toBeInTheDocument();
    unmount();

    // 10+ lessons: 🌳
    localStorage.setItem("completedLessons", "10");
    renderWithRouter(<Home />);
    expect(screen.getByText("🌳")).toBeInTheDocument();
  });

  it("displays information about how the app works", () => {
    renderWithRouter(<Home />);
    expect(screen.getByText(/jak to działa/i)).toBeInTheDocument();
    expect(screen.getByText(/każda lekcja zawiera/i)).toBeInTheDocument();
  });
});
