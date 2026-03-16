import { z } from "zod";

const exampleSentence = z.object({
  english: z.string(),
  conlang: z.string(),
  definitionNumber: z.number().int().min(1),
});

export const createWordSchema = z.object({
  word: z.string().min(1, "Word is required"),
  definitions: z.array(z.string().min(1)).min(1, "At least one definition is required"),
  wordType: z.number().int().min(1).max(8),
  alternateForms: z.array(z.string()).default([]),
  similarWords: z.array(z.string()).default([]),
  verbConjugationPattern: z.number().int().min(1).max(6).default(1),
  hasIlAelContrast: z.boolean().default(false),
  etymology: z.array(z.string()).default([]),
  exampleSentences: z.array(exampleSentence).default([]),
  etymologicallyRelatedWords: z.array(z.string()).default([]),
  usageNotes: z.array(z.string()).default([]),
  verbTransitivity: z.number().int().min(1).max(4).default(1),
  rootsAffixes: z.array(z.string()).default([]),
  affixes: z.array(z.string()).default([]),
});

export const updateWordSchema = createWordSchema.partial().extend({
  rootsAffixes: z.array(z.string()).optional(),
  affixes: z.array(z.string()).optional(),
});

export const searchSchema = z.object({
  search: z.string().min(1),
  searchIn: z
    .array(z.enum(["words", "definitions", "rootsAffixes", "etymologically"]))
    .default(["words"]),
  filters: z
    .array(
      z.enum([
        "ilAel",
        "noun",
        "verb",
        "adjective",
        "stative",
        "pronoun",
        "disc_part",
        "phrase",
        "misc",
        "yt",
        "uk",
        "vu",
        "la",
        "misc_v",
      ])
    )
    .default([]),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});
