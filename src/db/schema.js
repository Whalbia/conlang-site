import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  json,
} from "drizzle-orm/pg-core";

export const dictionary = pgTable("dictionary", {
  wordId: serial("word_id").primaryKey(),
  word: text("word").notNull(),
  definitions: json("definitions").notNull().default([]),
  wordType: integer("word_type").notNull(),
  alternateForms: json("alternate_forms").default([]),
  similarWords: json("similar_words").default([]),
  verbConjugationPattern: integer("verb_conjugation_pattern").notNull().default(1),
  hasIlAelContrast: boolean("has_il_ael_contrast").notNull().default(false),
  etymology: json("etymology").default([]),
  exampleSentences: json("example_sentences").default([]),
  etymologicallyRelatedWords: json("etymologically_related_words").default([]),
  usageNotes: json("usage_notes").default([]),
  verbTransitivity: integer("verb_transitivity").notNull().default(1),
});

export const roots = pgTable("roots", {
  rootId: serial("root_id").primaryKey(),
  root: text("root").notNull().unique(),
});

export const wordsRoots = pgTable("words_roots", {
  wordId: integer("word_id")
    .notNull()
    .references(() => dictionary.wordId, { onDelete: "cascade" }),
  rootId: integer("root_id")
    .notNull()
    .references(() => roots.rootId, { onDelete: "cascade" }),
});

export const affixes = pgTable("affixes", {
  affixId: serial("affix_id").primaryKey(),
  affix: text("affix").notNull().unique(),
});

export const wordsAffixes = pgTable("words_affixes", {
  wordId: integer("word_id")
    .notNull()
    .references(() => dictionary.wordId, { onDelete: "cascade" }),
  affixId: integer("affix_id")
    .notNull()
    .references(() => affixes.affixId, { onDelete: "cascade" }),
});
