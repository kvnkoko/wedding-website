#!/bin/bash

# Script to update production database with Photo table
# Usage: ./update-production-db.sh

echo "🔄 Updating production database with Photo table..."
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set"
    echo ""
    echo "Please set it first:"
    echo "  export DATABASE_URL='your-neon-production-url'"
    echo ""
    echo "Or get it from Vercel:"
    echo "  vercel env pull .env.production"
    echo "  export DATABASE_URL=\$(grep DATABASE_URL .env.production | cut -d '=' -f2)"
    exit 1
fi

echo "✅ DATABASE_URL is set"
echo "📦 Running prisma db push..."
echo ""

npx prisma db push --skip-generate

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Success! Photo table has been created in production database."
    echo "🎉 You can now upload photos!"
else
    echo ""
    echo "❌ Error updating database. Please check the error above."
    exit 1
fi






