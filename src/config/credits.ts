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
