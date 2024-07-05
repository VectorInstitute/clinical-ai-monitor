export function rollingMean(data: number[], window: number): number[] {
    const mean = [];
    for (let i = 0; i < data.length - window + 1; i++) {
      const sum = data.slice(i, i + window).reduce((a, b) => a + b, 0);
      mean.push(sum / window);
    }
    return mean;
  }

  export function rollingStd(data: number[], window: number): number[] {
    const std = [];
    for (let i = 0; i < data.length - window + 1; i++) {
      const slice = data.slice(i, i + window);
      const mean = slice.reduce((a, b) => a + b, 0) / window;
      const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / window;
      std.push(Math.sqrt(variance));
    }
    return std;
  }
