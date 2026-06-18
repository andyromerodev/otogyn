# Security And Privacy

## Principios

- Minimizar datos desde el MVP.
- Proteger el acceso por rol en servidor.
- No confiar en el cliente para permisos.
- Diseñar logs y backups como si ya existieran datos sensibles.

## Reglas para proteger datos de pacientes

- Guardar solo datos administrativos minimos.
- No almacenar historia clinica completa.
- No almacenar diagnosticos sensibles.
- No incluir datos personales en logs ni errores serializados.
- Evitar exportaciones amplias sin control de permisos.

## Permisos por rol

### admin_doctor

- Gestiona asistentes, servicios, disponibilidad y configuraciones criticas.
- Puede editar citas completadas.

### assistant

- Puede crear y modificar pacientes y citas.
- No puede gestionar asistentes ni configuraciones criticas.

### patient_future

- Reservado para una fase posterior con acceso restringido a su propia informacion.

## Datos que no deben guardarse en el MVP

- Historia clinica completa.
- Diagnosticos detallados.
- Resultados de laboratorio.
- Imagenes medicas.
- Documentos adjuntos sensibles.

## Logs seguros

- Registrar ids tecnicos, no payloads completos.
- Redactar o eliminar campos sensibles.
- No imprimir `DATABASE_URL`, `AUTH_SECRET` ni cookies de sesion.

## Variables de entorno

- `.env` solo local o en plataforma segura.
- `.env.example` sin secretos.
- Rotar `AUTH_SECRET` antes de cualquier entorno compartido.

## Backups

- Nunca guardar backups en repositorios publicos.
- Restringir acceso a archivos de respaldo.
- Tratar los backups como datos sensibles.

## Riesgos medicos y administrativos

- Una mala asignacion de permisos puede exponer agenda y datos personales.
- Una reserva publica sin controles puede filtrar disponibilidad sensible.
- Errores de estado de cita pueden impactar operacion diaria.

## Que no debe incluir el MVP

- Historia clinica completa.
- Integraciones de mensajeria automatica con datos sensibles.
- Acceso del paciente a informacion de terceros.

## Rutas server-side

- Validar sesion.
- Validar rol.
- Validar organizacion.
- Responder errores sanitizados.
- Aplicar matrices explicitas por endpoint.
  - `POST /api/patients`: `admin_doctor`, `assistant`
  - `POST /api/services`: solo `admin_doctor`

## Matriz de permisos por accion

Fuente de verdad: `src/application/use-cases/auth/authorize-server-action.ts`

| Accion             | admin_doctor | assistant | Endpoints que la requieren |
|--------------------|:---:|:---:|---|
| `session:read`     | ✅ | ✅ | `GET /api/auth/session-context` |
| `dashboard:read`   | ✅ | ✅ | `GET /api/dashboard/summary` |
| `patients:read`    | ✅ | ✅ | `GET /api/patients`, `GET /api/patients/:id` |
| `patients:write`   | ✅ | ✅ | `POST /api/patients`, `PATCH /api/patients/:id` |
| `appointments:read`   | ✅ | ✅ | `GET /api/appointments/today` |
| `appointments:create` | ✅ | ✅ | `POST /api/appointments` |
| `appointments:update` | ✅ | ✅ | `PATCH /api/appointments/:id` |
| `appointments:cancel` | ✅ | ✅ | `POST /api/appointments/:id/cancel` |
| `appointments:status` | ✅ | ✅ | `POST /api/appointments/:id/status` |
| `services:read`    | ✅ | ✅ | `GET /api/services` |
| `services:write`   | ✅ | ❌ | `POST /api/services`, `PATCH /api/services/:id` |
| `assistants:read`  | ✅ | ❌ | `GET /api/assistants` |
| `assistants:write` | ✅ | ❌ | `POST /api/assistants`, `PATCH /api/assistants/:id`, `DELETE /api/assistants/:id`, `/deactivate`, `/reactivate` |
| `availability:read`  | ✅ | ✅ | `GET /api/availability` |
| `availability:write` | ✅ | ❌ | `POST /api/availability`, `PATCH /api/availability/:id`, `POST .../toggle`, `POST .../blocked`, `DELETE .../blocked/:id` |
| `calendar:read`    | ✅ | ✅ | `GET /api/calendar/day`, `GET /api/calendar/week` |

Los endpoints `/api/public/*` no requieren sesion ni rol (flujo de reserva publica).
