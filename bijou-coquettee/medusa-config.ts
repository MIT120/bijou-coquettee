import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    // Redis URL is required for production to avoid MemoryStore warning
    // Ensure REDIS_URL is set in your DigitalOcean environment variables
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    {
      resolve: "./src/modules/size-guide",
      options: {},
    },
    {
      resolve: "./src/modules/wishlist",
      options: {},
    },
    {
      resolve: "./src/modules/product-comments",
      options: {},
    },
    {
      resolve: "./src/modules/econt-shipping",
      options: {},
    },
    {
      resolve: "./src/modules/email-campaign",
      options: {},
    },
    {
      resolve: "./src/modules/invoice",
      options: {},
    },
    {
      resolve: "@medusajs/medusa/fulfillment",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/fulfillment-manual",
            id: "manual",
          },
          {
            resolve: "./src/modules/econt-fulfillment",
            id: "econt",
          },
        ],
      },
    },
  ],
})
