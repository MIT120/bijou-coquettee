import { Migration } from "@mikro-orm/migrations"

export class Migration20260315100000 extends Migration {
    async up(): Promise<void> {
        this.addSql(`
            ALTER TABLE "carousel_slide"
            ADD COLUMN IF NOT EXISTS "product_handle" TEXT;
        `)
    }

    async down(): Promise<void> {
        this.addSql(`
            ALTER TABLE "carousel_slide"
            DROP COLUMN IF EXISTS "product_handle";
        `)
    }
}
