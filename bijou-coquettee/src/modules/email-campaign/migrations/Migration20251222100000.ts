import { Migration } from "@mikro-orm/migrations"

export class Migration20251222100000 extends Migration {
    async up(): Promise<void> {
        // Add banner display columns to email_campaign table
        this.addSql(`
            ALTER TABLE "email_campaign"
            ADD COLUMN IF NOT EXISTS "banner_enabled" BOOLEAN NOT NULL DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS "banner_text" TEXT,
            ADD COLUMN IF NOT EXISTS "banner_cta_text" TEXT,
            ADD COLUMN IF NOT EXISTS "banner_cta_link" TEXT,
            ADD COLUMN IF NOT EXISTS "banner_bg_color" TEXT;
        `)
    }

    async down(): Promise<void> {
        this.addSql(`
            ALTER TABLE "email_campaign"
            DROP COLUMN IF EXISTS "banner_enabled",
            DROP COLUMN IF EXISTS "banner_text",
            DROP COLUMN IF EXISTS "banner_cta_text",
            DROP COLUMN IF EXISTS "banner_cta_link",
            DROP COLUMN IF EXISTS "banner_bg_color";
        `)
    }
}
