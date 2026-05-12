export const spriteForJob = (jobName?: string, variant: 'default' | 'portrait' = 'default') => {
  const key = (jobName || '').toLowerCase();
  const base = `/assets/sprites/${key}`;
  const map: Record<string, string> = {
    novice: `${base}.png`,
    archer: `${base}.png`,
    swordman: `${base}.png`,
    assassin: `${base}.png`,
    mage: `${base}.png`,
    swordsman: `${base}.png`,
  };

  // Prefer explicit map entry
  const defaultPath = map[key] ?? `${base}.png`;

  if (variant === 'portrait') {
    // convention: job_portrait.png
    return `${base}_portrait.png`;
  }

  return defaultPath;
};

export default spriteForJob;
