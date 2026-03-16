/**
 * Seeds the Neon database with parsed lexicon data.
 *
 * Run: node src/db/seed.js
 *
 * Prerequisites:
 * - DATABASE_URL set in .env.local
 * - Tables created via `npx drizzle-kit push`
 * - seed-data.json generated via `node src/db/rebuild-seed.js`
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import { dictionary, roots, wordsRoots, affixes, wordsAffixes } from "./schema.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

const seedData = JSON.parse(
  readFileSync(join(__dirname, "seed-data.json"), "utf-8")
);

async function seed() {
  console.log("Starting seed...");
  console.log(`Words to insert: ${seedData.words.length}`);
  console.log(`Roots to insert: ${seedData.roots.length}`);
  console.log(`Affixes to insert: ${seedData.affixes.length}`);
  console.log(`Word-root associations to insert: ${seedData.wordsRoots.length}`);
  console.log(`Word-affix associations to insert: ${seedData.wordsAffixes.length}`);

  // 1. Insert roots
  console.log("\n--- Inserting roots ---");
  const insertedRoots = [];
  for (let i = 0; i < seedData.roots.length; i += 50) {
    const batch = seedData.roots.slice(i, i + 50);
    const result = await db.insert(roots).values(batch).returning();
    insertedRoots.push(...result);
    console.log(`  Inserted roots ${i + 1}-${i + batch.length}`);
  }
  console.log(`Total roots inserted: ${insertedRoots.length}`);

  // 2. Insert affixes
  console.log("\n--- Inserting affixes ---");
  const insertedAffixes = [];
  for (let i = 0; i < seedData.affixes.length; i += 50) {
    const batch = seedData.affixes.slice(i, i + 50);
    const result = await db.insert(affixes).values(batch).returning();
    insertedAffixes.push(...result);
    console.log(`  Inserted affixes ${i + 1}-${i + batch.length}`);
  }
  console.log(`Total affixes inserted: ${insertedAffixes.length}`);

  // 3. Insert words
  console.log("\n--- Inserting words ---");
  const insertedWords = [];
  for (let i = 0; i < seedData.words.length; i += 50) {
    const batch = seedData.words.slice(i, i + 50).map((w) => ({
      word: w.word,
      definitions: w.definitions,
      wordType: w.wordType,
      alternateForms: w.alternateForms,
      similarWords: w.similarWords,
      verbConjugationPattern: w.verbConjugationPattern,
      hasIlAelContrast: w.hasIlAelContrast,
      etymology: w.etymology,
      exampleSentences: w.exampleSentences,
      etymologicallyRelatedWords: w.etymologicallyRelatedWords,
      usageNotes: w.usageNotes,
      verbTransitivity: w.verbTransitivity,
    }));
    const result = await db.insert(dictionary).values(batch).returning();
    insertedWords.push(...result);
    console.log(`  Inserted words ${i + 1}-${i + batch.length}`);
  }
  console.log(`Total words inserted: ${insertedWords.length}`);

  // 4. Insert word-root associations
  console.log("\n--- Inserting word-root associations ---");
  const rootAssociations = seedData.wordsRoots.map((wr) => ({
    wordId: insertedWords[wr.wordIndex].wordId,
    rootId: insertedRoots[wr.rootIndex].rootId,
  }));

  for (let i = 0; i < rootAssociations.length; i += 50) {
    const batch = rootAssociations.slice(i, i + 50);
    await db.insert(wordsRoots).values(batch);
    console.log(`  Inserted root associations ${i + 1}-${i + batch.length}`);
  }
  console.log(`Total root associations inserted: ${rootAssociations.length}`);

  // 5. Insert word-affix associations
  console.log("\n--- Inserting word-affix associations ---");
  const affixAssociations = seedData.wordsAffixes.map((wa) => ({
    wordId: insertedWords[wa.wordIndex].wordId,
    affixId: insertedAffixes[wa.affixIndex].affixId,
  }));

  for (let i = 0; i < affixAssociations.length; i += 50) {
    const batch = affixAssociations.slice(i, i + 50);
    await db.insert(wordsAffixes).values(batch);
    console.log(`  Inserted affix associations ${i + 1}-${i + batch.length}`);
  }
  console.log(`Total affix associations inserted: ${affixAssociations.length}`);

  console.log("\n--- Seed complete! ---");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
