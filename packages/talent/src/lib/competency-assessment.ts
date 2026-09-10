export type CompetencyItem = {
  competencyId: string;
  competencyName: string;
  cluster: string;
  requiredLevel: number;
  individualLevel: number;
  evidence?: string;
};

export function itemScore(individualLevel: number, requiredLevel: number): number {
  if (!requiredLevel) return 0;
  return Number((Math.min(individualLevel / requiredLevel, 1) * 100).toFixed(2));
}

export function eqsKompetensi(items: Array<Pick<CompetencyItem, "individualLevel" | "requiredLevel">>): number {
  if (items.length === 0) return 0;
  const total = items.reduce((sum, item) => sum + itemScore(item.individualLevel, item.requiredLevel), 0);
  return Number((total / items.length).toFixed(2));
}

export function competencyGap(individualLevel: number, requiredLevel: number): number {
  return Math.max(requiredLevel - individualLevel, 0);
}

export function gapSeverity(gap: number): "none" | "moderate" | "significant" {
  if (gap <= 0) return "none";
  if (gap >= 2) return "significant";
  return "moderate";
}
