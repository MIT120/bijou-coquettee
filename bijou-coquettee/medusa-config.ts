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
  // Check for Railway PostgreSQL service variables
  // Railway provides these when PostgreSQL service is linked
  const railwayDbUrl = process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.PGDATABASE ||
    process.env.RAILWAY_DATABASE_URL

  if (!railwayDbUrl) {
    console.error('❌ ERROR: DATABASE_URL is not set!')
    console.error('Available environment variables:')
    console.error('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Not set')
    console.error('POSTGRES_URL:', process.env.POSTGRES_URL ? '✅ Set' : '❌ Not set')
    console.error('PGDATABASE:', process.env.PGDATABASE ? '✅ Set' : '❌ Not set')
    console.error('RAILWAY_DATABASE_URL:', process.env.RAILWAY_DATABASE_URL ? '✅ Set' : '❌ Not set')
    console.error('')
    console.error('📝 Railway Setup Instructions:')
    console.error('1. If using Railway PostgreSQL service:')
    console.error('   - Make sure PostgreSQL service is linked to your backend service')
    console.error('   - Railway should auto-provide DATABASE_URL variable')
    console.error('2. If using external database (Supabase, Neon, etc.):')
    console.error('   - Set DATABASE_URL manually in Railway environment variables')
    console.error('   - Format: postgresql://user:password@host:port/database')
    process.exit(1)
  }

  console.log('✅ DATABASE_URL is set:', railwayDbUrl ? 'Yes' : 'No')
  // Log first few characters for debugging (don't log full URL for security)
  if (railwayDbUrl) {
    const urlPreview = railwayDbUrl.substring(0, 30) + '...'
    console.log('📊 DATABASE_URL preview:', railwayDbUrl)
  }
}

// Prepare database URL with SSL configuration for Railway PostgreSQL
// Check multiple possible Railway environment variable names
let databaseUrl = process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.PGDATABASE ||
  process.env.RAILWAY_DATABASE_URL ||
  ''

// For Railway PostgreSQL, ensure SSL is enabled
// Railway PostgreSQL requires SSL connections
if (nodeEnv === 'production' && databaseUrl && !databaseUrl.includes('sslmode=')) {
  // Add SSL mode to connection string if not already present
  const separator = databaseUrl.includes('?') ? '&' : '?'
  databaseUrl = `${databaseUrl}${separator}sslmode=require`
  console.log('🔒 SSL mode added to DATABASE_URL for Railway PostgreSQL')
}

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: databaseUrl,
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
