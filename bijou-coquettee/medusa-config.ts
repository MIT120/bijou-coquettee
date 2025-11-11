import { loadEnv, defineConfig } from '@medusajs/framework/utils'

// Load environment variables from .env files (for local development)
// In production (Railway), environment variables are set directly
// and will override any .env file values
const nodeEnv = process.env.NODE_ENV || 'development'
if (nodeEnv !== 'production') {
  loadEnv(nodeEnv, process.cwd())
}

// Validate critical environment variables in production
if (nodeEnv === 'production') {
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL is not set!')
    console.error('Please set DATABASE_URL in Railway environment variables.')
    process.exit(1)
  }
  console.log('✅ DATABASE_URL is set:', process.env.DATABASE_URL ? 'Yes' : 'No')
}

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
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
  ],
})
