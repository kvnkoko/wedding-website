#!/bin/bash
# Script to set up production database
# Run this after adding DATABASE_URL to Vercel

echo "Setting up production database..."
echo ""
echo "Step 1: Make sure DATABASE_URL is set in Vercel"
echo "Step 2: Pull environment variables from Vercel"
echo ""
echo "Run these commands:"
echo ""
echo "1. Install Vercel CLI (if not already installed):"
echo "   npm i -g vercel"
echo ""
echo "2. Login to Vercel:"
echo "   vercel login"
echo ""
echo "3. Link to your project:"
echo "   vercel link"
echo ""
echo "4. Pull environment variables:"
echo "   vercel env pull .env.local"
echo ""
echo "5. Set up database:"
echo "   npm run db:push"
echo "   npm run db:seed"
echo ""
echo "Or, if you have the DATABASE_URL, you can set it temporarily:"
echo "   export DATABASE_URL='your-cloud-database-url'"
echo "   npm run db:push"
echo "   npm run db:seed"



