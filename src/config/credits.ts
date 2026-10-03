/**
 * Pro credit costs. Must mirror videosow_credit_costs() in videosow.php,
 * which is the authoritative source when running inside WordPress.
 */
export const CREDIT_COSTS = {
  simple: 1,
  transcript: 2,
  advanced: { cheap: 5, balanced: 10, fast: 10, smart: 25, custom: 15 } as Record<string, number>,
};

/** Testing allocation until the subscription billing integration supplies it. */
export const TEST_MONTHLY_CREDITS = 5000;

const MODEL_TIER: Record<string, string> = {
  'google/gemini-2.5-flash-lite': 'cheap',
  'google/gemini-2.5-flash': 'balanced',
  'openai/gpt-5-mini': 'fast',
  'google/gemini-2.5-pro': 'smart',
};

export const advancedCost = (model?: string) =>
  CREDIT_COSTS.advanced[model ? MODEL_TIER[model] || 'custom' : 'balanced'];

export const creditLabel = (n: number, suffix = 'per video') =>
  `${n} credit${n === 1 ? '' : 's'} ${suffix}`;

export type TaskCreditEstimateInput = {
  simpleRuleCount: number;
  fetchTranscript: boolean;
  advancedEnabled: boolean;
  advancedModel?: string;
};

/** Mirrors the per-video charging path in videosow.php. */
export const estimateTaskCredits = ({
  simpleRuleCount,
  fetchTranscript,
  advancedEnabled,
  advancedModel,
}: TaskCreditEstimateInput) => {
  const simple = Math.max(0, simpleRuleCount) * CREDIT_COSTS.simple;
  const transcript = fetchTranscript || advancedEnabled ? CREDIT_COSTS.transcript : 0;
  const advanced = advancedEnabled ? advancedCost(advancedModel) : 0;

  return { simple, transcript, advanced, total: simple + transcript + advanced };
};
