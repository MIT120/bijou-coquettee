import { Migration } from "@mikro-orm/migrations"

export class Migration20260315000001 extends Migration {
    async up(): Promise<void> {
        this.addSql(`
            CREATE TABLE IF NOT EXISTS "service_highlight" (
                "id" TEXT NOT NULL,
                "title" TEXT NOT NULL,
                "description" TEXT,
                "icon_name" TEXT NOT NULL DEFAULT 'shipping',
                "sort_order" INTEGER NOT NULL DEFAULT 0,
                "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "service_highlight_pkey" PRIMARY KEY ("id")
            );
        `)

        this.addSql(`
            CREATE INDEX IF NOT EXISTS "IDX_service_highlight_sort_order"
            ON "service_highlight" ("sort_order")
            WHERE "deleted_at" IS NULL;
        `)

        this.addSql(`
            CREATE INDEX IF NOT EXISTS "IDX_service_highlight_active"
            ON "service_highlight" ("is_active")
            WHERE "deleted_at" IS NULL;
        `)
    }

    async down(): Promise<void> {
        this.addSql('DROP TABLE IF EXISTS "service_highlight" CASCADE;')
    }
}
