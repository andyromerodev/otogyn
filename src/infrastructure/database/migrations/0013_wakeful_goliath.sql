ALTER TABLE "pre_evaluation_forms" ALTER COLUMN "consent_info_truthful" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "pre_evaluation_forms" ALTER COLUMN "consent_understands_not_consultation" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "pre_evaluation_forms" ADD COLUMN "birth_date" timestamp;--> statement-breakpoint
ALTER TABLE "pre_evaluation_forms" ADD COLUMN "residence_city_country" varchar(255);--> statement-breakpoint
ALTER TABLE "pre_evaluation_forms" ADD COLUMN "symptom_duration_text" varchar(255);--> statement-breakpoint
ALTER TABLE "pre_evaluation_forms" ADD COLUMN "medical_history" text;--> statement-breakpoint
ALTER TABLE "pre_evaluation_forms" ADD COLUMN "previous_treatments_and_exams" text;--> statement-breakpoint
ALTER TABLE "pre_evaluation_forms" ADD COLUMN "understands_virtual_conditions" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "pre_evaluation_forms" ADD COLUMN "consent_privacy_policy" boolean DEFAULT false NOT NULL;