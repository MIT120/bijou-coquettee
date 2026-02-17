import { Migration } from "@mikro-orm/migrations"

export class Migration20260217130000 extends Migration {
  override async up(): Promise<void> {
    // Create invoice_settings table for DB-based settings (fixes #2 & #6)
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "invoice_settings" (
        "id" text NOT NULL,
        "company_name" text NOT NULL DEFAULT '',
        "eik" text NOT NULL DEFAULT '',
        "vat_number" text NOT NULL DEFAULT '',
        "mol" text NOT NULL DEFAULT '',
        "address" text NOT NULL DEFAULT '',
        "city" text NOT NULL DEFAULT '',
        "postal_code" text NOT NULL DEFAULT '',
        "country" text NOT NULL DEFAULT 'Bulgaria',
        "phone" text NOT NULL DEFAULT '',
        "email" text NOT NULL DEFAULT '',
        "bank_name" text NOT NULL DEFAULT '',
        "iban" text NOT NULL DEFAULT '',
        "bic" text NOT NULL DEFAULT '',
        "invoice_number_prefix" text NOT NULL DEFAULT '',
        "next_invoice_number" integer NOT NULL DEFAULT 1,
        "invoice_number_padding" integer NOT NULL DEFAULT 10,
        "default_vat_rate" integer NOT NULL DEFAULT 20,
        "default_currency" text NOT NULL DEFAULT 'EUR',
        "logo_url" text NOT NULL DEFAULT '',
        "footer_note" text NOT NULL DEFAULT '',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz NULL,
        CONSTRAINT "invoice_settings_pkey" PRIMARY KEY ("id")
      );
    `)

    // Add econt_shipment_id column to invoice table (fix #10)
    this.addSql(`
      ALTER TABLE "invoice"
      ADD COLUMN IF NOT EXISTS "econt_shipment_id" text NULL;
    `)
  }

  override async down(): Promise<void> {
    this.addSql(`DROP TABLE IF EXISTS "invoice_settings" CASCADE;`)
    this.addSql(`ALTER TABLE "invoice" DROP COLUMN IF EXISTS "econt_shipment_id";`)
  }
}
