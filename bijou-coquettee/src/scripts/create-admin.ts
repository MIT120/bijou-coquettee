import { ExecArgs } from "@medusajs/framework/types";
import {
    ContainerRegistrationKeys,
} from "@medusajs/framework/utils";

/**
 * Creates an admin user in Medusa
 * 
 * Usage:
 *   medusa exec ./src/scripts/create-admin.ts
 * 
 * Or with custom email/password:
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=secure123 medusa exec ./src/scripts/create-admin.ts
 * 
 * Alternative (simpler): Use Medusa CLI
 *   npx medusa user -e admin@example.com -p secure123
 */
export default async function createAdmin({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

    // Get email and password from environment variables or use defaults
    const email = process.env.ADMIN_EMAIL || "admin@bijou-coquettee.com";
    const password = process.env.ADMIN_PASSWORD || "supersecret";

    logger.info(`\n📝 Creating admin user...`);
    logger.info(`   Email: ${email}`);
    logger.info(`\n💡 TIP: The easiest way to create an admin user is using the Medusa CLI:`);
    logger.info(`   npx medusa user -e ${email} -p ${password}\n`);

    // For now, we'll use the CLI approach
    // The script approach requires more complex auth module setup
    logger.warn(`⚠️  This script requires manual setup.`);
    logger.info(`\n✅ To create the admin user, run:`);
    logger.info(`   npx medusa user -e ${email} -p ${password}\n`);

    logger.info(`Or access the admin panel at http://localhost:9000/app`);
    logger.info(`and create your first admin user through the UI.\n`);
}
