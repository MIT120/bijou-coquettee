import { Migration } from '@mikro-orm/migrations';

export class Migration20251028071812 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "measurement_guide" ("id" text not null, "category" text check ("category" in ('ring', 'necklace', 'bracelet', 'chain')) not null, "title" text not null, "instructions" text not null, "tips" jsonb null, "image_url" text null, "video_url" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "measurement_guide_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_measurement_guide_deleted_at" ON "measurement_guide" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "size_guide" ("id" text not null, "category" text check ("category" in ('ring', 'necklace', 'bracelet', 'chain')) not null, "size_us" text null, "size_uk" text null, "size_eu" text null, "size_asia" text null, "circumference_mm" integer null, "diameter_mm" integer null, "length_cm" integer null, "description" text null, "sort_order" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "size_guide_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_size_guide_deleted_at" ON "size_guide" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "measurement_guide" cascade;`);

    this.addSql(`drop table if exists "size_guide" cascade;`);
  }

}
