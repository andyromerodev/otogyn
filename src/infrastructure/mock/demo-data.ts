import type { Appointment } from '../../domain/entities/appointment'
import type { BlockedTimeSlot } from '../../domain/entities/blocked-time-slot'
import type { DoctorAvailability } from '../../domain/entities/doctor-availability'
import type { MedicalService } from '../../domain/entities/medical-service'
import type { Organization } from '../../domain/entities/organization'
import type { Patient } from '../../domain/entities/patient'
import type { User } from '../../domain/entities/user'

const today = new Date()
today.setSeconds(0, 0)

const atTodayTime = (hours: number, minutes: number) => {
  const date = new Date(today)
  date.setHours(hours, minutes, 0, 0)
  return date
}

export const demoOrganization: Organization = {
  id: 'org_otogyn_demo',
  name: 'Consulta OtoGyn',
  slug: 'otogyn',
}

export const demoUsers: User[] = [
  {
    id: 'user_doctor_ana',
    email: 'ana.garcia@example.test',
    name: 'Dra. Ana Garcia',
    role: 'admin_doctor',
  },
  {
    id: 'user_assistant_lucia',
    email: 'lucia.assistant@example.test',
    name: 'Lucia Perez',
    role: 'assistant',
  },
]

export const demoPatients: Patient[] = [
  'Carlos Mendoza',
  'Maria Torres',
  'Jose Rodriguez',
  'Laura Sanchez',
  'Diego Lopez',
  'Carmen Vega',
].map((fullName, index) => ({
  id: `patient_${index + 1}`,
  organizationId: demoOrganization.id,
  fullName,
  phone: `99900000${index + 1}`,
  email: `${fullName.toLowerCase().replaceAll(' ', '.')}@example.test`,
  birthDate: null,
  documentId: null,
  administrativeNotes: index % 2 === 0 ? 'Prefiere atencion por la manana.' : null,
  isUrgent: index === 1 || index === 3,
  createdAt: new Date(today),
  updatedAt: new Date(today),
  deletedAt: null,
}))

export const demoServices: MedicalService[] = [
  ['Consulta ORL', 30, 150],
  ['Audiometria', 45, 180],
  ['Lavado de oido', 20, 110],
  ['Control sinusitis', 30, 140],
  ['Seguimiento vertigo', 30, 145],
].map(([name, duration, price], index) => ({
  id: `service_${index + 1}`,
  organizationId: demoOrganization.id,
  name: String(name),
  description: 'Servicio administrativo demo para el MVP.',
  defaultDurationMinutes: Number(duration),
  price: Number(price),
  isActive: true,
  createdAt: new Date(today),
  updatedAt: new Date(today),
}))

export const demoAppointments: Appointment[] = [
  {
    id: 'appointment_1',
    organizationId: demoOrganization.id,
    patientId: 'patient_1',
    serviceId: 'service_1',
    professionalId: 'user_doctor_ana',
    startAt: atTodayTime(9, 0),
    endAt: atTodayTime(9, 30),
    status: 'completed',
    isUrgent: false,
    reason: 'Molestia de garganta',
    notes: null,
    createdBy: 'user_assistant_lucia',
    updatedBy: null,
    createdAt: new Date(today),
    updatedAt: new Date(today),
    cancelledAt: null,
  },
  {
    id: 'appointment_2',
    organizationId: demoOrganization.id,
    patientId: 'patient_2',
    serviceId: 'service_2',
    professionalId: 'user_doctor_ana',
    startAt: atTodayTime(9, 45),
    endAt: atTodayTime(10, 30),
    status: 'in_progress',
    isUrgent: true,
    reason: 'Audiometria de control',
    notes: null,
    createdBy: 'user_assistant_lucia',
    updatedBy: null,
    createdAt: new Date(today),
    updatedAt: new Date(today),
    cancelledAt: null,
  },
  {
    id: 'appointment_3',
    organizationId: demoOrganization.id,
    patientId: 'patient_3',
    serviceId: 'service_3',
    professionalId: 'user_doctor_ana',
    startAt: atTodayTime(11, 0),
    endAt: atTodayTime(11, 20),
    status: 'scheduled',
    isUrgent: false,
    reason: 'Lavado por tapon',
    notes: null,
    createdBy: 'user_assistant_lucia',
    updatedBy: null,
    createdAt: new Date(today),
    updatedAt: new Date(today),
    cancelledAt: null,
  },
  {
    id: 'appointment_4',
    organizationId: demoOrganization.id,
    patientId: 'patient_4',
    serviceId: 'service_4',
    professionalId: 'user_doctor_ana',
    startAt: atTodayTime(12, 0),
    endAt: atTodayTime(12, 30),
    status: 'confirmed',
    isUrgent: false,
    reason: 'Control mensual',
    notes: null,
    createdBy: 'user_assistant_lucia',
    updatedBy: null,
    createdAt: new Date(today),
    updatedAt: new Date(today),
    cancelledAt: null,
  },
  {
    id: 'appointment_5',
    organizationId: demoOrganization.id,
    patientId: 'patient_5',
    serviceId: 'service_5',
    professionalId: 'user_doctor_ana',
    startAt: atTodayTime(15, 0),
    endAt: atTodayTime(15, 30),
    status: 'scheduled',
    isUrgent: false,
    reason: 'Seguimiento de vertigo',
    notes: null,
    createdBy: 'user_assistant_lucia',
    updatedBy: null,
    createdAt: new Date(today),
    updatedAt: new Date(today),
    cancelledAt: null,
  },
  {
    id: 'appointment_6',
    organizationId: demoOrganization.id,
    patientId: 'patient_6',
    serviceId: 'service_1',
    professionalId: 'user_doctor_ana',
    startAt: atTodayTime(16, 0),
    endAt: atTodayTime(16, 30),
    status: 'cancelled',
    isUrgent: false,
    reason: 'Reagendar',
    notes: null,
    createdBy: 'user_assistant_lucia',
    updatedBy: null,
    createdAt: new Date(today),
    updatedAt: new Date(today),
    cancelledAt: new Date(today),
  },
]

export const demoAvailability: DoctorAvailability[] = [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
  id: `availability_${weekday}`,
  organizationId: demoOrganization.id,
  weekday,
  startTime: '09:00',
  endTime: '18:00',
  isActive: true,
}))

export const demoBlockedSlots: BlockedTimeSlot[] = [
  {
    id: 'blocked_1',
    organizationId: demoOrganization.id,
    startsAt: atTodayTime(13, 0),
    endsAt: atTodayTime(14, 0),
    reason: 'Almuerzo',
  },
]
