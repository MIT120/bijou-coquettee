import { Migration } from "@mikro-orm/migrations"

export class Migration20251124090000 extends Migration {
    async up(): Promise<void> {
        this.addSql(`
            CREATE TABLE IF NOT EXISTS "product_comment" (
                "id" TEXT NOT NULL,
                "product_id" TEXT NOT NULL,
                "customer_id" TEXT,
                "author_name" TEXT,
                "author_email" TEXT,
                "content" TEXT NOT NULL,
                "status" TEXT NOT NULL DEFAULT 'approved',
                "is_public" BOOLEAN NOT NULL DEFAULT TRUE,
                "metadata" JSONB,
                "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "product_comment_pkey" PRIMARY KEY ("id")
            );
        `)

        this.addSql(`
            CREATE INDEX IF NOT EXISTS "IDX_product_comment_product_id"
            ON "product_comment" ("product_id")
            WHERE "deleted_at" IS NULL;
        `)

        this.addSql(`
            CREATE INDEX IF NOT EXISTS "IDX_product_comment_status"
            ON "product_comment" ("status")
            WHERE "deleted_at" IS NULL;
        `)
    }

    async down(): Promise<void> {
        this.addSql('DROP TABLE IF EXISTS "product_comment" CASCADE;')
    }
}


