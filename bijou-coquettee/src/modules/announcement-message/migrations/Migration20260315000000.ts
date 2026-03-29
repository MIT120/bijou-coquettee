import { Migration } from "@mikro-orm/migrations"

export class Migration20260315000000 extends Migration {
    async up(): Promise<void> {
        this.addSql(`
            CREATE TABLE IF NOT EXISTS "announcement_message" (
                "id" TEXT NOT NULL,
                "text" TEXT NOT NULL,
                "sort_order" INTEGER NOT NULL DEFAULT 0,
                "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "announcement_message_pkey" PRIMARY KEY ("id")
            );
        `)

        this.addSql(`
            CREATE INDEX IF NOT EXISTS "IDX_announcement_message_sort_order"
            ON "announcement_message" ("sort_order")
            WHERE "deleted_at" IS NULL;
        `)

        this.addSql(`
            CREATE INDEX IF NOT EXISTS "IDX_announcement_message_active"
            ON "announcement_message" ("is_active")
            WHERE "deleted_at" IS NULL;
        `)
    }

    async down(): Promise<void> {
        this.addSql('DROP TABLE IF EXISTS "announcement_message" CASCADE;')
    }
}
