# MVP Plan

## Vision del producto

Crear una web app ligera y mantenible para que una otorrinolaringologa y su asistente gestionen agenda, pacientes, servicios y reservas con una experiencia clara y segura.

## Problema que resuelve

- Las reservas y la agenda suelen manejarse por mensajes y hojas dispersas.
- Eso produce choques de horario, poca trazabilidad y baja visibilidad operativa.
- El MVP centraliza la operacion administrativa sin entrar aun en historia clinica completa.

## Usuarios y roles

- `admin_doctor`: configura servicios, disponibilidad, asistentes y supervisa toda la operacion.
- `assistant`: gestiona pacientes y citas dentro de permisos acotados.
- `patient_future`: rol reservado para futuras experiencias autenticadas del paciente.
- `public_booking_user`: visitante anonimo que solicita cita desde `/book`.

## Alcance MVP

- Dashboard administrativo con metricas del dia y agenda de hoy.
- Gestion administrativa basica de pacientes.
- Catalogo de servicios medicos.
- Gestion de citas y cambio de estados.
- Disponibilidad base de la doctora y bloqueos horarios.
- Reserva publica controlada con datos minimos.
- Autenticacion base y permisos por rol.

## Fuera de alcance

- Historia clinica completa.
- Diagnosticos sensibles.
- Facturacion avanzada.
- Integraciones con seguros, laboratorio o WhatsApp.
- Multi-tenant productivo completo.

## Flujos principales

### Doctora administradora

1. Inicia sesion.
2. Revisa dashboard.
3. Consulta agenda del dia.
4. Gestiona servicios, disponibilidad y asistentes.
5. Supervisa estados de citas y eventos urgentes.

### Asistente

1. Inicia sesion.
2. Busca o registra paciente.
3. Crea o ajusta cita.
4. Cambia estados operativos segun permisos.
5. No accede a configuraciones criticas.

### Reserva publica

1. Visitante abre `/book`.
2. Selecciona servicio.
3. Ingresa datos basicos.
4. Solicita franja disponible.
5. Recibe confirmacion de solicitud o cita segun politica futura.

## Modulos funcionales

- Auth y roles
- Dashboard
- Pacientes
- Servicios
- Citas
- Disponibilidad
- Reserva publica
- Seguridad y auditoria minima

## Modulos del MVP

- `E1` Arquitectura base
- `E2` Backend y base de datos con Neon
- `E3` Auth y roles
- `E4` Dashboard administrativo
- `E5` Pacientes
- `E6` Citas
- `E7` Agenda y calendario
- `E8` Servicios medicos
- `E9` Disponibilidad
- `E10` Reserva publica
- `E11` Seguridad y privacidad
- `E12` Testing
- `E13` UI/UX responsive
- `E14` Deploy

## Reglas de negocio base

- No existe cita sin paciente.
- No existe cita sin servicio.
- No se agenda fuera del horario disponible.
- No se permite choque contra citas activas.
- `cancelled` no bloquea horario.
- Una cita `completed` requiere permiso admin para cambios posteriores.
- Solo `admin_doctor` gestiona asistentes.

## Riesgos

- Integracion de Better Auth debe alinearse con schema real antes de primera migracion productiva.
- Datos medicos requieren disciplina de minimizacion desde el MVP.
- La reserva publica puede crecer rapido si no se acota bien.

## Roadmap por fases

1. Base de arquitectura, docs y backlog.
2. DB, auth y mocks.
3. Dashboard y agenda diaria.
4. Pacientes y servicios.
5. Citas y disponibilidad.
6. Reserva publica.
7. Hardening, pruebas y deploy.
