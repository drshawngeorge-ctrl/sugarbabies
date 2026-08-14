export function classifyGrowth(pr: { pct: number | null; outOfRange?: boolean } | number | null) {
  if (pr === null) return 'OUTSIDE_RANGE';
  const pct = typeof pr === 'number' ? pr : pr.pct;
  const oor = typeof pr === 'object' && pr !== null ? pr.outOfRange : false;
  if (pct === null || oor) return 'OUTSIDE_RANGE';
  if (pct < 10) return 'SGA';
  if (pct > 90) return 'LGA';
  return 'AGA';
}
