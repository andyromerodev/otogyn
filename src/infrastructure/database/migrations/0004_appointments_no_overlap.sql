CREATE EXTENSION IF NOT EXISTS btree_gist;
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_no_overlap" EXCLUDE USING gist (
  organization_id WITH =,
  tstzrange(start_at, end_at) WITH &&
) WHERE (status IN ('scheduled', 'confirmed', 'checked_in', 'in_progress'));
