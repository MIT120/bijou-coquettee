import { Migration } from '@mikro-orm/migrations';

export class Migration20260212185555 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "invoice" ("id" text not null, "invoice_number" text not null, "invoice_date" timestamptz not null, "order_id" text not null, "seller_company_name" text not null, "seller_eik" text not null, "seller_vat_number" text null, "seller_mol" text not null, "seller_address" text not null, "seller_city" text not null, "seller_postal_code" text not null, "seller_country" text not null default 'Bulgaria', "seller_bank_name" text null, "seller_iban" text null, "seller_bic" text null, "buyer_name" text not null, "buyer_company_name" text null, "buyer_eik" text null, "buyer_vat_number" text null, "buyer_address" text not null, "buyer_city" text not null, "buyer_postal_code" text not null, "buyer_country" text not null default 'Bulgaria', "line_items" jsonb not null, "subtotal" numeric not null, "vat_breakdown" jsonb not null, "total_vat" numeric not null, "total" numeric not null, "currency_code" text not null default 'BGN', "payment_method" text null, "status" text check ("status" in ('draft', 'issued', 'cancelled')) not null default 'draft', "pdf_data" text null, "notes" text null, "prepared_by" text null, "received_by" text null, "cancelled_reason" text null, "metadata" jsonb null, "raw_subtotal" jsonb not null, "raw_total_vat" jsonb not null, "raw_total" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "invoice_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_invoice_deleted_at" ON "invoice" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "invoice" cascade;`);
  }

}
