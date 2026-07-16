export function classifyGrowth(pr: { pct: number } | number) {
  const pct = typeof pr === 'number' ? pr : pr.pct;
  if (pct < 10) return 'SGA';
  if (pct > 90) return 'LGA';
  return 'AGA';
}
