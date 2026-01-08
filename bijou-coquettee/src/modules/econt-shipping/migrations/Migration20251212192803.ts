import { Migration } from '@mikro-orm/migrations';

export class Migration20251212192803 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "econt_location" ("id" text not null, "reference_code" text not null, "type" text check ("type" in ('office', 'city', 'street')) not null, "name" text not null, "country_code" text not null default 'bg', "city" text null, "address" text null, "phone" text null, "metadata" jsonb null, "synced_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "econt_location_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_econt_location_deleted_at" ON "econt_location" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "econt_shipment" ("id" text not null, "cart_id" text null, "order_id" text null, "delivery_type" text check ("delivery_type" in ('office', 'address')) not null default 'office', "office_code" text null, "office_name" text null, "address_city" text null, "address_postal_code" text null, "address_line1" text null, "address_line2" text null, "entrance" text null, "floor" text null, "apartment" text null, "neighborhood" text null, "allow_saturday" boolean not null default false, "recipient_first_name" text not null, "recipient_last_name" text not null, "recipient_phone" text not null, "recipient_email" text null, "cod_amount" numeric null, "status" text check ("status" in ('draft', 'ready', 'registered', 'in_transit', 'delivered', 'cancelled', 'error')) not null default 'draft', "waybill_number" text null, "tracking_number" text null, "label_url" text null, "metadata" jsonb null, "raw_request" jsonb null, "raw_response" jsonb null, "last_synced_at" timestamptz null, "raw_cod_amount" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "econt_shipment_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_econt_shipment_deleted_at" ON "econt_shipment" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "econt_location" cascade;`);

    this.addSql(`drop table if exists "econt_shipment" cascade;`);
  }

}
