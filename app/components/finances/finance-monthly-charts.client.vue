<script setup lang="ts">
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  type ChartOptions,
  Filler,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  type TooltipItem,
} from 'chart.js'
import { computed } from 'vue'
import { Bar, Line } from 'vue-chartjs'
import type { FinanceSummaryMonthDto } from '~~/src/application/dto/finance-summary'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarElement,
  BarController,
  Filler,
)

const props = defineProps<{
  series: FinanceSummaryMonthDto[]
}>()

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
})

const lineData = computed(() => ({
  labels: props.series.map((item) => item.monthShortLabel),
  datasets: [
    {
      label: 'Ingresos',
      data: props.series.map((item) => item.income),
      borderColor: '#0f766e',
      backgroundColor: 'rgba(15, 118, 110, 0.16)',
      fill: true,
      borderWidth: 3,
      tension: 0.3,
      pointRadius: 4,
      pointHoverRadius: 5,
      pointBorderWidth: 2,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#0f766e',
    },
    {
      label: 'Gastos',
      data: props.series.map((item) => item.expenses),
      borderColor: '#be123c',
      backgroundColor: 'rgba(190, 18, 60, 0.12)',
      fill: true,
      borderWidth: 2,
      tension: 0.3,
      pointRadius: 3,
      pointHoverRadius: 4,
      pointBorderWidth: 2,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#be123c',
    },
  ],
}))

const balanceData = computed(() => ({
  labels: props.series.map((item) => item.monthShortLabel),
  datasets: [
    {
      label: 'Balance',
      data: props.series.map((item) => item.balance),
      backgroundColor: props.series.map((item) =>
        item.balance >= 0 ? 'rgba(22, 163, 74, 0.72)' : 'rgba(225, 29, 72, 0.72)',
      ),
      borderRadius: 10,
      maxBarThickness: 28,
      categoryPercentage: 0.72,
      barPercentage: 0.82,
    },
  ],
}))

const lineOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        boxWidth: 10,
        padding: 18,
        font: {
          size: 13,
        },
      },
    },
    tooltip: {
      callbacks: {
        label: (context: TooltipItem<'line'>) =>
          `${context.dataset.label ?? 'Monto'}: ${currencyFormatter.format(Number(context.parsed.y ?? 0))}`,
      },
    },
  },
  scales: {
    x: {
      ticks: {
        maxRotation: 45,
        minRotation: 45,
        autoSkip: true,
        maxTicksLimit: 12,
        padding: 6,
        font: {
          size: 12,
        },
      },
      grid: {
        display: false,
      },
      border: {
        display: false,
      },
    },
    y: {
      grace: '8%',
      beginAtZero: true,
      ticks: {
        callback: (value: string | number) => currencyFormatter.format(Number(value)),
        maxTicksLimit: 6,
        padding: 8,
        font: {
          size: 12,
        },
      },
      grid: {
        drawTicks: false,
      },
      border: {
        display: false,
      },
    },
  },
}

const balanceOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context: TooltipItem<'bar'>) =>
          `Balance: ${currencyFormatter.format(Number(context.parsed.y ?? 0))}`,
      },
    },
  },
  scales: {
    x: {
      ticks: {
        maxRotation: 45,
        minRotation: 45,
        autoSkip: true,
        maxTicksLimit: 12,
        padding: 6,
        font: {
          size: 12,
        },
      },
      grid: {
        display: false,
      },
      border: {
        display: false,
      },
    },
    y: {
      grace: '8%',
      beginAtZero: true,
      ticks: {
        callback: (value: string | number) => currencyFormatter.format(Number(value)),
        maxTicksLimit: 6,
        padding: 8,
        font: {
          size: 12,
        },
      },
      grid: {
        drawTicks: false,
      },
      border: {
        display: false,
      },
    },
  },
}
</script>

<template>
  <div class="finance-charts">
    <article class="surface-card finance-chart-card">
      <div class="finance-chart-copy">
        <p class="finance-chart-eyebrow">Tendencia</p>
        <h3 class="finance-chart-title">Ingresos vs gastos</h3>
        <p class="finance-chart-text">Serie de 12 meses para detectar cambios de ritmo y estacionalidad.</p>
      </div>

      <div class="finance-chart-canvas">
        <Line :data="lineData" :options="lineOptions" />
      </div>
    </article>

    <article class="surface-card finance-chart-card">
      <div class="finance-chart-copy">
        <p class="finance-chart-eyebrow">Resultado</p>
        <h3 class="finance-chart-title">Balance mensual</h3>
        <p class="finance-chart-text">Verde indica superávit; rojo indica un mes con más gastos que ingresos.</p>
      </div>

      <div class="finance-chart-canvas">
        <Bar :data="balanceData" :options="balanceOptions" />
      </div>
    </article>
  </div>
</template>

<style scoped>
.finance-charts {
  display: grid;
  gap: 1rem;
}

.finance-chart-card {
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
  overflow: hidden;
  min-width: 0;
}

.finance-chart-copy {
  display: grid;
  gap: 0.35rem;
  min-width: 0;
}

.finance-chart-eyebrow {
  margin: 0;
  color: #0f766e;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.finance-chart-title {
  margin: 0;
  color: #132b2d;
  font-size: 1.1rem;
  font-weight: 800;
}

.finance-chart-text {
  margin: 0;
  color: #6f9a9d;
  font-size: 0.92rem;
}

.finance-chart-canvas {
  min-width: 0;
  height: 360px;
  overflow: hidden;
}

@media (max-width: 960px) {
  .finance-chart-canvas {
    height: 320px;
  }
}

@media (max-width: 640px) {
  .finance-chart-card {
    padding: 1rem;
  }

  .finance-chart-canvas {
    height: 280px;
  }
}
</style>
