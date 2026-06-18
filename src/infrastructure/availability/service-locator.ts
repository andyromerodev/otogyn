import { ListAvailabilityFrontendUseCase } from '../../application/use-cases/availability/frontend/list-availability'
import { CreateAvailabilityFrontendUseCase } from '../../application/use-cases/availability/frontend/create-availability'
import { UpdateAvailabilityFrontendUseCase } from '../../application/use-cases/availability/frontend/update-availability'
import { ToggleAvailabilityActiveFrontendUseCase } from '../../application/use-cases/availability/frontend/toggle-availability-active'
import { CreateBlockedSlotFrontendUseCase } from '../../application/use-cases/availability/frontend/create-blocked-slot'
import { DeleteBlockedSlotFrontendUseCase } from '../../application/use-cases/availability/frontend/delete-blocked-slot'
import { HttpAvailabilityRemoteDataSource } from './remote/http-availability-remote-data-source'
import { AvailabilityManagementRepositoryImpl } from './repositories/availability-management-repository-impl'

const availabilityRemoteDataSource = new HttpAvailabilityRemoteDataSource()
const availabilityRepository = new AvailabilityManagementRepositoryImpl(availabilityRemoteDataSource)

export const availabilityServiceLocator = {
  listAvailabilityUseCase: new ListAvailabilityFrontendUseCase(availabilityRepository),
  createAvailabilityUseCase: new CreateAvailabilityFrontendUseCase(availabilityRepository),
  updateAvailabilityUseCase: new UpdateAvailabilityFrontendUseCase(availabilityRepository),
  toggleAvailabilityActiveUseCase: new ToggleAvailabilityActiveFrontendUseCase(availabilityRepository),
  createBlockedSlotUseCase: new CreateBlockedSlotFrontendUseCase(availabilityRepository),
  deleteBlockedSlotUseCase: new DeleteBlockedSlotFrontendUseCase(availabilityRepository),
}
