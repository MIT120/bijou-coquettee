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
      resolve: "./src/modules/carousel-slide",
      options: {},
    },
    {
      resolve: "./src/modules/cms-page",
      options: {},
    },
    {
      resolve: "./src/modules/checkout-promo",
      options: {},
    },
    {
      resolve: "./src/modules/certificate",
      options: {},
    },
    {
      resolve: "./src/modules/announcement-message",
      options: {},
    },
    {
      resolve: "./src/modules/service-highlight",
      options: {},
    },
    {
      resolve: "./src/modules/special-offer",
      options: {},
    },
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-local",
            id: "local",
            options: {
              upload_dir: "static",
              backend_url: process.env.MEDUSA_BACKEND_URL || "http://localhost:9000",
            },
          },
        ],
      },
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
