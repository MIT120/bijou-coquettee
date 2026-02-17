import { Migration } from "@mikro-orm/migrations"

export class Migration20260217120000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `ALTER TABLE "invoice" ADD CONSTRAINT "invoice_invoice_number_unique" UNIQUE ("invoice_number");`
    )
  }

  override async down(): Promise<void> {
    this.addSql(
      `ALTER TABLE "invoice" DROP CONSTRAINT IF EXISTS "invoice_invoice_number_unique";`
    )
  }
}
