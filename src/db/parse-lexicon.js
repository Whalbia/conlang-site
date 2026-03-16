/**
 * Parses the conlang lexicon markdown file into structured JSON
 * matching the database schema.
 *
 * Run: node src/db/parse-lexicon.js
 * Output: src/db/seed-data.json
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..", "..");

const md = readFileSync(
  join(projectRoot, "reference", "2023 conlang lexicon and roots.md"),
  "utf-8"
);

// Word type mapping
const WORD_TYPES = {
  VERBS: 2,
  PRONOUNS: 5,
  NOUNS: 1,
  STATIVES: 4,
  "DISCOURSE PARTICLES": 6,
  ADJECTIVES: 3,
  EXPRESSIONS: 7,
  "OTHER (SINGULAR ITEMS)": 8,
};

// Verb conjugation pattern detection from definition text
function detectConjugationPattern(def) {
  // Look for explicit pattern markers in parentheses
  const match = def.match(/\((yt|uk)\)/);
  if (match) {
    const patterns = { yt: 2, uk: 3 };
    return patterns[match[1]] || 1;
  }
  return 1; // default: not a verb or unspecified
}

// Verb transitivity detection
function detectTransitivity(def) {
  const lower = def.toLowerCase();
  if (lower.includes("ambitransitive")) return 4;
  if (lower.includes("(transitive)") || lower.includes("transitive")) {
    if (lower.includes("(intransitive)") || lower.includes("intransitive"))
      return 4; // both mentioned = ambitransitive
    return 3;
  }
  if (lower.includes("(intransitive)") || lower.includes("intransitive"))
    return 2;
  if (lower.includes("ditransitive")) return 3;
  return 1; // not a verb or unspecified
}

// Detect il/ael contrast
function hasIlAelContrast(def) {
  return /has ael\/il contrast|ael\/il contrast|Note: has ael\/il contrast/i.test(
    def
  );
}

// Split the markdown into sections
function splitSections(text) {
  const sections = {};
  const sectionHeaders = [
    "ROOTS",
    "DERIVATIONAL AFFIXES",
    "VERBS",
    "PRONOUNS",
    "NOUNS",
    "STATIVES",
    "DISCOURSE PARTICLES",
    "ADJECTIVES",
    "ADVERBS",
    "EXPRESSIONS",
    "OTHER (SINGULAR ITEMS)",
    "OTHER (GROUPED ITEMS)",
    "TOTAL WORDS",
  ];

  for (let i = 0; i < sectionHeaders.length; i++) {
    const header = sectionHeaders[i];
    const nextHeader = sectionHeaders[i + 1];

    // Find the header line
    const headerRegex = new RegExp(`^${header.replace(/[()]/g, "\\$&")}\\s*$`, "m");
    const match = text.match(headerRegex);
    if (!match) continue;

    const start = match.index + match[0].length;
    let end = text.length;

    if (nextHeader) {
      const nextRegex = new RegExp(
        `^${nextHeader.replace(/[()]/g, "\\$&")}\\s*$`,
        "m"
      );
      const nextMatch = text.match(nextRegex);
      if (nextMatch) end = nextMatch.index;
    }

    sections[header] = text.slice(start, end).trim();
  }

  return sections;
}

// Parse roots section
function parseRoots(text) {
  const roots = [];
  const lines = text.split("\n");

  for (const line of lines) {
    // Match: * **root** : definition
    const match = line.match(
      /^\*\s+\*\*([^*]+)\*\*\s*:\s*(.+)/
    );
    if (match) {
      roots.push({
        root: match[1].trim(),
        definition: match[2].trim(),
      });
    }
  }

  return roots;
}

// Parse numbered word entries
function parseWordEntries(text, wordType) {
  const entries = [];
  // Combine multi-line entries - lines that start with spaces/tabs and don't have a number
  const lines = text.split("\n");
  const combinedLines = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check if this is a new numbered entry
    if (/^\d+\.\s+\*\*/.test(trimmed)) {
      combinedLines.push(trimmed);
    } else if (combinedLines.length > 0) {
      // Continuation of previous entry
      combinedLines[combinedLines.length - 1] += " " + trimmed;
    }
  }

  for (const line of combinedLines) {
    // Match: NUMBER. **word** : definition
    const match = line.match(/^\d+\.\s+\*\*([^*]+)\*\*\s*:\s*(.+)/);
    if (match) {
      const word = match[1].trim();
      const definition = match[2]
        .trim()
        // Clean up markdown artifacts
        .replace(/\\\*/g, "*")
        .replace(/\\\-/g, "-")
        .replace(/\\_/g, "_");

      const entry = {
        word,
        definitions: [definition],
        wordType,
        alternateForms: [],
        similarWords: [],
        verbConjugationPattern: wordType === 2 ? detectConjugationPattern(definition) : 1,
        hasIlAelContrast: hasIlAelContrast(definition),
        etymology: [],
        exampleSentences: [],
        etymologicallyRelatedWords: [],
        usageNotes: [],
        verbTransitivity: wordType === 2 ? detectTransitivity(definition) : 1,
      };

      // For verbs, also detect -vu, -la patterns from the word itself
      if (wordType === 2 && entry.verbConjugationPattern === 1) {
        if (word.endsWith("vu")) entry.verbConjugationPattern = 4;
        else if (word.endsWith("la") || word.endsWith("lla"))
          entry.verbConjugationPattern = 5;
        else if (word.endsWith("aen") || word.endsWith("en"))
          entry.verbConjugationPattern = 2; // default aen to yt unless marked
        else if (word.endsWith("alle") || word.endsWith("arrie") || word.endsWith("arr") || word.endsWith("arr"))
          entry.verbConjugationPattern = 6;
      }

      // Extract "pairs with" as etymologically related
      const pairsMatch = definition.match(/[Pp]airs with \*\*(\w+)\*\*/g);
      if (pairsMatch) {
        for (const p of pairsMatch) {
          const wordMatch = p.match(/\*\*(\w+)\*\*/);
          if (wordMatch) entry.etymologicallyRelatedWords.push(wordMatch[1]);
        }
      }

      // Extract "compare to/with" as similar words
      const compareMatch = definition.match(
        /[Cc]ompare (?:to|with) \*\*(\w+)\*\*/g
      );
      if (compareMatch) {
        for (const c of compareMatch) {
          const wordMatch = c.match(/\*\*(\w+)\*\*/);
          if (wordMatch) entry.similarWords.push(wordMatch[1]);
        }
      }

      // Extract "also see" as similar words
      const alsoSeeMatch = definition.match(
        /[Aa]lso see \*\*(\w+)\*\*/g
      );
      if (alsoSeeMatch) {
        for (const a of alsoSeeMatch) {
          const wordMatch = a.match(/\*\*(\w+)\*\*/);
          if (wordMatch) entry.similarWords.push(wordMatch[1]);
        }
      }

      // Extract "from stative/from verb" as etymology
      const fromMatch = definition.match(
        /[Ff]rom (?:stative |verb )?\*\*(\w+)\*\*/
      );
      if (fromMatch) {
        entry.etymology.push(`from ${fromMatch[1]}`);
      }

      entries.push(entry);
    }
  }

  return entries;
}

