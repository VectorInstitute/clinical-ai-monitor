export function getTrend(history: number[]): 'up' | 'down' | 'neutral' {
  if (history.length < 2) return 'neutral';
  const lastTwo = history.slice(-2);
  if (lastTwo[1] > lastTwo[0]) return 'up';
  if (lastTwo[1] < lastTwo[0]) return 'down';
  return 'neutral';
}
