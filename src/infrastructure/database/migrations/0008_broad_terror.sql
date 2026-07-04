CREATE TABLE "treatment_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"diagnosis_code" text,
	"diagnosis_label" text,
	"treatment_plan" text DEFAULT '' NOT NULL,
	"medications" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"auxiliary_exams" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "treatment_templates" ADD CONSTRAINT "treatment_templates_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "treatment_templates_org_diagnosis_idx" ON "treatment_templates" USING btree ("organization_id","diagnosis_code");