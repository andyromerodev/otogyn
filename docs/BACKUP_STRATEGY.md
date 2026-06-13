# Backup Strategy

## Neon Time Travel

Neon Time Travel permite volver a un estado anterior de la base dentro de la ventana soportada por el plan. Es util para recuperar datos o revisar estados previos sin depender solo de archivos `.sql`.

## Time Travel vs backup manual

- Time Travel: recuperacion historica manejada por Neon.
- Backup manual: snapshot exportable que puedes mover, auditar y restaurar en otra instancia.

## Cuando hacer backup manual

- Antes de migraciones importantes.
- Antes de cambios fuertes en auth o estructura de datos.
- Antes de poblar datos reales de pacientes.
- Antes de un deploy de alto riesgo.

## Donde guardar backups

- En almacenamiento privado y cifrado.
- Nunca en repositorios publicos.
- Con acceso limitado al equipo autorizado.

## Crear backup con `pg_dump`

```bash
mkdir -p backups
pg_dump "$DATABASE_URL" > backups/backup-$(date +%Y-%m-%d-%H-%M).sql
```

## Restaurar con `psql`

```bash
psql "$DATABASE_URL" < backups/backup-file.sql
```

## Frecuencia recomendada

- Desarrollo: antes de migraciones y cambios estructurales.
- Preproduccion: antes de cada release relevante.
- Produccion con datos reales: backups automaticos diarios y snapshots previos a deploys.

## Recomendacion para datos reales

Antes de usar datos reales de pacientes, migrar a un plan pago de Neon o a un proveedor PostgreSQL con backups automaticos diarios, politicas de retencion y monitoreo suficiente.

## Advertencias

- No guardar backups en repositorios publicos.
- Tratar respaldos como datos personales protegidos.
- Validar periodicamente el proceso de restauracion, no solo el de backup.