// Parse expressions (format: NUMBER. **word** : definition)
function parseExpressions(text) {
  return parseWordEntries(text, 7);
}

// Main
const sections = splitSections(md);

// Parse roots
const roots = parseRoots(sections["ROOTS"] || "");
// Also parse derivational affixes as roots
const affixes = parseRoots(sections["DERIVATIONAL AFFIXES"] || "");

// Parse all word categories
const allWords = [];

for (const [sectionName, wordType] of Object.entries(WORD_TYPES)) {
  if (sections[sectionName]) {
    const entries = parseWordEntries(sections[sectionName], wordType);
    allWords.push(...entries);
  }
}

// Also parse adverbs as nouns (the doc says "*really nouns")
if (sections["ADVERBS"]) {
  const adverbs = parseWordEntries(sections["ADVERBS"], 1);
  for (const a of adverbs) {
    a.usageNotes.push("Adverb (technically a noun)");
  }
  allWords.push(...adverbs);
}

// Build root-to-word associations by checking if any root appears in word text
const rootNames = [...roots, ...affixes].map((r) => r.root);
const wordsRoots = [];

for (let wi = 0; wi < allWords.length; wi++) {
  const word = allWords[wi];
  for (let ri = 0; ri < rootNames.length; ri++) {
    const rootName = rootNames[ri];
    // Only associate if root is a meaningful substring (3+ chars) and appears in word
    if (rootName.length >= 3 && word.word.includes(rootName)) {
      wordsRoots.push({ wordIndex: wi, rootIndex: ri });
    }
  }
}

const seedData = {
  roots: [...roots, ...affixes].map((r) => ({
    root: r.root,
  })),
  words: allWords,
  wordsRoots,
  _meta: {
    totalRoots: roots.length + affixes.length,
    totalWords: allWords.length,
    totalAssociations: wordsRoots.length,
    generatedAt: new Date().toISOString(),
    wordTypeCounts: {
      verbs: allWords.filter((w) => w.wordType === 2).length,
      nouns: allWords.filter((w) => w.wordType === 1).length,
      adjectives: allWords.filter((w) => w.wordType === 3).length,
      statives: allWords.filter((w) => w.wordType === 4).length,
      pronouns: allWords.filter((w) => w.wordType === 5).length,
      discourseParticles: allWords.filter((w) => w.wordType === 6).length,
      phrases: allWords.filter((w) => w.wordType === 7).length,
      misc: allWords.filter((w) => w.wordType === 8).length,
    },
  },
};

const outPath = join(__dirname, "seed-data.json");
writeFileSync(outPath, JSON.stringify(seedData, null, 2));

console.log("Seed data written to src/db/seed-data.json");
console.log(`Roots: ${seedData._meta.totalRoots}`);
console.log(`Words: ${seedData._meta.totalWords}`);
console.log(`Word-Root Associations: ${seedData._meta.totalAssociations}`);
console.log("Word type breakdown:", seedData._meta.wordTypeCounts);
