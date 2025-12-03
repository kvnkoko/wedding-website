# Wedding Website & RSVP System

A complete, luxury wedding website with a professional RSVP system built with Next.js, TypeScript, TailwindCSS, PostgreSQL, and Prisma.

## Features

- **Public Website**: Elegant, responsive design with pages for home, events, FAQ, and travel information
- **RSVP System**: Personalized invite links that show only events guests are invited to
- **Admin Dashboard**: Complete backend for managing RSVPs, events, and invite links
- **CSV Export**: Export RSVP data filtered by event or status
- **Edit Functionality**: Guests can edit their RSVP using a unique edit token

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Simple cookie-based session (admin)

## Project Structure

```
/
├── app/
│   ├── admin/              # Admin pages (protected)
│   │   ├── login/         # Admin login
│   │   ├── rsvps/         # RSVP management
│   │   ├── events/        # Event management
│   │   └── invite-links/  # Invite link management
│   ├── api/
│   │   ├── admin/         # Admin API routes
│   │   └── rsvp/          # RSVP API routes
│   ├── events/            # Public events page
│   ├── faq/               # FAQ page
│   ├── travel/            # Travel information page
│   ├── rsvp/              # RSVP pages
│   │   └── [slug]/        # Dynamic RSVP form
│   └── page.tsx           # Home page
├── components/            # Shared components
├── lib/                   # Utilities and helpers
│   ├── prisma.ts          # Prisma client
│   ├── auth.ts            # Authentication helpers
│   └── utils.ts           # Utility functions
└── prisma/
    ├── schema.prisma      # Database schema
    └── seed.ts            # Seed script
```

## Installation

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Setup Steps

1. **Clone and install dependencies**

```bash
npm install
```

2. **Set up environment variables**

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/wedding_db?schema=public"
```

Replace with your actual PostgreSQL connection string.

3. **Set up the database**

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (or use migrations)
npm run db:push

# Seed the database with initial data
npm run db:seed
```

4. **Start the development server**

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Database Seed Data

The seed script creates:

- **3 Events**:
  - Civil Signing (Jan 22, 2025) - The Strand Hotel Yangon
  - Mandalay Celebration (Feb 12, 2025) - Mingalar Mandalay Hotel
  - Yangon Reception (Mar 22, 2025) - Lotte Hotel Yangon

- **5 Invite Link Configs**:
  - `civil-signing` - Civil Signing
  - `mandalay-celebration` - Mandalay Celebration
  - `yangon-reception` - Yangon Reception
  - `signing-and-yangon` - Civil Signing + Yangon Reception
  - `mandalay-and-yangon` - Mandalay + Yangon Reception

- **1 Admin User**:
  - Email: `admin@wedding.com`
  - Password: `admin123`

**⚠️ IMPORTANT**: Change the admin password immediately after first login in production!

## Usage

### Public RSVP Links

Guests receive personalized RSVP links in the format:
```
https://yourdomain.com/rsvp/[slug]
```

Example:
- `https://yourdomain.com/rsvp/civil-signing`
- `https://yourdomain.com/rsvp/mandalay-and-yangon`

Each link only shows the events that guest is invited to.

### Admin Access

1. Navigate to `/admin/login`
2. Login with:
   - Email: `admin@wedding.com`
   - Password: `admin123`

### Admin Features

- **Dashboard**: View statistics for each event (YES/NO/MAYBE counts, capacity, plus-ones)
- **RSVPs**: View, search, and filter all RSVPs
- **Events**: Create and edit events
- **Invite Links**: Create and manage invite link configurations
- **CSV Export**: Export RSVP data (filtered or all)

### RSVP Edit Links

After submitting an RSVP, guests receive an edit token. They can edit their RSVP by visiting:
```
https://yourdomain.com/?edit=[token]
```

## Deployment

### Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variable `DATABASE_URL`
4. Deploy

Vercel will automatically run `npm run build` and deploy.

### Render

1. Create a new Web Service
2. Connect your GitHub repository
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Add environment variable `DATABASE_URL`
6. Deploy

### Database Setup

For production, use a managed PostgreSQL service:

- **Vercel Postgres**: Integrated with Vercel
- **Render PostgreSQL**: Integrated with Render
- **Supabase**: Free tier available
- **Neon**: Serverless PostgreSQL
- **Railway**: Easy PostgreSQL setup

After setting up your production database:

1. Update `DATABASE_URL` in your deployment environment
2. Run migrations: `npm run db:push` (or set up CI/CD to run this)
3. Run seed: `npm run db:seed` (only once)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:seed` - Seed database with initial data
- `npm run db:studio` - Open Prisma Studio

## Customization

### Styling

The design uses a custom color palette defined in `tailwind.config.js`:
- `cream`: #FAF8F3
- `beige`: #F5F1E8
- `taupe`: #E8E3D8
- `sage`: #9CAF88
- `charcoal`: #2C2C2C

Fonts:
- Headings: Playfair Display (serif)
- Body: Inter (sans-serif)

### Events

Edit events in the admin panel or modify the seed script to add/change events.

### Invite Links

Create new invite link configurations in the admin panel to control which events each guest sees.

## Security Notes

- Admin authentication uses simple cookie-based sessions. For production, consider implementing:
  - Proper session management (Redis, database sessions)
  - Rate limiting
  - CSRF protection
  - Stronger password requirements
- Change default admin credentials immediately
- Use HTTPS in production
- Keep dependencies updated

## Support

For issues or questions, please check:
- Next.js documentation: https://nextjs.org/docs
- Prisma documentation: https://www.prisma.io/docs
- TailwindCSS documentation: https://tailwindcss.com/docs

## License

This project is private and proprietary.

