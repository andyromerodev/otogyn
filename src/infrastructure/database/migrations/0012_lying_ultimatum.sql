CREATE TYPE "public"."inventory_transaction_type" AS ENUM('entry', 'consumption', 'adjustment_in', 'adjustment_out');--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(180) NOT NULL,
	"sku" varchar(80) NOT NULL,
	"barcode" varchar(120),
	"description" text,
	"unit" varchar(40) NOT NULL,
	"minimum_stock" numeric(14, 3) DEFAULT '0' NOT NULL,
	"expiry_alert_days" integer DEFAULT 30 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_items_minimum_stock_check" CHECK ("inventory_items"."minimum_stock" >= 0),
	CONSTRAINT "inventory_items_expiry_alert_days_check" CHECK ("inventory_items"."expiry_alert_days" between 0 and 3650)
);
--> statement-breakpoint
CREATE TABLE "inventory_lots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"supplier_id" uuid,
	"lot_number" varchar(120) NOT NULL,
	"expires_on" date,
	"received_at" timestamp with time zone NOT NULL,
	"unit_cost" numeric(12, 4),
	"current_quantity" numeric(14, 3) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_lots_current_quantity_check" CHECK ("inventory_lots"."current_quantity" >= 0),
	CONSTRAINT "inventory_lots_unit_cost_check" CHECK ("inventory_lots"."unit_cost" is null or "inventory_lots"."unit_cost" >= 0)
);
--> statement-breakpoint
CREATE TABLE "inventory_suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(180) NOT NULL,
	"contact_name" varchar(180),
	"phone" varchar(40),
	"email" varchar(255),
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_transaction_allocations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" uuid NOT NULL,
	"lot_id" uuid NOT NULL,
	"quantity_delta" numeric(14, 3) NOT NULL,
	CONSTRAINT "inventory_allocations_non_zero_check" CHECK ("inventory_transaction_allocations"."quantity_delta" <> 0)
);
--> statement-breakpoint
CREATE TABLE "inventory_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"type" "inventory_transaction_type" NOT NULL,
	"quantity" numeric(14, 3) NOT NULL,
	"appointment_id" uuid,
	"reason" varchar(255),
	"notes" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_transactions_quantity_check" CHECK ("inventory_transactions"."quantity" > 0)
);
--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_lots" ADD CONSTRAINT "inventory_lots_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_lots" ADD CONSTRAINT "inventory_lots_item_id_inventory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_lots" ADD CONSTRAINT "inventory_lots_supplier_id_inventory_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."inventory_suppliers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_suppliers" ADD CONSTRAINT "inventory_suppliers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transaction_allocations" ADD CONSTRAINT "inventory_transaction_allocations_transaction_id_inventory_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."inventory_transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transaction_allocations" ADD CONSTRAINT "inventory_transaction_allocations_lot_id_inventory_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."inventory_lots"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_item_id_inventory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_items_org_sku_idx" ON "inventory_items" USING btree ("organization_id","sku");--> statement-breakpoint
CREATE INDEX "inventory_items_org_active_idx" ON "inventory_items" USING btree ("organization_id","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_lots_org_item_number_idx" ON "inventory_lots" USING btree ("organization_id","item_id","lot_number");--> statement-breakpoint
CREATE INDEX "inventory_lots_org_expiry_idx" ON "inventory_lots" USING btree ("organization_id","expires_on");--> statement-breakpoint
CREATE INDEX "inventory_lots_item_quantity_idx" ON "inventory_lots" USING btree ("item_id","current_quantity");--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_suppliers_org_name_idx" ON "inventory_suppliers" USING btree ("organization_id","name");--> statement-breakpoint
CREATE INDEX "inventory_suppliers_org_active_idx" ON "inventory_suppliers" USING btree ("organization_id","is_active");--> statement-breakpoint
CREATE INDEX "inventory_allocations_transaction_idx" ON "inventory_transaction_allocations" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "inventory_allocations_lot_idx" ON "inventory_transaction_allocations" USING btree ("lot_id");--> statement-breakpoint
CREATE INDEX "inventory_transactions_org_created_idx" ON "inventory_transactions" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "inventory_transactions_item_created_idx" ON "inventory_transactions" USING btree ("item_id","created_at");--> statement-breakpoint
CREATE INDEX "inventory_transactions_appointment_idx" ON "inventory_transactions" USING btree ("appointment_id");