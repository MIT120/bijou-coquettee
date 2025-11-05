import { Migration } from "@mikro-orm/migrations"

export class Migration20251105000000 extends Migration {
    async up(): Promise<void> {
        // Create wishlist table
        this.addSql(`
            CREATE TABLE IF NOT EXISTS "wishlist" (
                "id" TEXT NOT NULL,
                "customer_id" TEXT NOT NULL,
                "is_public" BOOLEAN NOT NULL DEFAULT FALSE,
                "share_token" TEXT,
                "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "wishlist_pkey" PRIMARY KEY ("id")
            );
        `)

        // Create index on customer_id for fast lookups
        this.addSql(`
            CREATE INDEX IF NOT EXISTS "IDX_wishlist_customer_id" 
            ON "wishlist" ("customer_id") 
            WHERE "deleted_at" IS NULL;
        `)

        // Create unique index on share_token
        this.addSql(`
            CREATE UNIQUE INDEX IF NOT EXISTS "IDX_wishlist_share_token" 
            ON "wishlist" ("share_token") 
            WHERE "share_token" IS NOT NULL AND "deleted_at" IS NULL;
        `)

        // Create wishlist_item table
        this.addSql(`
            CREATE TABLE IF NOT EXISTS "wishlist_item" (
                "id" TEXT NOT NULL,
                "wishlist_id" TEXT NOT NULL,
                "product_id" TEXT NOT NULL,
                "variant_id" TEXT,
                "added_at" TIMESTAMP NOT NULL DEFAULT NOW(),
                "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "wishlist_item_pkey" PRIMARY KEY ("id")
            );
        `)

        // Create index on wishlist_id for fast lookups
        this.addSql(`
            CREATE INDEX IF NOT EXISTS "IDX_wishlist_item_wishlist_id" 
            ON "wishlist_item" ("wishlist_id") 
            WHERE "deleted_at" IS NULL;
        `)

        // Create composite index on wishlist_id, product_id, variant_id for duplicate checks
        this.addSql(`
            CREATE INDEX IF NOT EXISTS "IDX_wishlist_item_product" 
            ON "wishlist_item" ("wishlist_id", "product_id", "variant_id") 
            WHERE "deleted_at" IS NULL;
        `)

        // Add foreign key constraint
        this.addSql(`
            ALTER TABLE "wishlist_item" 
            ADD CONSTRAINT "FK_wishlist_item_wishlist" 
            FOREIGN KEY ("wishlist_id") 
            REFERENCES "wishlist" ("id") 
            ON DELETE CASCADE;
        `)
    }

    async down(): Promise<void> {
        // Drop foreign key constraint first
        this.addSql(`
            ALTER TABLE "wishlist_item" 
            DROP CONSTRAINT IF EXISTS "FK_wishlist_item_wishlist";
        `)

        // Drop wishlist_item table
        this.addSql('DROP TABLE IF EXISTS "wishlist_item" CASCADE;')

        // Drop wishlist table
        this.addSql('DROP TABLE IF EXISTS "wishlist" CASCADE;')
    }
}

