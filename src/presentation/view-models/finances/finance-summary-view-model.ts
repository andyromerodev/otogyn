import { computed, ref } from 'vue'
import type { DashboardMetricViewModel } from '~~/src/application/dto/dashboard-management'
import type { FinanceSummaryViewModelDependencies } from './finance-summary-view-model.module'

export type { FinanceSummaryViewModelDependencies } from './finance-summary-view-model.module'

export const formatFinanceCurrency = (amount: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(amount)

const formatPercentage = (value: number | null) =>
  value === null ? 'sin base comparable' : `${Math.abs(value).toFixed(1)}%`

const resolveDeltaTone = (delta: number): DashboardMetricViewModel['tone'] => {
  if (delta > 0) return 'green'
  if (delta < 0) return 'rose'
  return 'amber'
}

const resolveBalanceTone = (balance: number): DashboardMetricViewModel['tone'] => {
  if (balance > 0) return 'teal'
  if (balance < 0) return 'rose'
  return 'amber'
}

const formatDeltaNote = (
  delta: number,
  percentage: number | null,
  previousMonthLabel: string,
) => {
  if (delta === 0) {
    return `Sin variación frente a ${previousMonthLabel}.`
  }

  const direction = delta > 0 ? 'Arriba' : 'Abajo'
  return `${direction} ${formatFinanceCurrency(Math.abs(delta))} vs ${previousMonthLabel} (${formatPercentage(percentage)}).`
}

export const createFinanceSummaryViewModel = (
  dependencies: FinanceSummaryViewModelDependencies,
) => {
  const summary = ref<import('~~/src/application/dto/finance-summary').FinanceSummaryDto | null>(null)
  const loading = ref(false)
  const errorMessage = ref<string | null>(null)

  const metrics = computed<DashboardMetricViewModel[]>(() => {
    if (!summary.value) {
      return []
    }

    return [
      {
        label: 'Ingresos',
        value: formatFinanceCurrency(summary.value.income),
        note: formatDeltaNote(
          summary.value.incomeDelta,
          summary.value.incomeDeltaPercentage,
          summary.value.previousMonthLabel,
        ),
        icon: 'i-heroicons-banknotes',
        tone: 'green',
      },
      {
        label: 'Gastos',
        value: formatFinanceCurrency(summary.value.expenses),
        note: formatDeltaNote(
          summary.value.expensesDelta,
          summary.value.expensesDeltaPercentage,
          summary.value.previousMonthLabel,
        ),
        icon: 'i-heroicons-receipt-percent',
        tone: 'rose',
      },
      {
        label: 'Balance',
        value: formatFinanceCurrency(summary.value.balance),
        note: `Resultado neto de ${summary.value.monthLabel}.`,
        icon: 'i-heroicons-scale',
        tone: resolveBalanceTone(summary.value.balance),
      },
      {
        label: 'Vs mes anterior',
        value: formatFinanceCurrency(summary.value.balanceDelta),
        note: formatDeltaNote(
          summary.value.balanceDelta,
          summary.value.balanceDeltaPercentage,
          summary.value.previousMonthLabel,
        ),
        icon: 'i-heroicons-chart-bar-square',
        tone: resolveDeltaTone(summary.value.balanceDelta),
      },
    ]
  })

  const overviewTitle = computed(() =>
    summary.value ? `${summary.value.monthLabel} en cifras` : 'Panorama mensual',
  )

  const overviewBody = computed(() => {
    if (!summary.value) {
      return 'Consulta la evolución de ingresos y gastos de la clínica en los últimos 12 meses.'
    }

    const balanceDirection =
      summary.value.balanceDelta > 0
        ? 'mejor que'
        : summary.value.balanceDelta < 0
          ? 'por debajo de'
          : 'igual a'

    return `El balance actual es ${formatFinanceCurrency(summary.value.balance)}, ${balanceDirection} ${summary.value.previousMonthLabel}.`
  })

  const hasChartData = computed(() =>
    summary.value
      ? summary.value.series.some((item) => item.income > 0 || item.expenses > 0 || item.balance !== 0)
      : false,
  )

  const loadSummary = async () => {
    loading.value = true
    errorMessage.value = null

    try {
      summary.value = await dependencies.getFinanceSummaryUseCase.execute()
    } catch (error) {
      errorMessage.value =
        error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
          ? error.statusMessage
          : 'No se pudo cargar el dashboard financiero.'
    } finally {
      loading.value = false
    }
  }

  return {
    summary,
    metrics,
    overviewTitle,
    overviewBody,
    hasChartData,
    loading,
    errorMessage,
    loadSummary,
  }
}
