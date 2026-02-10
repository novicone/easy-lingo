import type { VocabularyPair } from "@easy-lingo/shared";
import { render, type RenderResult } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import type React from "react";
import { BrowserRouter } from "react-router-dom";

/**
 * Renders a component wrapped in BrowserRouter for testing
 */
export function renderWithRouter(component: React.ReactElement): RenderResult {
  return render(<BrowserRouter>{component}</BrowserRouter>);
}

/**
 * Creates a configured userEvent instance for tests
 */
export function setupUser(): UserEvent {
  return userEvent.setup();
}

/**
 * Mocks the vocabulary API with test data
 */
export function mockVocabularyAPI(vocabulary: VocabularyPair[]) {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve(vocabulary),
    }),
  ) as any;
}

/**
 * Mocks the vocabulary API to return an error
 */
export function mockVocabularyAPIError() {
  global.fetch = vi.fn(() => Promise.reject(new Error("API Error"))) as any;
}
