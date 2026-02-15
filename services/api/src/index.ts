import { VocabularyPair } from "@easy-lingo/shared";
import fastifyStatic from "@fastify/static";
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

// API Routes (must be registered before static files)
server.get("/health", async () => ({ status: "ok" }));

server.get("/api/vocabulary", async (): Promise<VocabularyPair[]> => {
  return vocabulary;
});

// Serve static files from the web app (in production)
const staticPath = path.join(__dirname, "..", "..", "..", "apps", "web", "dist");
if (fs.existsSync(staticPath)) {
  server.register(fastifyStatic, {
    root: staticPath,
    prefix: "/",
  });

  // SPA fallback - serve index.html for client-side routing
  server.setNotFoundHandler((request, reply) => {
    reply.sendFile("index.html");
  });

  console.log(`Serving static files from ${staticPath}`);
}

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || "4000", 10);
    await server.listen({ port, host: "0.0.0.0" });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
