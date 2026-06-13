import {
  demoAppointments,
  demoAvailability,
  demoBlockedSlots,
  demoOrganization,
  demoPatients,
  demoServices,
  demoUsers,
} from '../../mock/demo-data'

const payload = {
  organization: demoOrganization,
  users: demoUsers,
  patients: demoPatients,
  services: demoServices,
  appointments: demoAppointments,
  availability: demoAvailability,
  blockedSlots: demoBlockedSlots,
}

console.log(JSON.stringify({ message: 'Demo seed prepared', counts: {
  users: payload.users.length,
  patients: payload.patients.length,
  services: payload.services.length,
  appointments: payload.appointments.length,
} }, null, 2))
