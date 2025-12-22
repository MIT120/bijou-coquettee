import { Migration } from "@mikro-orm/migrations"

export class Migration20251222000000 extends Migration {
    async up(): Promise<void> {
        // Create email_campaign table
        this.addSql(`
            CREATE TABLE IF NOT EXISTS "email_campaign" (
                "id" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "code_prefix" TEXT NOT NULL,
                "discount_percent" INTEGER NOT NULL,
                "start_date" TIMESTAMP WITH TIME ZONE NOT NULL,
                "end_date" TIMESTAMP WITH TIME ZONE NOT NULL,
                "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
                "popup_title" TEXT,
                "popup_description" TEXT,
                "max_uses_per_code" INTEGER NOT NULL DEFAULT 1,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "email_campaign_pkey" PRIMARY KEY ("id")
            );
        `)

        // Create index on active campaigns for quick lookup
        this.addSql(`
            CREATE INDEX IF NOT EXISTS "IDX_email_campaign_active"
            ON "email_campaign" ("is_active", "start_date", "end_date")
            WHERE "deleted_at" IS NULL;
        `)

        // Create email_subscription table
        this.addSql(`
            CREATE TABLE IF NOT EXISTS "email_subscription" (
                "id" TEXT NOT NULL,
                "campaign_id" TEXT NOT NULL,
                "email" TEXT NOT NULL,
                "discount_code" TEXT NOT NULL,
                "promotion_id" TEXT,
                "subscribed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "used_at" TIMESTAMP WITH TIME ZONE,
                "usage_count" INTEGER NOT NULL DEFAULT 0,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "email_subscription_pkey" PRIMARY KEY ("id")
            );
        `)

        // Unique index on email per campaign (prevent duplicate subscriptions)
        this.addSql(`
            CREATE UNIQUE INDEX IF NOT EXISTS "IDX_email_subscription_campaign_email"
            ON "email_subscription" ("campaign_id", "email")
            WHERE "deleted_at" IS NULL;
        `)

        // Unique index on discount code (ensure codes are globally unique)
        this.addSql(`
            CREATE UNIQUE INDEX IF NOT EXISTS "IDX_email_subscription_code"
            ON "email_subscription" ("discount_code")
            WHERE "deleted_at" IS NULL;
        `)

        // Index on email for quick lookups
        this.addSql(`
            CREATE INDEX IF NOT EXISTS "IDX_email_subscription_email"
            ON "email_subscription" ("email")
            WHERE "deleted_at" IS NULL;
        `)

        // Foreign key constraint
        this.addSql(`
            ALTER TABLE "email_subscription"
            ADD CONSTRAINT "FK_email_subscription_campaign"
            FOREIGN KEY ("campaign_id")
            REFERENCES "email_campaign" ("id")
            ON DELETE CASCADE;
        `)
    }

    async down(): Promise<void> {
        this.addSql(`
            ALTER TABLE "email_subscription"
            DROP CONSTRAINT IF EXISTS "FK_email_subscription_campaign";
        `)
        this.addSql('DROP TABLE IF EXISTS "email_subscription" CASCADE;')
        this.addSql('DROP TABLE IF EXISTS "email_campaign" CASCADE;')
    }
}