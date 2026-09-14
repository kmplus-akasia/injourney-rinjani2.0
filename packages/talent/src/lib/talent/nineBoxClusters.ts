/**
 * Shared 9-Box cell → official 5-cluster mapping (BPR-TM-002 / Business Process §4.5).
 * Axes: Y = Performance (High/Medium/Low ≈ Excellent/Successful/Below),
 *       X = Potential (Low/Medium/High).
 */

export type NineBoxCellId =
  | "h-h"
  | "h-m"
  | "h-l"
  | "m-h"
  | "m-m"
  | "m-l"
  | "l-h"
  | "l-m"
  | "l-l";

export type OfficialCluster =
  | "Sleeping Tiger"
  | "Promotable"
  | "High Potential"
  | "Unfit"
  | "Solid Contributor";

export type PerformanceBand = "High" | "Medium" | "Low";
export type PotentialBand = "Low" | "Medium" | "High";

export interface NineBoxCellMeta {
  id: NineBoxCellId;
  name: OfficialCluster;
  performance: PerformanceBand;
  potential: PotentialBand;
  /** Axis label for Performance (BR-TC-002) */
  performanceLabel: "Excellent" | "Successful" | "Below";
  /** Axis label for Potential (BR-TC-003) */
  potentialLabel: "High" | "Medium" | "Low";
  colorClass: string;
  textColorClass: string;
  description: string;
  /** Maps to TalentCluster slug used in My Team / Talent Pool */
  talentClusterSlug:
    | "9box_sleeping_tiger"
    | "9box_promotable"
    | "9box_high_potential"
    | "9box_unfit"
    | "9box_solid_contributor";
}

export const PERFORMANCE_AXIS_LABELS: Record<PerformanceBand, "Excellent" | "Successful" | "Below"> = {
  High: "Excellent",
  Medium: "Successful",
  Low: "Below",
};

export const POTENTIAL_AXIS_LABELS: Record<PotentialBand, "High" | "Medium" | "Low"> = {
  High: "High",
  Medium: "Medium",
  Low: "Low",
};

/** Canonical cell definitions — BRD §4.5 oriented to UI axes. */
export const NINE_BOX_CELLS: NineBoxCellMeta[] = [
  {
    id: "h-l",
    name: "Solid Contributor",
    performance: "High",
    potential: "Low",
    performanceLabel: "Excellent",
    potentialLabel: "Low",
    colorClass: "bg-blue-500",
    textColorClass: "text-white",
    description: "High performance with limited potential growth",
    talentClusterSlug: "9box_solid_contributor",
  },
  {
    id: "h-m",
    name: "Promotable",
    performance: "High",
    potential: "Medium",
    performanceLabel: "Excellent",
    potentialLabel: "Medium",
    colorClass: "bg-emerald-500",
    textColorClass: "text-white",
    description: "High performance with room to grow",
    talentClusterSlug: "9box_promotable",
  },
  {
    id: "h-h",
    name: "High Potential",
    performance: "High",
    potential: "High",
    performanceLabel: "Excellent",
    potentialLabel: "High",
    colorClass: "bg-emerald-600",
    textColorClass: "text-white",
    description: "Consistently high performance and high potential",
    talentClusterSlug: "9box_high_potential",
  },
  {
    id: "m-l",
    name: "Solid Contributor",
    performance: "Medium",
    potential: "Low",
    performanceLabel: "Successful",
    potentialLabel: "Low",
    colorClass: "bg-blue-500",
    textColorClass: "text-white",
    description: "Steady performance with limited potential",
    talentClusterSlug: "9box_solid_contributor",
  },
  {
    id: "m-m",
    name: "Promotable",
    performance: "Medium",
    potential: "Medium",
    performanceLabel: "Successful",
    potentialLabel: "Medium",
    colorClass: "bg-emerald-500",
    textColorClass: "text-white",
    description: "Reliable performance and steady potential",
    talentClusterSlug: "9box_promotable",
  },
  {
    id: "m-h",
    name: "Promotable",
    performance: "Medium",
    potential: "High",
    performanceLabel: "Successful",
    potentialLabel: "High",
    colorClass: "bg-emerald-500",
    textColorClass: "text-white",
    description: "Good performance with high potential",
    talentClusterSlug: "9box_promotable",
  },
  {
    id: "l-l",
    name: "Unfit",
    performance: "Low",
    potential: "Low",
    performanceLabel: "Below",
    potentialLabel: "Low",
    colorClass: "bg-red-500",
    textColorClass: "text-white",
    description: "Low performance and low potential",
    talentClusterSlug: "9box_unfit",
  },
  {
    id: "l-m",
    name: "Sleeping Tiger",
    performance: "Low",
    potential: "Medium",
    performanceLabel: "Below",
    potentialLabel: "Medium",
    colorClass: "bg-teal-500",
    textColorClass: "text-white",
    description: "Underperforming relative to potential",
    talentClusterSlug: "9box_sleeping_tiger",
  },
  {
    id: "l-h",
    name: "Sleeping Tiger",
    performance: "Low",
    potential: "High",
    performanceLabel: "Below",
    potentialLabel: "High",
    colorClass: "bg-teal-500",
    textColorClass: "text-white",
    description: "High potential not yet reflected in performance",
    talentClusterSlug: "9box_sleeping_tiger",
  },
];

