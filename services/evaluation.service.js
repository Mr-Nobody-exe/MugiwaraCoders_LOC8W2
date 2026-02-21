export const AI_WEIGHTS = {
  innovation: 0.30,
  feasibility: 0.20,
  presentation: 0.20,
  technicalDepth: 0.20,
  impact: 0.10,
};

export const JUDGE_WEIGHTS = {
  innovation: 0.25,
  execution: 0.25,
  presentation: 0.20,
  scalability: 0.15,
  overallImpression: 0.15,
};

export const computeWeightedScore = (scores, weights) =>
  Object.entries(weights).reduce((total, [key, weight]) => {
    return total + (scores[key] || 0) * weight;
  }, 0);

// AI score = 40%, Judge score = 60%
export const computeFinalScore = (aiWeightedScore, judgeWeightedScore) =>
  parseFloat((aiWeightedScore * 0.4 + judgeWeightedScore * 0.6).toFixed(2));