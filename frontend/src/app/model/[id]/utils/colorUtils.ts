export const getColor = (health: number): string => {
  if (health >= 80) return '#38A169' // Green for good health
  if (health >= 60) return '#ECC94B' // Yellow for moderate health
  return '#E53E3E' // Red for poor health
}
