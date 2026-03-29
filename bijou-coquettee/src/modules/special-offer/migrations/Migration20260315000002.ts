import { Migration } from "@mikro-orm/migrations"

export class Migration20260315000002 extends Migration {
    async up(): Promise<void> {
        this.addSql(`
            CREATE TABLE IF NOT EXISTS "special_offer" (
                "id" TEXT NOT NULL,
                "title" TEXT NOT NULL,
                "subtitle" TEXT,
                "description" TEXT,
                "discount_code" TEXT,
                "discount_percent" INTEGER,
                "cta_text" TEXT,
                "cta_link" TEXT,
                "is_active" BOOLEAN NOT NULL DEFAULT FALSE,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "special_offer_pkey" PRIMARY KEY ("id")
            );
        `)

        this.addSql(`
            CREATE INDEX IF NOT EXISTS "IDX_special_offer_active"
            ON "special_offer" ("is_active")
            WHERE "deleted_at" IS NULL;
        `)
    }

    async down(): Promise<void> {
        this.addSql('DROP TABLE IF EXISTS "special_offer" CASCADE;')
    }
}
