CREATE TABLE "public_rate_limits" (
	"key" varchar(180) PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"reset_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "public_rate_limits_reset_idx" ON "public_rate_limits" USING btree ("reset_at");