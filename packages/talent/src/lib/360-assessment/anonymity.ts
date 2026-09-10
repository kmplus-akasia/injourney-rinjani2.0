export type PerspectiveChannel = "self" | "superior" | "peer" | "subordinate" | "others";

export type ChannelScore = {
  channel: PerspectiveChannel;
  assessorCount: number;
  rawScore: number;
  weight: number;
  weightedScore: number;
};

export type AnonymityView = {
  visible: ChannelScore[];
  combinedOthers: ChannelScore | null;
  hiddenChannels: PerspectiveChannel[];
};

const ANONYMOUS_CHANNELS: PerspectiveChannel[] = ["peer", "subordinate"];

export const DEFAULT_ANONYMITY_THRESHOLD = 3;

export function channelsFromBreakdown(
  breakdown: Array<{
    channel: string;
    assessor_count: number;
    raw_score: number;
    weight: number;
    weighted_score: number;
  }>,
): ChannelScore[] {
  return breakdown.map((row) => ({
    channel: row.channel as PerspectiveChannel,
    assessorCount: row.assessor_count,
    rawScore: row.raw_score,
    weight: row.weight,
    weightedScore: row.weighted_score,
  }));
}

export function applyAnonymityThreshold(
  channels: ChannelScore[],
  threshold = DEFAULT_ANONYMITY_THRESHOLD,
): AnonymityView {
  const visible: ChannelScore[] = [];
  const hidden: ChannelScore[] = [];

  for (const channel of channels) {
    const needsThreshold = ANONYMOUS_CHANNELS.includes(channel.channel);
    if (needsThreshold && channel.assessorCount < threshold) {
      hidden.push(channel);
    } else {
      visible.push(channel);
    }
  }

  if (hidden.length === 0) {
    return { visible, combinedOthers: null, hiddenChannels: [] };
  }

  const totalWeight = hidden.reduce((sum, item) => sum + item.weight, 0);
  const totalAssessors = hidden.reduce((sum, item) => sum + item.assessorCount, 0);
  const rawScore =
    hidden.reduce((sum, item) => sum + item.rawScore * item.assessorCount, 0) / Math.max(totalAssessors, 1);
  const weightedScore = hidden.reduce((sum, item) => sum + item.weightedScore, 0);

  return {
    visible,
    combinedOthers: {
      channel: "others",
      assessorCount: totalAssessors,
      rawScore: Number(rawScore.toFixed(2)),
      weight: totalWeight,
      weightedScore: Number(weightedScore.toFixed(2)),
    },
    hiddenChannels: hidden.map((item) => item.channel),
  };
}
