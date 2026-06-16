import { GetDashboardSummaryUseCase } from '../../application/use-cases/dashboard/get-dashboard-summary'
import { GetDashboardTodayAppointmentsUseCase } from '../../application/use-cases/dashboard/get-dashboard-today-appointments'
import { HttpDashboardRemoteDataSource } from './remote/http-dashboard-remote-data-source'
import { DashboardManagementRepositoryImpl } from './repositories/dashboard-management-repository-impl'

const dashboardRemoteDataSource = new HttpDashboardRemoteDataSource()
const dashboardRepository = new DashboardManagementRepositoryImpl(dashboardRemoteDataSource)

export const dashboardServiceLocator = {
  getDashboardSummaryUseCase: new GetDashboardSummaryUseCase(dashboardRepository),
  getDashboardTodayAppointmentsUseCase: new GetDashboardTodayAppointmentsUseCase(dashboardRepository),
}
