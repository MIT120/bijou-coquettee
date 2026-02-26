import { Migration } from "@mikro-orm/migrations"

export class Migration20260226100000 extends Migration {
    async up(): Promise<void> {
        this.addSql(`
            CREATE TABLE IF NOT EXISTS "cms_page" (
                "id" TEXT NOT NULL,
                "slug" TEXT NOT NULL,
                "title" TEXT NOT NULL,
                "seo_title" TEXT,
                "seo_description" TEXT,
                "seo_image" TEXT,
                "is_published" BOOLEAN NOT NULL DEFAULT FALSE,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "cms_page_pkey" PRIMARY KEY ("id")
            );
        `)

        this.addSql(`
            CREATE UNIQUE INDEX IF NOT EXISTS "IDX_cms_page_slug_unique"
            ON "cms_page" ("slug")
            WHERE "deleted_at" IS NULL;
        `)

        this.addSql(`
            CREATE TABLE IF NOT EXISTS "page_section" (
                "id" TEXT NOT NULL,
                "page_slug" TEXT NOT NULL,
                "type" TEXT NOT NULL,
                "content" JSONB NOT NULL DEFAULT '{}',
                "sort_order" INTEGER NOT NULL DEFAULT 0,
                "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "page_section_pkey" PRIMARY KEY ("id")
            );
        `)

        this.addSql(`
            CREATE INDEX IF NOT EXISTS "IDX_page_section_page_slug"
            ON "page_section" ("page_slug")
            WHERE "deleted_at" IS NULL;
        `)

        this.addSql(`
            CREATE INDEX IF NOT EXISTS "IDX_page_section_sort_order"
            ON "page_section" ("sort_order")
            WHERE "deleted_at" IS NULL;
        `)
    }

    async down(): Promise<void> {
        this.addSql('DROP TABLE IF EXISTS "page_section" CASCADE;')
        this.addSql('DROP TABLE IF EXISTS "cms_page" CASCADE;')
    }
}
