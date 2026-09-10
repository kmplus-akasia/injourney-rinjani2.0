export type CompetencyScoreRow = {
  competency_name: string;
  score: number;
  max_score: number;
};

export type PeriodComparisonRow = {
  name: string;
  current: number;
  previous: number | null;
  delta: number | null;
  maxScore: number;
};

export function compareCompetencyScores(
  current: CompetencyScoreRow[],
  previous: CompetencyScoreRow[] | undefined,
): PeriodComparisonRow[] {
  return current.map((item) => {
    const prior = previous?.find((row) => row.competency_name === item.competency_name);
    return {
      name: item.competency_name,
      current: item.score,
      previous: prior ? prior.score : null,
      delta: prior ? Number((item.score - prior.score).toFixed(2)) : null,
      maxScore: item.max_score,
    };
  });
}

export function isCompetencyGap(score: number, maxScore: number, threshold = 0.8): boolean {
  if (!maxScore) return false;
  return score / maxScore < threshold;
}
