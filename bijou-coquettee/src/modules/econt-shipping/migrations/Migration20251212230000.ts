import { Migration } from '@mikro-orm/migrations';

export class Migration20251212230000 extends Migration {

  override async up(): Promise<void> {
    // Add enhanced tracking fields to econt_shipment table
    this.addSql(`ALTER TABLE "econt_shipment" ADD COLUMN IF NOT EXISTS "short_status" text NULL;`);
    this.addSql(`ALTER TABLE "econt_shipment" ADD COLUMN IF NOT EXISTS "short_status_en" text NULL;`);
    this.addSql(`ALTER TABLE "econt_shipment" ADD COLUMN IF NOT EXISTS "tracking_events" jsonb NULL;`);
    this.addSql(`ALTER TABLE "econt_shipment" ADD COLUMN IF NOT EXISTS "delivery_attempts" integer NOT NULL DEFAULT 0;`);
    this.addSql(`ALTER TABLE "econt_shipment" ADD COLUMN IF NOT EXISTS "expected_delivery_date" text NULL;`);
    this.addSql(`ALTER TABLE "econt_shipment" ADD COLUMN IF NOT EXISTS "send_time" timestamptz NULL;`);
    this.addSql(`ALTER TABLE "econt_shipment" ADD COLUMN IF NOT EXISTS "delivery_time" timestamptz NULL;`);
    this.addSql(`ALTER TABLE "econt_shipment" ADD COLUMN IF NOT EXISTS "cod_collected_time" timestamptz NULL;`);
    this.addSql(`ALTER TABLE "econt_shipment" ADD COLUMN IF NOT EXISTS "cod_paid_time" timestamptz NULL;`);

    // Create indexes for common queries
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_econt_shipment_status" ON "econt_shipment" (status);`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_econt_shipment_order_id" ON "econt_shipment" (order_id);`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_econt_shipment_waybill" ON "econt_shipment" (waybill_number);`);
  }

  override async down(): Promise<void> {
    this.addSql(`ALTER TABLE "econt_shipment" DROP COLUMN IF EXISTS "short_status";`);
    this.addSql(`ALTER TABLE "econt_shipment" DROP COLUMN IF EXISTS "short_status_en";`);
    this.addSql(`ALTER TABLE "econt_shipment" DROP COLUMN IF EXISTS "tracking_events";`);
    this.addSql(`ALTER TABLE "econt_shipment" DROP COLUMN IF EXISTS "delivery_attempts";`);
    this.addSql(`ALTER TABLE "econt_shipment" DROP COLUMN IF EXISTS "expected_delivery_date";`);
    this.addSql(`ALTER TABLE "econt_shipment" DROP COLUMN IF EXISTS "send_time";`);
    this.addSql(`ALTER TABLE "econt_shipment" DROP COLUMN IF EXISTS "delivery_time";`);
    this.addSql(`ALTER TABLE "econt_shipment" DROP COLUMN IF EXISTS "cod_collected_time";`);
    this.addSql(`ALTER TABLE "econt_shipment" DROP COLUMN IF EXISTS "cod_paid_time";`);

    this.addSql(`DROP INDEX IF EXISTS "IDX_econt_shipment_status";`);
    this.addSql(`DROP INDEX IF EXISTS "IDX_econt_shipment_order_id";`);
    this.addSql(`DROP INDEX IF EXISTS "IDX_econt_shipment_waybill";`);
  }

}
