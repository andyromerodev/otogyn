CREATE TYPE "public"."consultation_status" AS ENUM('draft', 'completed');--> statement-breakpoint
CREATE TABLE "consultations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"appointment_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"anamnesis_text" text,
	"attachment_keys" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"blood_pressure" varchar(20),
	"heart_rate" integer,
	"respiratory_rate" integer,
	"oxygen_saturation" integer,
	"temperature" numeric(4, 1),
	"additional_exams" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"diagnoses" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"appreciation" text,
	"medications" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"treatment_plan" text,
	"auxiliary_exams" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "consultation_status" DEFAULT 'draft' NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "consultations_appointment_id_unique" UNIQUE("appointment_id")
);
--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "consultations_org_patient_idx" ON "consultations" USING btree ("organization_id","patient_id","created_at");