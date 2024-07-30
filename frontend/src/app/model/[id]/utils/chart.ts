import { ChartData, ChartOptions } from 'chart.js'

export const getChartData = (timePoints: string[], healthOverTime: number[]): ChartData<'line'> => ({
  labels: timePoints,
  datasets: [
    {
      label: 'Overall Health',
      data: healthOverTime,
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
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
        text: 'Overall Health (%)',
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
