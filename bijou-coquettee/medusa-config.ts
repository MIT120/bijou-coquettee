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

// Prepare database URL with SSL configuration
// Check multiple possible environment variable names
let databaseUrl = process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.PGDATABASE ||
  process.env.RAILWAY_DATABASE_URL ||
  ''

// Configure database connection based on provider
if (databaseUrl) {
  try {
    const url = new URL(databaseUrl.replace(/^postgresql:/, 'postgres:'))
    const hostname = url.hostname.toLowerCase()
    const port = url.port || '5432'

    // Detect Supabase pooler (Supavisor) - required for Railway IPv4 compatibility
    const isSupabasePooler = hostname.includes('pooler.supabase.com')
    // Detect Supabase direct connection
    const isSupabaseDirect = hostname.includes('.supabase.co') && !hostname.includes('pooler')
    // Detect Railway PostgreSQL
    const isRailway = nodeEnv === 'production' && (
      hostname.includes('railway') ||
      hostname.includes('railway.app') ||
      process.env.RAILWAY_ENVIRONMENT
    )

    // Build connection parameters
    const params = new URLSearchParams(url.search)

    // Supabase pooler (Supavisor) configuration for Railway
    if (isSupabasePooler) {
      // Ensure SSL is enabled (required for Supabase)
      if (!params.has('sslmode')) {
        params.set('sslmode', 'require')
      }

      // Add connection timeout to prevent hanging
      if (!params.has('connect_timeout')) {
        params.set('connect_timeout', '10')
      }

      // Session mode pooler parameters
      if (port === '5432') {
        // Session mode - supports prepared statements (required for Knex/Medusa)
        console.log('✅ Using Supabase Session Mode pooler (port 5432) - compatible with Medusa')
      } else if (port === '6543') {
        // Transaction mode - does NOT support prepared statements
        console.error('❌ ERROR: Supabase Transaction Mode (port 6543) is not compatible with Medusa!')
        console.error('Please use Session Mode (port 5432) instead.')
        process.exit(1)
      }

      // Update URL with parameters
      url.search = params.toString()
      databaseUrl = url.toString().replace(/^postgres:/, 'postgresql:')

      console.log('🔒 SSL and connection parameters configured for Supabase pooler (Railway compatible)')
    }
    // Supabase direct connection (requires IPv4 add-on or IPv6 support)
    else if (isSupabaseDirect) {
      if (!params.has('sslmode')) {
        params.set('sslmode', 'require')
      }
      url.search = params.toString()
      databaseUrl = url.toString().replace(/^postgres:/, 'postgresql:')
      console.log('🔒 SSL configured for Supabase direct connection')
      console.log('⚠️  Note: Direct connection requires IPv4 add-on or IPv6 support')
    }
    // Railway PostgreSQL
    else if (isRailway) {
      if (!params.has('sslmode')) {
        params.set('sslmode', 'require')
      }
      url.search = params.toString()
      databaseUrl = url.toString().replace(/^postgres:/, 'postgresql:')
      console.log('🔒 SSL configured for Railway PostgreSQL')
    }
  } catch (error) {
    // If URL parsing fails, try to add SSL anyway for production
    if (nodeEnv === 'production' && !databaseUrl.includes('sslmode=')) {
      const separator = databaseUrl.includes('?') ? '&' : '?'
      databaseUrl = `${databaseUrl}${separator}sslmode=require`
      console.log('🔒 SSL mode added to DATABASE_URL (fallback for production)')
    }
  }
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
