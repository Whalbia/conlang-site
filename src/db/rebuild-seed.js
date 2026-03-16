/**
 * Rebuilds seed-data.json by applying heuristic rules to extract roots and affixes.
 *
 * Rules:
 * 1) VERBS ONLY: strip endings (-vu, -la, -aen, -alle) to find root
 * 2) NOUNS/ADJ/ADV: match derivational affixes, strip to find root
 *    - If extracted root doesn't appear in at least one other word, try another affix
 * 3) Most statives ARE roots
 * 4) Remove affixes incorrectly listed as roots
 * 5) Infer new affixes: for words with a known root, remainder is the affix
 *
 * Run: node src/db/rebuild-seed.js
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ============================================================
// KNOWN DATA FROM THE REFERENCE DOCUMENT
// ============================================================

// Official roots from the MD file (74 roots, "wal" intentionally listed twice with different meanings)
const OFFICIAL_ROOTS = [
  "atl", "dit", "ene", "go", "il", "irr", "itk", "ipevi", "iv", "jakt",
  "jo", "kaeje", "kagyl", "kaiv", "kak", "karral", "kaz", "kemente", "kerre",
  "kiva", "kwo", "lalla", "lina/linai", "lun", "mampa", "marral", "marru",
  "migi", "moi", "moli", "moza", "muli", "murr", "muz", "nai", "nami",
  "orr/orrv", "pa", "pan/pwan", "pava", "poit", "pokty", "purru", "pwarr",
  "pwev", "rren", "rrau", "rruma", "samtyn", "silla", "sumpa", "sut",
  "turr", "twaez", "twegaiz", "tweli", "twytwa", "u/ui", "un", "uskai",
  "valko", "valt", "vil/viln", "vlamz", "vyt", "waej/waejum", "waent",
  "wal", "wentw/wentwig", "werrta", "ynta", "ynti", "zupu"
];

// Flattened official roots for matching (split slash-separated ones)
const OFFICIAL_ROOTS_FLAT = new Set();
for (const r of OFFICIAL_ROOTS) {
  for (const part of r.split("/")) {
    OFFICIAL_ROOTS_FLAT.add(part);
  }
}

// Official derivational affixes from the MD file
const OFFICIAL_AFFIXES_DEF = [
  { affix: "aem", type: "suffix", alternates: [] },
  { affix: "aesk", type: "suffix", alternates: ["sk"] },
  { affix: "ai", type: "suffix", alternates: ["zai"] },
  { affix: "alla", type: "prefix", alternates: ["all"] },
  { affix: "ima", type: "suffix", alternates: [] },
  { affix: "ama", type: "suffix", alternates: [] },
  { affix: "ampe", type: "suffix", alternates: ["mpe"] },
  { affix: "ate", type: "prefix", alternates: ["at", "ote", "ot"] },
  { affix: "aty", type: "suffix", alternates: ["taty"] },
  { affix: "d", type: "prefix", alternates: ["da"] },
  { affix: "el", type: "suffix", alternates: [] },
  { affix: "en", type: "suffix", alternates: [] },
  { affix: "et", type: "suffix", alternates: ["ktet"] },
  { affix: "il", type: "suffix", alternates: [] },
  { affix: "imi", type: "suffix", alternates: [] },
  { affix: "jaerr", type: "suffix", alternates: [] },
  { affix: "jen", type: "suffix", alternates: [] },
  { affix: "k", type: "suffix", alternates: ["ek"] },
  { affix: "ka", type: "suffix", alternates: [] },
  { affix: "kamu", type: "suffix", alternates: [] },
  { affix: "kaz", type: "suffix", alternates: [] },
  { affix: "kit", type: "suffix", alternates: ["lkit", "olkit"] },
  { affix: "kwa", type: "suffix", alternates: [] },
  { affix: "laek", type: "suffix", alternates: [] },
  { affix: "ma", type: "prefix", alternates: ["na", "ena"] },
  { affix: "manu", type: "suffix", alternates: [] },
  { affix: "merr", type: "suffix", alternates: [] },
  { affix: "mu", type: "suffix", alternates: [] },
  { affix: "oima", type: "suffix", alternates: ["goima"] },
  { affix: "olve", type: "suffix", alternates: [] },
  { affix: "otw", type: "suffix", alternates: ["potw"] },
  { affix: "pae", type: "suffix", alternates: [] },
  { affix: "pik", type: "suffix", alternates: [] },
  { affix: "pwa", type: "suffix", alternates: [] },
  { affix: "sili", type: "suffix", alternates: [] },
  { affix: "taem", type: "suffix", alternates: [] },
  { affix: "tiv", type: "suffix", alternates: [] },
  { affix: "tyz", type: "suffix", alternates: ["yz"] },
  { affix: "umaik", type: "suffix", alternates: [] },
  { affix: "ug", type: "suffix", alternates: [] },
  { affix: "ushaz", type: "suffix", alternates: ["shaz"] },
  { affix: "uv", type: "suffix", alternates: ["v"] },
  { affix: "uz", type: "suffix", alternates: [] },
  { affix: "wal", type: "suffix", alternates: [] },
  { affix: "yk", type: "suffix", alternates: [] },
  { affix: "yl", type: "suffix", alternates: [] },
  { affix: "zo", type: "suffix", alternates: [] },
  { affix: "zumu", type: "suffix", alternates: [] },
];

// Build suffix/prefix lists sorted by length (longest first for greedy matching)
const SUFFIXES = [];
const PREFIXES = [];
for (const aff of OFFICIAL_AFFIXES_DEF) {
  const forms = [aff.affix, ...aff.alternates];
  for (const f of forms) {
    if (aff.type === "suffix") SUFFIXES.push(f);
    else PREFIXES.push(f);
  }
}
SUFFIXES.sort((a, b) => b.length - a.length);
PREFIXES.sort((a, b) => b.length - a.length);

const WORD_TYPES = { NOUN: 1, VERB: 2, ADJECTIVE: 3, STATIVE: 4, PRONOUN: 5, DISC: 6, PHRASE: 7, MISC: 8 };

// ============================================================
// LOAD EXISTING SEED DATA
// ============================================================

const seedData = JSON.parse(readFileSync(join(__dirname, "seed-data.json"), "utf-8"));
console.log(`Loaded ${seedData.words.length} words, ${seedData.roots.length} old roots, ${seedData.wordsRoots.length} old associations`);

// ============================================================
// STEP 1: Build the full root set
// ============================================================

// Start with official roots
const allRoots = new Set();
for (const r of OFFICIAL_ROOTS) allRoots.add(r);

// 1a) VERB ROOTS: strip endings to get stems
function extractVerbStem(word) {
  for (const ending of ["alle", "aen", "la", "vu"]) {
    if (word.endsWith(ending) && word.length > ending.length) {
      return { stem: word.slice(0, -ending.length), ending };
    }
  }
  return null;
}

const verbStemMap = new Map(); // stem -> [{wordIndex, ending}]
for (let i = 0; i < seedData.words.length; i++) {
  const w = seedData.words[i];
  if (w.wordType !== WORD_TYPES.VERB) continue;
  const result = extractVerbStem(w.word);
  if (result) {
    if (!verbStemMap.has(result.stem)) verbStemMap.set(result.stem, []);
    verbStemMap.get(result.stem).push({ wordIndex: i, ending: result.ending });
    allRoots.add(result.stem);
  }
}
console.log(`Verb stems (new roots): ${verbStemMap.size}`);

// 1b) STATIVE ROOTS: most statives are roots
// A stative is a root if it appears as a component in at least 1 other word
const allWordStrings = seedData.words.map(w => w.word);

function appearsInOtherWords(candidate, minLen = 3) {
  if (candidate.length < minLen) return false;
  let count = 0;
  for (const w of allWordStrings) {
    if (w !== candidate && w.includes(candidate)) {
      count++;
      if (count >= 1) return true;
    }
  }
  return false;
}

const stativeRoots = new Set();
for (let i = 0; i < seedData.words.length; i++) {
  const w = seedData.words[i];
  if (w.wordType !== WORD_TYPES.STATIVE) continue;

  // Is it already an official root?
  if (OFFICIAL_ROOTS_FLAT.has(w.word)) {
    stativeRoots.add(w.word);
    allRoots.add(w.word);
    continue;
  }

  // Does it appear in other words?
  if (appearsInOtherWords(w.word)) {
    stativeRoots.add(w.word);
    allRoots.add(w.word);
  }
}
console.log(`Stative roots: ${stativeRoots.size}`);

// 1c) NOUN/ADJ/ADV ROOTS: strip known affixes
function extractNonVerbRootCandidates(word) {
  const candidates = [];
  for (const suf of SUFFIXES) {
    if (word.endsWith(suf) && word.length > suf.length + 1) {
      candidates.push({ root: word.slice(0, -suf.length), affix: suf, position: "suffix" });
    }
  }
  for (const pre of PREFIXES) {
    if (word.startsWith(pre) && word.length > pre.length + 1) {
      candidates.push({ root: word.slice(pre.length), affix: pre, position: "prefix" });
    }
  }
  return candidates;
}

// First pass: gather all candidates
const nonVerbCandidates = new Map(); // wordIndex -> candidates[]
for (let i = 0; i < seedData.words.length; i++) {
  const w = seedData.words[i];
  if (w.wordType !== WORD_TYPES.NOUN && w.wordType !== WORD_TYPES.ADJECTIVE) continue;
  if (w.word.includes(" ")) continue;
  const cands = extractNonVerbRootCandidates(w.word);
  if (cands.length > 0) nonVerbCandidates.set(i, cands);
}

// Second pass: pick best candidate per word
// Priority: 1) matches already-known root, 2) root appears in 2+ words
const nonVerbRootAssignments = new Map(); // wordIndex -> {root, affix, position}

for (const [idx, cands] of nonVerbCandidates) {
  let best = null;

  // Priority 1: candidate root is already a known root
  for (const c of cands) {
    if (allRoots.has(c.root) || OFFICIAL_ROOTS_FLAT.has(c.root)) {
      best = c;
      break;
    }
  }

  // Priority 2: candidate root appears in at least 1 other word
  if (!best) {
    for (const c of cands) {
      if (c.root.length >= 3 && appearsInOtherWords(c.root)) {
        best = c;
        break;
      }
    }
  }

  if (best) {
    nonVerbRootAssignments.set(idx, best);
    allRoots.add(best.root);
  }
}
console.log(`Non-verb root extractions: ${nonVerbRootAssignments.size}`);
console.log(`Total roots: ${allRoots.size}`);

// ============================================================
// STEP 2: Infer affixes (ONLY from words with established roots)
// ============================================================

const allAffixSet = new Set();
// Start with official affixes
for (const aff of OFFICIAL_AFFIXES_DEF) {
  allAffixSet.add(aff.affix);
  for (const alt of aff.alternates) allAffixSet.add(alt);
}
// Add verb endings
allAffixSet.add("vu");
allAffixSet.add("la");
allAffixSet.add("aen");
allAffixSet.add("alle");

// For each word where we know the root, extract the non-root part as affix
// Verbs: ending is the affix
for (const [stem, entries] of verbStemMap) {
  for (const { ending } of entries) {
    allAffixSet.add(ending);
  }
  // Also check if the stem itself contains a sub-root + affix
  // e.g., stem "kakpwev" contains roots "kak" and "pwev" - no new affix
}

// Non-verbs: the stripped affix
for (const [, assignment] of nonVerbRootAssignments) {
  if (assignment.affix.length >= 1) {
    allAffixSet.add(assignment.affix);
  }
}

// For words with known roots where root is a proper substring at start/end,
// extract the other part as a potential affix
const rootsFlat = new Set();
for (const r of allRoots) {
  for (const p of r.split("/")) rootsFlat.add(p);
}

for (let i = 0; i < seedData.words.length; i++) {
  const w = seedData.words[i];
  if (w.word.includes(" ")) continue;
  if (w.wordType === WORD_TYPES.PRONOUN || w.wordType === WORD_TYPES.MISC) continue;

  for (const rp of rootsFlat) {
    if (rp.length < 3) continue;
    if (!w.word.includes(rp)) continue;
    if (w.word === rp) continue;

    const idx = w.word.indexOf(rp);
    // Only if root is at start or end (not embedded in middle with stuff on both sides)
    if (idx === 0) {
      const suffix = w.word.slice(rp.length);
      if (suffix.length >= 2 && suffix.length <= 7 && !rootsFlat.has(suffix)) {
        allAffixSet.add(suffix);
      }
    } else if (idx + rp.length === w.word.length) {
      const prefix = w.word.slice(0, idx);
      if (prefix.length >= 2 && prefix.length <= 7 && !rootsFlat.has(prefix)) {
        allAffixSet.add(prefix);
      }
    }
  }
}

// Remove anything that is also a root
for (const r of rootsFlat) {
  allAffixSet.delete(r);
}

console.log(`Total affixes: ${allAffixSet.size}`);

// ============================================================
// STEP 3: Build associations
// ============================================================

const finalRoots = [...allRoots].sort();
const finalAffixes = [...allAffixSet].sort();

const rootIdxMap = new Map();
finalRoots.forEach((r, i) => rootIdxMap.set(r, i));
const affixIdxMap = new Map();
finalAffixes.forEach((a, i) => affixIdxMap.set(a, i));

const wordsRootsOut = [];
const wordsAffixesOut = [];
const wordRootSeen = new Map(); // wordIndex -> Set<rootIndex>
const wordAffixSeen = new Map(); // wordIndex -> Set<affixIndex>

function linkRoot(wi, rootStr) {
  // Try exact match first
  let ri = rootIdxMap.get(rootStr);
  if (ri === undefined) {
    // Try finding slash-separated root that contains this
    for (const [fullRoot, idx] of rootIdxMap) {
      if (fullRoot.includes("/") && fullRoot.split("/").includes(rootStr)) {
        ri = idx;
        break;
      }
    }
  }
  if (ri === undefined) return;
  if (!wordRootSeen.has(wi)) wordRootSeen.set(wi, new Set());
  if (wordRootSeen.get(wi).has(ri)) return;
  wordRootSeen.get(wi).add(ri);
  wordsRootsOut.push({ wordIndex: wi, rootIndex: ri });
}

function linkAffix(wi, affStr) {
  const ai = affixIdxMap.get(affStr);
  if (ai === undefined) return;
  if (!wordAffixSeen.has(wi)) wordAffixSeen.set(wi, new Set());
  if (wordAffixSeen.get(wi).has(ai)) return;
  wordAffixSeen.get(wi).add(ai);
  wordsAffixesOut.push({ wordIndex: wi, affixIndex: ai });
}

// 3a) Verbs: link stem as root, ending as affix
for (const [stem, entries] of verbStemMap) {
  for (const { wordIndex, ending } of entries) {
    linkRoot(wordIndex, stem);
    linkAffix(wordIndex, ending);
  }
}

// 3b) Non-verb affix-stripped words
for (const [idx, assignment] of nonVerbRootAssignments) {
  linkRoot(idx, assignment.root);
  linkAffix(idx, assignment.affix);
}

// 3c) Statives that are roots
for (let i = 0; i < seedData.words.length; i++) {
  const w = seedData.words[i];
  if (w.wordType === WORD_TYPES.STATIVE && stativeRoots.has(w.word)) {
    linkRoot(i, w.word);
  }
}

// 3d) All single words: check if they contain official roots (length >= 4 to avoid false matches)
for (let i = 0; i < seedData.words.length; i++) {
  const w = seedData.words[i];
  const target = w.word.includes(" ") ? w.word.split(" ") : [w.word];

  for (const part of target) {
    for (const r of OFFICIAL_ROOTS) {
      for (const rp of r.split("/")) {
        if (rp.length < 4) continue;
        if (part.includes(rp)) {
          linkRoot(i, rp);
        }
      }
    }
    // Also check stative roots in compound words
    for (const sr of stativeRoots) {
      if (sr.length < 4) continue;
      if (part.includes(sr) && part !== sr) {
        linkRoot(i, sr);
      }
    }
    // Also check verb stems in compound words
    for (const [stem] of verbStemMap) {
      if (stem.length < 4) continue;
      if (part.includes(stem) && part !== stem) {
        linkRoot(i, stem);
      }
    }
  }
}

// 3e) For words that have a root assigned, check if there's a remaining affix
for (let i = 0; i < seedData.words.length; i++) {
  if (!wordRootSeen.has(i)) continue;
  const w = seedData.words[i];
  if (w.word.includes(" ")) continue;

  for (const ri of wordRootSeen.get(i)) {
    const rootStr = finalRoots[ri];
    for (const rp of rootStr.split("/")) {
      if (!w.word.includes(rp)) continue;
      const idx = w.word.indexOf(rp);
      const prefix = w.word.slice(0, idx);
      const suffix = w.word.slice(idx + rp.length);
      if (prefix && allAffixSet.has(prefix)) linkAffix(i, prefix);
      if (suffix && allAffixSet.has(suffix)) linkAffix(i, suffix);
    }
  }
}

console.log(`\nWord-root associations: ${wordsRootsOut.length}`);
console.log(`Word-affix associations: ${wordsAffixesOut.length}`);
console.log(`Words with roots: ${wordRootSeen.size}`);
console.log(`Words with affixes: ${wordAffixSeen.size}`);

// ============================================================
// STEP 4: Output
// ============================================================

const output = {
  roots: finalRoots.map(r => ({ root: r })),
  affixes: finalAffixes.map(a => ({ affix: a })),
  words: seedData.words,
  wordsRoots: wordsRootsOut,
  wordsAffixes: wordsAffixesOut,
};

const outputPath = join(__dirname, "seed-data-v2.json");
writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log(`\n=== SUMMARY ===`);
console.log(`Roots: ${output.roots.length} (was ${seedData.roots.length})`);
console.log(`Affixes: ${output.affixes.length}`);
console.log(`Words: ${output.words.length}`);
console.log(`Word-Root assocs: ${output.wordsRoots.length} (was ${seedData.wordsRoots.length})`);
console.log(`Word-Affix assocs: ${output.wordsAffixes.length}`);
console.log(`Output: ${outputPath}`);

// Report
const removedOld = seedData.roots.map(r => r.root).filter(r => !allRoots.has(r));
console.log(`\n=== REMOVED OLD ROOTS (were affixes/escaped) ===`);
removedOld.forEach(r => console.log(`  ${r}`));

console.log(`\n=== STATIVES MATCHED AS ROOTS (${stativeRoots.size}) ===`);
[...stativeRoots].sort().forEach(s => console.log(`  ${s}`));

const noRootWords = [];
for (let i = 0; i < seedData.words.length; i++) {
  if (!wordRootSeen.has(i)) noRootWords.push({ i, word: seedData.words[i].word, type: seedData.words[i].wordType });
}
console.log(`\n=== WORDS WITHOUT ROOTS: ${noRootWords.length} ===`);
const byType = {};
for (const w of noRootWords) {
  if (!byType[w.type]) byType[w.type] = [];
  byType[w.type].push(w.word);
}
const typeNames = { 1: "Noun", 2: "Verb", 3: "Adj", 4: "Stative", 5: "Pronoun", 6: "Disc", 7: "Phrase", 8: "Misc" };
for (const [t, words] of Object.entries(byType)) {
  console.log(`  ${typeNames[t] || t} (${words.length}): ${words.slice(0, 10).join(", ")}${words.length > 10 ? "..." : ""}`);
}

// Sample of new verb-stem roots
const verbOnlyRoots = [...verbStemMap.keys()].filter(s => !OFFICIAL_ROOTS_FLAT.has(s)).sort();
console.log(`\n=== SAMPLE VERB-STEM ROOTS (${verbOnlyRoots.length} new) ===`);
verbOnlyRoots.slice(0, 30).forEach(r => console.log(`  ${r}`));
if (verbOnlyRoots.length > 30) console.log(`  ... and ${verbOnlyRoots.length - 30} more`);
