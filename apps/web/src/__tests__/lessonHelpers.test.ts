import { ExerciseType } from "@easy-lingo/shared";
import {
  generateExercises,
  getForcedExerciseType,
  getRandomItems,
} from "../pages/utils/lessonHelpers";
import { standardVocabulary } from "./testFixtures";

describe("lessonHelpers", () => {
  describe("getForcedExerciseType", () => {
    it("maps 'matching' to MATCHING_PAIRS", () => {
      expect(getForcedExerciseType("matching")).toBe(ExerciseType.MATCHING_PAIRS);
    });

    it("maps 'writing' to WRITING", () => {
      expect(getForcedExerciseType("writing")).toBe(ExerciseType.WRITING);
    });

    it("maps 'select' to SELECT_TRANSLATION", () => {
      expect(getForcedExerciseType("select")).toBe(ExerciseType.SELECT_TRANSLATION);
    });

    it("returns null for unknown mode", () => {
      expect(getForcedExerciseType("unknown")).toBeNull();
      expect(getForcedExerciseType(null)).toBeNull();
    });
  });

  describe("getRandomItems", () => {
    beforeEach(() => {
      vi.spyOn(Math, "random").mockReturnValue(0.5);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("returns requested count of items", () => {
      const result = getRandomItems(standardVocabulary, 3);
      expect(result).toHaveLength(3);
    });

    it("returns all items when count exceeds array length", () => {
      const result = getRandomItems(standardVocabulary, 100);
      expect(result).toHaveLength(standardVocabulary.length);
    });

    it("handles empty array", () => {
      const result = getRandomItems([], 5);
      expect(result).toHaveLength(0);
    });

    it("returns subset from original array", () => {
      const result = getRandomItems(standardVocabulary, 3);
      result.forEach((item) => {
        expect(standardVocabulary).toContainEqual(item);
      });
    });
  });

  describe("generateExercises", () => {
    describe("with forcedType", () => {
      it("generates exactly 3 exercises when forcedType is provided", () => {
        const exercises = generateExercises(standardVocabulary, ExerciseType.WRITING);
        expect(exercises).toHaveLength(3);
      });

      it("generates only MATCHING_PAIRS when forced", () => {
        const exercises = generateExercises(standardVocabulary, ExerciseType.MATCHING_PAIRS);

        expect(exercises).toHaveLength(3);
        exercises.forEach((exercise) => {
          expect(exercise.type).toBe(ExerciseType.MATCHING_PAIRS);
        });
      });

      it("generates only WRITING when forced", () => {
        const exercises = generateExercises(standardVocabulary, ExerciseType.WRITING);

        expect(exercises).toHaveLength(3);
        exercises.forEach((exercise) => {
          expect(exercise.type).toBe(ExerciseType.WRITING);
        });
      });

      it("generates only SELECT_TRANSLATION when forced", () => {
        const exercises = generateExercises(standardVocabulary, ExerciseType.SELECT_TRANSLATION);

        expect(exercises).toHaveLength(3);
        exercises.forEach((exercise) => {
          expect(exercise.type).toBe(ExerciseType.SELECT_TRANSLATION);
        });
      });
    });

    describe("without forcedType (random)", () => {
      it("generates between 5 and 10 exercises", () => {
        const exercises = generateExercises(standardVocabulary, null);
        expect(exercises.length).toBeGreaterThanOrEqual(5);
        expect(exercises.length).toBeLessThanOrEqual(10);
      });

      it("generates valid exercise structures", () => {
        const exercises = generateExercises(standardVocabulary, null);

        exercises.forEach((exercise) => {
          expect(exercise.id).toBeDefined();
          expect(exercise.type).toBeDefined();

          if (exercise.type === ExerciseType.MATCHING_PAIRS) {
            expect(exercise).toHaveProperty("pairs");
            expect(Array.isArray(exercise.pairs)).toBe(true);
            expect(exercise.pairs.length).toBeGreaterThanOrEqual(4);
            expect(exercise.pairs.length).toBeLessThanOrEqual(6);
          } else if (exercise.type === ExerciseType.WRITING) {
            expect(exercise).toHaveProperty("pair");
            expect(exercise.pair).toBeDefined();
            expect(exercise.pair.id).toBeDefined();
            expect(exercise.pair.polish).toBeDefined();
            expect(exercise.pair.english).toBeDefined();
          } else if (exercise.type === ExerciseType.SELECT_TRANSLATION) {
            expect(exercise).toHaveProperty("correctPair");
            expect(exercise).toHaveProperty("allOptions");
            expect(exercise).toHaveProperty("direction");
            expect(exercise.correctPair).toBeDefined();
            expect(Array.isArray(exercise.allOptions)).toBe(true);
            expect(exercise.allOptions.length).toBeGreaterThanOrEqual(3);
            expect(exercise.allOptions.length).toBeLessThanOrEqual(5);
            expect(["pl-en", "en-pl"]).toContain(exercise.direction);
          }
        });
      });

      it("ensures all vocabulary pairs are defined", () => {
        const exercises = generateExercises(standardVocabulary, null);

        exercises.forEach((exercise) => {
          if (exercise.type === ExerciseType.MATCHING_PAIRS) {
            exercise.pairs.forEach((pair) => {
              expect(pair).toBeDefined();
              expect(pair.id).toBeDefined();
              expect(pair.polish).toBeDefined();
              expect(pair.english).toBeDefined();
            });
          } else if (exercise.type === ExerciseType.WRITING) {
            expect(exercise.pair).toBeDefined();
            expect(exercise.pair.id).toBeDefined();
          } else if (exercise.type === ExerciseType.SELECT_TRANSLATION) {
            expect(exercise.correctPair).toBeDefined();
            exercise.allOptions.forEach((option) => {
              expect(option).toBeDefined();
              expect(option.id).toBeDefined();
              expect(option.polish).toBeDefined();
              expect(option.english).toBeDefined();
            });
          }
        });
      });
    });

    describe("edge cases", () => {
      it("handles small vocabulary (fewer than needed pairs)", () => {
        const smallVocab = standardVocabulary.slice(0, 2);
        const exercises = generateExercises(smallVocab, ExerciseType.MATCHING_PAIRS);

        exercises.forEach((exercise) => {
          if (exercise.type === ExerciseType.MATCHING_PAIRS) {
            expect(exercise.pairs.length).toBeLessThanOrEqual(smallVocab.length);
          }
        });
      });

      it("generates unique exercise IDs", () => {
        const exercises = generateExercises(standardVocabulary, null);
        const ids = exercises.map((ex) => ex.id);
        const uniqueIds = new Set(ids);

        expect(uniqueIds.size).toBe(exercises.length);
      });

      it("includes correctPair in allOptions for SELECT_TRANSLATION", () => {
        const exercises = generateExercises(standardVocabulary, ExerciseType.SELECT_TRANSLATION);

        exercises.forEach((exercise) => {
          if (exercise.type === ExerciseType.SELECT_TRANSLATION) {
            const correctPairInOptions = exercise.allOptions.some(
              (option) => option.id === exercise.correctPair.id,
            );
            expect(correctPairInOptions).toBe(true);
          }
        });
      });
    });

    describe("deterministic behavior with mocked random", () => {
      it("produces consistent results with fixed seed", () => {
        let mockIndex = 0;
        const mockValues = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];

        vi.spyOn(Math, "random").mockImplementation(() => {
          const value = mockValues[mockIndex % mockValues.length];
          mockIndex++;
          return value;
        });

        const exercises1 = generateExercises(standardVocabulary, ExerciseType.WRITING);

        mockIndex = 0;
        const exercises2 = generateExercises(standardVocabulary, ExerciseType.WRITING);

        expect(exercises1).toEqual(exercises2);
      });
    });
  });
});
