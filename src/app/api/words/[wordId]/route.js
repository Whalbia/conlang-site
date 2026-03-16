import { NextResponse } from "next/server";
import { db } from "@/db";
import { dictionary, roots, wordsRoots, affixes, wordsAffixes } from "@/db/schema";
import { updateWordSchema } from "@/db/validators";
import { eq, sql, inArray } from "drizzle-orm";

// helper: sync roots/affixes for a word
async function syncRoots(wordId, rootsAffixes) {
  if (!rootsAffixes) return;

  // clear old links
  await db.delete(wordsRoots).where(eq(wordsRoots.wordId, wordId));

  if (rootsAffixes.length === 0) return;

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

  // insert fresh links
  const rootIds = rootsAffixes.map((r) => existingRootMap.get(r)).filter(Boolean);
  if (rootIds.length > 0) {
    await db
      .insert(wordsRoots)
      .values(rootIds.map((rootId) => ({ wordId, rootId })));
  }
}

// GET /api/words/[wordId] — get a single word
export async function GET(request, { params }) {
  try {
    const wordId = Number(params.wordId);
    if (isNaN(wordId)) {
      return NextResponse.json({ error: "Invalid word ID" }, { status: 400 });
    }

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
      .where(eq(dictionary.wordId, wordId))
      .groupBy(dictionary.wordId);

    if (results.length === 0) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }

    return NextResponse.json(results[0]);
  } catch (error) {
    console.error("Get word error:", error);
    return NextResponse.json({ error: "Failed to get word" }, { status: 500 });
  }
}

// PUT /api/words/[wordId] — update a word
export async function PUT(request, { params }) {
  try {
    const wordId = Number(params.wordId);
    if (isNaN(wordId)) {
      return NextResponse.json({ error: "Invalid word ID" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = updateWordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { rootsAffixes, ...wordData } = parsed.data;

    // only update if there are word fields to update
    if (Object.keys(wordData).length > 0) {
      const [updated] = await db
        .update(dictionary)
        .set(wordData)
        .where(eq(dictionary.wordId, wordId))
        .returning();

      if (!updated) {
        return NextResponse.json({ error: "Word not found" }, { status: 404 });
      }
    }

    await syncRoots(wordId, rootsAffixes);

    // return the full word with roots
    const [result] = await db
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
      .where(eq(dictionary.wordId, wordId))
      .groupBy(dictionary.wordId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Failed to update word" }, { status: 500 });
  }
}

// DELETE /api/words/[wordId] — delete a word
export async function DELETE(request, { params }) {
  try {
    const wordId = Number(params.wordId);
    if (isNaN(wordId)) {
      return NextResponse.json({ error: "Invalid word ID" }, { status: 400 });
    }

    const [deleted] = await db
      .delete(dictionary)
      .where(eq(dictionary.wordId, wordId))
      .returning({ wordId: dictionary.wordId });

    if (!deleted) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Word deleted", wordId: deleted.wordId });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Failed to delete word" }, { status: 500 });
  }
}
