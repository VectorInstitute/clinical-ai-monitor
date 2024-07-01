import { getColor } from './colorUtils'

export function getChartData(timePoints: string[], healthOverTime: number[]) {
  return {
    labels: timePoints,
    datasets: [
      {
        label: 'Model Health',
        data: healthOverTime,
        borderColor: healthOverTime.map(health => getColor(health)),
        backgroundColor: healthOverTime.map(health => getColor(health)),
        tension: 0.1,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  }
}

export function getChartOptions() {
  return {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Model Health Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Health (%)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
    },
  }
}
