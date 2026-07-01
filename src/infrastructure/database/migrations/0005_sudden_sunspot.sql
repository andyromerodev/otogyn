CREATE TYPE "public"."pre_eval_improvement" AS ENUM('yes', 'partial', 'no');--> statement-breakpoint
CREATE TYPE "public"."pre_eval_status" AS ENUM('pending_review', 'reviewed', 'scheduled', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."pre_eval_symptom_duration" AS ENUM('lt_1mo', '1_3mo', '3_12mo', 'gt_1yr');--> statement-breakpoint
CREATE TYPE "public"."pre_eval_symptom_pattern" AS ENUM('constant', 'intermittent', 'worsening');--> statement-breakpoint
CREATE TYPE "public"."pre_eval_yes_no" AS ENUM('yes', 'no');--> statement-breakpoint
CREATE TABLE "pre_evaluation_forms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"patient_id" uuid,
	"full_name" varchar(180) NOT NULL,
	"age" integer,
	"city" varchar(120),
	"phone" varchar(40) NOT NULL,
	"email" varchar(255),
	"main_reasons" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"main_reason_other_text" text,
	"complaint_description" text,
	"symptom_duration" "pre_eval_symptom_duration",
	"symptom_pattern" "pre_eval_symptom_pattern",
	"associated_symptoms" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"aggravating_factors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"has_prior_reflux_diagnosis" "pre_eval_yes_no",
	"has_prior_treatment" "pre_eval_yes_no",
	"prior_medication_used" text,
	"treatment_improvement" "pre_eval_improvement",
	"prior_exams" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"attachment_keys" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"alert_signs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"consultation_expectations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"consent_info_truthful" boolean DEFAULT false NOT NULL,
	"consent_understands_not_consultation" boolean DEFAULT false NOT NULL,
	"status" "pre_eval_status" DEFAULT 'pending_review' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pre_evaluation_forms" ADD CONSTRAINT "pre_evaluation_forms_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pre_evaluation_forms" ADD CONSTRAINT "pre_evaluation_forms_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pre_evaluation_forms_org_created_idx" ON "pre_evaluation_forms" USING btree ("organization_id","created_at");