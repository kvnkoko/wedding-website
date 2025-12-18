# Migration Instructions - Add Plus One Columns

The production database is missing the Plus One columns. You need to add them manually.

## Option 1: Using Vercel CLI (Recommended)

1. Install Vercel CLI if you haven't:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Link your project:
   ```bash
   vercel link
   ```

4. Run the migration SQL:
   ```bash
   # Get your database connection string from Vercel environment variables
   # Then run:
   psql $DATABASE_URL -f add-plus-one-columns.sql
   ```

## Option 2: Using Database Dashboard

If you're using Neon, Supabase, or another managed database:

1. Go to your database dashboard
2. Open the SQL editor
3. Copy and paste the contents of `add-plus-one-columns.sql`
4. Run the SQL script

## Option 3: Using Prisma Migrate

```bash
# This will create a migration and apply it
npx prisma migrate dev --name add_plus_one_columns

# Then push to production
npx prisma migrate deploy
```

## What the Migration Does

The script adds these columns to `rsvp_event_responses`:
- `plus_one` (BOOLEAN, default false)
- `plus_one_name` (TEXT, nullable)
- `plus_one_relation` (TEXT, nullable)
- `updated_at` (TIMESTAMP, default CURRENT_TIMESTAMP)

The script is idempotent - it checks if columns exist before adding them, so it's safe to run multiple times.

