import { Migration } from "@mikro-orm/migrations"

export class Migration20260226100000 extends Migration {
    async up(): Promise<void> {
        this.addSql(`
            CREATE TABLE IF NOT EXISTS "checkout_promo" (
                "id" TEXT NOT NULL,
                "product_id" TEXT NOT NULL,
                "variant_id" TEXT NOT NULL,
                "heading" TEXT,
                "description" TEXT,
                "discount_percent" INTEGER,
                "promotion_code" TEXT,
                "promotion_id" TEXT,
                "is_active" BOOLEAN NOT NULL DEFAULT FALSE,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "checkout_promo_pkey" PRIMARY KEY ("id")
            );
        `)

        this.addSql(`
            CREATE INDEX IF NOT EXISTS "IDX_checkout_promo_active"
            ON "checkout_promo" ("is_active")
            WHERE "deleted_at" IS NULL;
        `)
    }

    async down(): Promise<void> {
        this.addSql('DROP TABLE IF EXISTS "checkout_promo" CASCADE;')
    }
}
