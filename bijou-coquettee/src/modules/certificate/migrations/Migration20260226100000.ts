import { Migration } from "@mikro-orm/migrations"

export class Migration20260226100000 extends Migration {
    async up(): Promise<void> {
        this.addSql(`
            CREATE TABLE IF NOT EXISTS "certificate" (
                "id" TEXT NOT NULL,
                "title" TEXT NOT NULL,
                "description" TEXT,
                "image_url" TEXT NOT NULL,
                "link" TEXT,
                "sort_order" INTEGER NOT NULL DEFAULT 0,
                "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "certificate_pkey" PRIMARY KEY ("id")
            );
        `)

        this.addSql(`
            CREATE INDEX IF NOT EXISTS "IDX_certificate_sort_order"
            ON "certificate" ("sort_order")
            WHERE "deleted_at" IS NULL;
        `)

        this.addSql(`
            CREATE INDEX IF NOT EXISTS "IDX_certificate_active"
            ON "certificate" ("is_active")
            WHERE "deleted_at" IS NULL;
        `)
    }

    async down(): Promise<void> {
        this.addSql('DROP TABLE IF EXISTS "certificate" CASCADE;')
    }
}
