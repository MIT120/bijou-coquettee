#!/bin/bash

# 🚀 Bijou Coquettee Deployment Script
# This script helps automate the deployment process
# Run: chmod +x scripts/deploy.sh && ./scripts/deploy.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_step() {
    echo -e "\n${BLUE}📦 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if CLI tools are installed
check_dependencies() {
    print_step "Checking dependencies..."
    
    local missing=0
    
    if ! command -v supabase &> /dev/null; then
        print_error "Supabase CLI not found. Install with: npm install -g supabase"
        missing=1
    fi
    
    if ! command -v railway &> /dev/null; then
        print_error "Railway CLI not found. Install with: npm install -g @railway/cli"
        missing=1
    fi
    
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI not found. Install with: npm install -g vercel"
        missing=1
    fi
    
    if [ $missing -eq 1 ]; then
        print_error "Please install missing dependencies and try again."
        exit 1
    fi
    
    print_success "All CLI tools are installed"
}

# Step 1: Supabase Setup
setup_supabase() {
    print_step "Setting up Supabase database..."
    
    # Check if logged in
    if ! supabase projects list &> /dev/null; then
        print_warning "Please login to Supabase first:"
        supabase login
    fi
    
    read -p "Do you want to create a new Supabase project? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter project name (default: bijou-coquettee): " project_name
        project_name=${project_name:-bijou-coquettee}
        
        print_step "Creating Supabase project: $project_name"
        supabase projects create "$project_name"
        
        read -p "Enter your project reference ID: " project_ref
        supabase link --project-ref "$project_ref"
    else
        read -p "Enter your existing project reference ID: " project_ref
        supabase link --project-ref "$project_ref"
    fi
    
    print_step "Getting database connection string..."
    supabase status
    
    print_success "Supabase setup complete!"
    print_warning "Copy the DATABASE_URL from above and save it for Railway configuration"
}

# Step 2: Railway Backend Setup
setup_railway() {
    print_step "Setting up Railway backend..."
    
    cd bijou-coquettee || exit 1
    
    # Check if logged in
    if ! railway whoami &> /dev/null; then
        print_warning "Please login to Railway first:"
        railway login
    fi
    
    # Initialize if not already
    if [ ! -f "railway.json" ]; then
        print_step "Initializing Railway project..."
        railway init
    fi
    
    print_step "Setting up environment variables..."
    
    read -p "Enter DATABASE_URL: " database_url
    railway variables set DATABASE_URL="$database_url"
    
    # Generate secrets
    jwt_secret=$(openssl rand -base64 32)
    cookie_secret=$(openssl rand -base64 32)
    
    railway variables set JWT_SECRET="$jwt_secret"
    railway variables set COOKIE_SECRET="$cookie_secret"
    railway variables set NODE_ENV="production"
    
    print_warning "CORS URLs will be set after Vercel deployment"
    print_warning "You'll need to update them with your Vercel URL later"
    
    print_step "Deploying to Railway..."
    railway up
    
    backend_url=$(railway domain)
    print_success "Backend deployed! URL: $backend_url"
    print_warning "Save this URL for Vercel configuration: $backend_url"
    
    cd ..
}

# Step 3: Vercel Storefront Setup
setup_vercel() {
    print_step "Setting up Vercel storefront..."
    
    cd bijou-coquettee-storefront || exit 1
    
    # Check if logged in
    if ! vercel whoami &> /dev/null; then
        print_warning "Please login to Vercel first:"
        vercel login
    fi
    
    # Link project
    if [ ! -f ".vercel/project.json" ]; then
        print_step "Linking Vercel project..."
        vercel link
    fi
    
    print_step "Setting up environment variables..."
    
    read -p "Enter BACKEND_URL (from Railway): " backend_url
    vercel env add NEXT_PUBLIC_MEDUSA_BACKEND_URL production <<< "$backend_url"
    vercel env add MEDUSA_BACKEND_URL production <<< "$backend_url"
    vercel env add NEXT_PUBLIC_DEFAULT_REGION production <<< "us"
    
    print_warning "Publishable key will be set after getting it from Medusa admin"
    
    print_step "Deploying to Vercel..."
    vercel --prod
    
    storefront_url=$(vercel inspect --json | jq -r '.urls[0]' 2>/dev/null || echo "Check Vercel dashboard")
    print_success "Storefront deployed! URL: $storefront_url"
    
    cd ..
}

# Step 4: Final Configuration
final_config() {
    print_step "Final configuration..."
    
    cd bijou-coquettee || exit 1
    
    read -p "Enter your Vercel storefront URL: " storefront_url
    
    railway variables set STORE_CORS="$storefront_url"
    railway variables set ADMIN_CORS="$storefront_url"
    railway variables set AUTH_CORS="$storefront_url"
    
    print_step "Redeploying backend with updated CORS..."
    railway up
    
    print_success "Configuration complete!"
    print_warning "Next steps:"
    echo "  1. Access Medusa admin: $(railway domain)/app"
    echo "  2. Create admin account"
    echo "  3. Get publishable key from Settings → API Key Management"
    echo "  4. Update Vercel: vercel env add NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY production"
    
    cd ..
}

# Main menu
main() {
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════╗"
    echo "║  Bijou Coquettee Deployment Helper     ║"
    echo "╚════════════════════════════════════════╝"
    echo -e "${NC}"
    
    check_dependencies
    
    echo ""
    echo "Select deployment step:"
    echo "  1) Setup Supabase database"
    echo "  2) Deploy backend to Railway"
    echo "  3) Deploy storefront to Vercel"
    echo "  4) Final configuration (CORS)"
    echo "  5) Run all steps"
    echo "  6) Exit"
    echo ""
    read -p "Enter choice [1-6]: " choice
    
    case $choice in
        1)
            setup_supabase
            ;;
        2)
            setup_railway
            ;;
        3)
            setup_vercel
            ;;
        4)
            final_config
            ;;
        5)
            setup_supabase
            setup_railway
            setup_vercel
            final_config
            ;;
        6)
            print_success "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
}

# Run main function
main

