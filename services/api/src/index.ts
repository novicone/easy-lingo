import { VocabularyPair } from "@easy-lingo/shared";
import Fastify from "fastify";
import * as fs from "fs";
import Parse from "papaparse";
import * as path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = Fastify({ logger: true });

// Load vocabulary from CSV file
let vocabulary: VocabularyPair[] = [];
const vocabularyPath = path.join("data", "vocabulary.json");
try {
  const unit4VocabularyPath = path.join("data", "unit4_vocabulary.csv");
  const unit4VocabularyParseResult = Parse.parse<VocabularyPair>(
    fs.readFileSync(path.join(__dirname, unit4VocabularyPath), "utf-8"),
    { header: true, skipEmptyLines: true },
  );
  vocabulary = unit4VocabularyParseResult.data.map((entry, index) => ({
    id: (index + 1).toString(),
    polish: entry.polish,
    english: entry.english,
    level: 4,
  }));
  console.log(`Loaded ${vocabulary.length} vocabulary pairs`);
} catch (error) {
  console.error(
    `Failed to load vocabulary from ${vocabularyPath}. The server will start with an empty vocabulary, and the /api/vocabulary endpoint will return an empty list.`,
    error,
  );
}

server.get("/health", async () => ({ status: "ok" }));

server.get("/api/vocabulary", async (): Promise<VocabularyPair[]> => {
  return vocabulary;
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
