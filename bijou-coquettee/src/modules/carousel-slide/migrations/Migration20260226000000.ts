import { Migration } from "@mikro-orm/migrations"

export class Migration20260226000000 extends Migration {
    async up(): Promise<void> {
        this.addSql(`
            CREATE TABLE IF NOT EXISTS "carousel_slide" (
                "id" TEXT NOT NULL,
                "title" TEXT NOT NULL,
                "subtitle" TEXT,
                "description" TEXT,
                "image_url" TEXT NOT NULL,
                "cta_text" TEXT,
                "cta_link" TEXT,
                "overlay_color" TEXT,
                "overlay_opacity" INTEGER,
                "sort_order" INTEGER NOT NULL DEFAULT 0,
                "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "carousel_slide_pkey" PRIMARY KEY ("id")
            );
        `)

        this.addSql(`
            CREATE INDEX IF NOT EXISTS "IDX_carousel_slide_sort_order"
            ON "carousel_slide" ("sort_order")
            WHERE "deleted_at" IS NULL;
        `)

        this.addSql(`
            CREATE INDEX IF NOT EXISTS "IDX_carousel_slide_active"
            ON "carousel_slide" ("is_active")
            WHERE "deleted_at" IS NULL;
        `)
    }

    async down(): Promise<void> {
        this.addSql('DROP TABLE IF EXISTS "carousel_slide" CASCADE;')
    }
}
