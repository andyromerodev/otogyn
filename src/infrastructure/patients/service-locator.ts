import { CreatePatientUseCase } from '../../application/use-cases/patients/create-patient'
import { GetPatientDetailUseCase } from '../../application/use-cases/patients/get-patient-detail'
import { ListPatientsUseCase } from '../../application/use-cases/patients/list-patients'
import { UpdatePatientUseCase } from '../../application/use-cases/patients/update-patient'
import { HttpPatientRemoteDataSource } from './remote/http-patient-remote-data-source'
import { PatientManagementRepositoryImpl } from './repositories/patient-management-repository-impl'

const patientRemoteDataSource = new HttpPatientRemoteDataSource()
const patientRepository = new PatientManagementRepositoryImpl(patientRemoteDataSource)

export const patientServiceLocator = {
  listPatientsUseCase: new ListPatientsUseCase(patientRepository),
  getPatientDetailUseCase: new GetPatientDetailUseCase(patientRepository),
  createPatientUseCase: new CreatePatientUseCase(patientRepository),
  updatePatientUseCase: new UpdatePatientUseCase(patientRepository),
}
