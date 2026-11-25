export const duration = 60_000;

export function breathAt(elapsed: number) {
  if (elapsed >= duration) return { phase: 'done', seconds: 0, scale: 0 };
  const cycle = elapsed % 8000;
  const inhale = cycle < 4000;
  const progress = inhale ? cycle / 4000 : (8000 - cycle) / 4000;

  return {
    phase: inhale ? 'inhale' : 'exhale',
    seconds: Math.ceil((duration - elapsed) / 1000),
    scale: (1 - Math.cos(Math.PI * progress)) / 2,
  };
}
