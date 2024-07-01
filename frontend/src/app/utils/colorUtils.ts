export function getColor(health: number): string {
    const red = Math.floor(255 * (1 - health / 100))
    const green = Math.floor(255 * (health / 100))
    return `rgb(${red}, ${green}, 0)`
  }