export const NINE_BOX_CELL_BY_ID: Record<NineBoxCellId, NineBoxCellMeta> = NINE_BOX_CELLS.reduce(
  (acc, cell) => {
    acc[cell.id] = cell;
    return acc;
  },
  {} as Record<NineBoxCellId, NineBoxCellMeta>,
);

export function getCellByPerformancePotential(
  performance: PerformanceBand,
  potential: PotentialBand,
): NineBoxCellMeta | undefined {
  return NINE_BOX_CELLS.find((c) => c.performance === performance && c.potential === potential);
}

export function getOfficialCluster(cellId: NineBoxCellId | string | null | undefined): OfficialCluster | null {
  if (!cellId || !(cellId in NINE_BOX_CELL_BY_ID)) return null;
  return NINE_BOX_CELL_BY_ID[cellId as NineBoxCellId].name;
}

export function getClusterIdFromScores(performance: number, potential: number): NineBoxCellId {
  let p: "l" | "m" | "h" = "l";
  let c: "l" | "m" | "h" = "l";

  if (performance >= 100) p = "h";
  else if (performance >= 80) p = "m";

  if (potential >= 80) c = "h";
  else if (potential >= 60) c = "m";

  return `${p}-${c}` as NineBoxCellId;
}

export const BOX_LIMITS: Record<
  NineBoxCellId,
  { performance: { lower: number; upper: number }; potential: { lower: number; upper: number } }
> = {
  "h-h": { performance: { lower: 100, upper: 120 }, potential: { lower: 80, upper: 100 } },
  "h-m": { performance: { lower: 100, upper: 120 }, potential: { lower: 60, upper: 80 } },
  "h-l": { performance: { lower: 100, upper: 120 }, potential: { lower: 0, upper: 60 } },
  "m-h": { performance: { lower: 80, upper: 100 }, potential: { lower: 80, upper: 100 } },
  "m-m": { performance: { lower: 80, upper: 100 }, potential: { lower: 60, upper: 80 } },
  "m-l": { performance: { lower: 80, upper: 100 }, potential: { lower: 0, upper: 60 } },
  "l-h": { performance: { lower: 0, upper: 80 }, potential: { lower: 80, upper: 100 } },
  "l-m": { performance: { lower: 0, upper: 80 }, potential: { lower: 60, upper: 80 } },
  "l-l": { performance: { lower: 0, upper: 80 }, potential: { lower: 0, upper: 60 } },
};

export const OFFICIAL_CLUSTERS: OfficialCluster[] = [
  "High Potential",
  "Promotable",
  "Solid Contributor",
  "Sleeping Tiger",
  "Unfit",
];
