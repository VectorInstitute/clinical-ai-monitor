import { ChartData, ChartOptions } from 'chart.js'
import { getColor } from './colorUtils'

export const getChartData = (timePoints: string[], healthOverTime: number[]): ChartData<'line'> => ({
  labels: timePoints,
  datasets: [
    {
      label: 'Model Health',
      data: healthOverTime,
      borderColor: healthOverTime.map(getColor),
      backgroundColor: healthOverTime.map(health => `${getColor(health)}40`), // 25% opacity
      tension: 0.1,
      pointRadius: 5,
      pointHoverRadius: 7,
      fill: true,
    },
  ],
})

export const getChartOptions = (): ChartOptions<'line'> => ({
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context) => `Health: ${context.parsed.y.toFixed(1)}%`,
      },
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
      ticks: {
        callback: (value) => `${value}%`,
      },
    },
    x: {
      title: {
        display: true,
        text: 'Date',
      },
    },
  },
})
