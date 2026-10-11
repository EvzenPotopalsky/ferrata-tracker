import type { Ferrata } from "../types/ferrata";
import type { FerrataCompletion } from "../types/completion";

export function summarizeProgress(
  completions: FerrataCompletion[],
  ferratas: Ferrata[],
) {
  const completedFerratas = [...completions]
    .sort(
      (a, b) =>
        b.completedAt.localeCompare(a.completedAt) ||
        a.ferrataId.localeCompare(b.ferrataId),
    )
    .map((completion) => ({
      completion,
      ferrata: ferratas.find((item) => item.id === completion.ferrataId),
    }));

  const countryCounts: Record<string, number> = {};
  const difficultyCounts: Record<string, number> = {};
  const difficultyRanks: Record<string, number> = {};
  for (const { ferrata } of completedFerratas) {
    if (!ferrata) continue;
    countryCounts[ferrata.country] = (countryCounts[ferrata.country] ?? 0) + 1;
    difficultyCounts[ferrata.difficulty] =
      (difficultyCounts[ferrata.difficulty] ?? 0) + 1;
    difficultyRanks[ferrata.difficulty] = ferrata.difficultyRank;
  }
  return {
    completedFerratas,
    countryCounts,
    difficultyCounts,
    difficultyRanks,
  };
}
