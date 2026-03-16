import { NextResponse } from "next/server";
import { db } from "@/db";
import { dictionary, roots, wordsRoots, affixes, wordsAffixes } from "@/db/schema";
import { createWordSchema, searchSchema } from "@/db/validators";
import { eq, like, sql, or, and, inArray } from "drizzle-orm";

// helper: sync roots/affixes for a word
async function syncRoots(wordId, rootsAffixes) {
  if (!rootsAffixes || rootsAffixes.length === 0) return;

  // find which roots already exist
  const existingRoots = await db
    .select()
    .from(roots)
    .where(inArray(roots.root, rootsAffixes));

  const existingRootMap = new Map(existingRoots.map((r) => [r.root, r.rootId]));
  const newRootNames = rootsAffixes.filter((r) => !existingRootMap.has(r));

  // insert new roots
  if (newRootNames.length > 0) {
    const inserted = await db
      .insert(roots)
      .values(newRootNames.map((root) => ({ root })))
      .returning();
    for (const r of inserted) {
      existingRootMap.set(r.root, r.rootId);
    }
  }

  // clear old word-root links and insert fresh ones
  await db.delete(wordsRoots).where(eq(wordsRoots.wordId, wordId));

  const rootIds = rootsAffixes.map((r) => existingRootMap.get(r)).filter(Boolean);
  if (rootIds.length > 0) {
    await db
      .insert(wordsRoots)
      .values(rootIds.map((rootId) => ({ wordId, rootId })));
  }
}

// GET /api/words — search and list words
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const parsed = searchSchema.safeParse({
      search: searchParams.get("search") || "all_results",
      searchIn: searchParams.getAll("searchIn"),
      filters: searchParams.getAll("filter"),
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 20,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { search, searchIn, filters, page, limit } = parsed.data;
    const offset = (page - 1) * limit;

    const wordTypes = {
      noun: 1, verb: 2, adjective: 3, stative: 4,
      pronoun: 5, disc_part: 6, phrase: 7, misc: 8,
    };
    const conjugationPatterns = {
      yt: 2, uk: 3, vu: 4, la: 5, misc_v: 6,
    };

    // build WHERE conditions
    const searchConditions = [];
    const filterConditions = [];

    if (search !== "all_results") {
      if (searchIn.includes("words")) {
        searchConditions.push(like(dictionary.word, `%${search}%`));
      }
      if (searchIn.includes("definitions")) {
        searchConditions.push(
          sql`${dictionary.definitions}::text ILIKE ${"%" + search + "%"}`
        );
      }
      if (searchIn.includes("rootsAffixes")) {
        searchConditions.push(like(roots.root, `%${search}%`));
      }
      if (searchIn.includes("etymologically")) {
        searchConditions.push(
          sql`${dictionary.etymologicallyRelatedWords}::text ILIKE ${"%" + search + "%"}`
        );
      }
    }

    // filter conditions
    if (filters.includes("ilAel")) {
      filterConditions.push(eq(dictionary.hasIlAelContrast, true));
    }
    for (const [key, val] of Object.entries(wordTypes)) {
      if (filters.includes(key)) {
        filterConditions.push(eq(dictionary.wordType, val));
      }
    }
    for (const [key, val] of Object.entries(conjugationPatterns)) {
      if (filters.includes(key)) {
        filterConditions.push(eq(dictionary.verbConjugationPattern, val));
      }
    }

    // combine: search conditions are OR'd, filter conditions are OR'd, then AND together
    const conditions = [];
    if (searchConditions.length > 0) {
      conditions.push(or(...searchConditions));
    }
    if (filterConditions.length > 0) {
      conditions.push(or(...filterConditions));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    // query with LEFT JOIN so words without roots still appear
    const results = await db
      .select({
        wordId: dictionary.wordId,
        word: dictionary.word,
        definitions: dictionary.definitions,
        wordType: dictionary.wordType,
        alternateForms: dictionary.alternateForms,
        similarWords: dictionary.similarWords,
        verbConjugationPattern: dictionary.verbConjugationPattern,
        hasIlAelContrast: dictionary.hasIlAelContrast,
        etymology: dictionary.etymology,
        exampleSentences: dictionary.exampleSentences,
        etymologicallyRelatedWords: dictionary.etymologicallyRelatedWords,
        usageNotes: dictionary.usageNotes,
        verbTransitivity: dictionary.verbTransitivity,
        rootsAffixes: sql`COALESCE(
          array_agg(DISTINCT ${roots.root}) FILTER (WHERE ${roots.root} IS NOT NULL),
          ARRAY[]::text[]
        )`,
        affixes: sql`COALESCE(
          array_agg(DISTINCT ${affixes.affix}) FILTER (WHERE ${affixes.affix} IS NOT NULL),
          ARRAY[]::text[]
        )`,
      })
      .from(dictionary)
      .leftJoin(wordsRoots, eq(dictionary.wordId, wordsRoots.wordId))
      .leftJoin(roots, eq(wordsRoots.rootId, roots.rootId))
      .leftJoin(wordsAffixes, eq(dictionary.wordId, wordsAffixes.wordId))
      .leftJoin(affixes, eq(wordsAffixes.affixId, affixes.affixId))
      .where(where)
      .groupBy(dictionary.wordId)
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

// POST /api/words — create a new word
export async function POST(request) {
  try {
    const body = await request.json();
    const parsed = createWordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { rootsAffixes, ...wordData } = parsed.data;

    const [inserted] = await db
      .insert(dictionary)
      .values(wordData)
      .returning();

    await syncRoots(inserted.wordId, rootsAffixes);

    return NextResponse.json(inserted, { status: 201 });
  } catch (error) {
    console.error("Create error:", error);
    return NextResponse.json({ error: "Failed to create word" }, { status: 500 });
  }
}
