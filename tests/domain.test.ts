import test from "node:test";
import assert from "node:assert/strict";
import {
  isValidDate,
  parseCompletion,
  parseFerrata,
  validateCompletion,
  isSafeSourceUrl,
} from "../src/lib/validation.ts";
import { summarizeProgress } from "../src/lib/progress.ts";

const routeData = {
  name: "Test route",
  country: "Austria",
  region: "Tyrol",
  difficulty: "B/C",
  difficultyRank: 2.5,
  lengthM: 320,
  description: "A test route.",
  sourceUrl: "https://example.com/route",
};

test("validates real calendar dates including leap years", () => {
  assert.equal(isValidDate("2024-02-29"), true);
  for (const value of [
    "2025-02-29",
    "2026-04-31",
    "2026-13-01",
    "2026-2-01",
    "garbage",
  ]) {
    assert.equal(isValidDate(value), false);
  }
});
test("rejects future dates and oversized notes but accepts a blank note", () => {
  assert.equal(validateCompletion("2020-01-02", ""), null);
  assert.match(validateCompletion("9999-12-31", "")!, /future/);
  assert.match(validateCompletion("2020-01-02", "x".repeat(2001))!, /2000/);
});
test("only accepts HTTP or HTTPS source links", () => {
  assert.equal(isSafeSourceUrl("https://example.com"), true);
  assert.equal(isSafeSourceUrl("javascript:alert(1)"), false);
  assert.equal(isSafeSourceUrl("/relative"), false);
});
test("validates Firestore records and uses the document ID", () => {
  const result = parseFerrata("correct-id", {
    ...routeData,
    id: "wrong-id",
    elevationGainM: 0,
  });
  assert.equal(result.id, "correct-id");
  assert.equal(result.elevationGainM, 0);
  assert.throws(() => parseFerrata("bad", { ...routeData, lengthM: "320" }));
  assert.throws(() => parseFerrata("bad", { ...routeData, latitude: 91 }));
  assert.throws(() =>
    parseFerrata("bad", { ...routeData, sourceUrl: "javascript:alert(1)" }),
  );
  assert.deepEqual(
    parseCompletion("route", { completedAt: "2020-02-29", note: "" }),
    { ferrataId: "route", completedAt: "2020-02-29", note: "" },
  );
  assert.throws(() =>
    parseCompletion("bad", { completedAt: "2020-02-30", note: "" }),
  );
  assert.equal(
    parseCompletion("route", {
      completedAt: "2020-01-01",
      note: "x".repeat(2000),
    }).note.length,
    2000,
  );
  assert.throws(() =>
    parseCompletion("bad", {
      completedAt: "2020-01-01",
      note: "x".repeat(2001),
    }),
  );
});
test("keeps unavailable completions, sorts newest first and counts known countries and grades", () => {
  const ferratas = [
    parseFerrata("a", routeData),
    parseFerrata("b", {
      ...routeData,
      country: "Italy",
      difficulty: "A",
      difficultyRank: 1,
    }),
  ];
  const records = [
    { ferrataId: "a", completedAt: "2020-01-02", note: "" },
    {
      ferrataId: "missing",
      completedAt: "2021-01-01",
      note: "Keep this memory",
    },
    { ferrataId: "b", completedAt: "2020-01-03", note: "" },
  ];
  const result = summarizeProgress(records, ferratas);
  assert.equal(result.completedFerratas.length, 3);
  assert.equal(result.completedFerratas[0].ferrata, undefined);
  assert.deepEqual(result.countryCounts, { Italy: 1, Austria: 1 });
  assert.deepEqual(result.difficultyCounts, { A: 1, "B/C": 1 });
  assert.equal(records[0].ferrataId, "a", "does not mutate source order");
});
test("an empty journal has empty summaries", () => {
  assert.deepEqual(summarizeProgress([], []), {
    completedFerratas: [],
    countryCounts: {},
    difficultyCounts: {},
    difficultyRanks: {},
  });
});
