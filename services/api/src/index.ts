import { LessonSummary, VocabularyPair } from "@easy-lingo/shared";
import Fastify from "fastify";
import * as fs from "fs";
import * as path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = Fastify({ logger: true });

// Load vocabulary from JSON file
let vocabulary: VocabularyPair[] = [];
const vocabularyPath = path.join("data", "vocabulary.json");
try {
  const vocabularyData = fs.readFileSync(
    path.join(__dirname, vocabularyPath),
    "utf-8",
  );
  vocabulary = JSON.parse(vocabularyData);
  console.log(`Loaded ${vocabulary.length} vocabulary pairs`);
} catch (error) {
  console.error(
    `Failed to load vocabulary from ${vocabularyPath}. The server will start with an empty vocabulary, and the /api/vocabulary endpoint will return an empty list.`,
    error,
  );
}

server.get("/health", async () => ({ status: "ok" }));

server.get("/api/lessons", async (): Promise<LessonSummary[]> => {
  return [
    { id: "l1", title: "Basics", description: "Podstawowe słownictwo" },
    { id: "l2", title: "Phrases", description: "Przydatne zwroty" },
  ];
});

server.get("/api/vocabulary", async (): Promise<VocabularyPair[]> => {
  return vocabulary;
});

server.get("/api/lessons/:id", async (request) => {
  const { id } = request.params as { id: string };

  // For now, return basic lesson info
  return {
    id,
    title: id === "l1" ? "Basics" : "Phrases",
    description: id === "l1" ? "Podstawowe słownictwo" : "Przydatne zwroty",
    content: "Lesson content placeholder",
  };
});

const start = async () => {
  try {
    await server.listen({ port: 4000, host: "0.0.0.0" });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
