# TutoratRéussite

## Overview

TutoratRéussite is a tutoring booking platform for elementary (grades 1-6) and secondary (grades 1-5) students in Quebec. The application allows parents and students to book private tutoring sessions without requiring user registration. The platform features dynamic pricing based on grade level, session duration, and location (at teacher's location or home), with automated email confirmations and a calendar-based booking system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, using Vite as the build tool and development server.

**UI Component Library**: Shadcn/ui (Radix UI primitives) with custom styling through Tailwind CSS. The design system follows the "new-york" style variant with a soft blue and warm orange color palette inspired by educational platforms like Khan Academy and Duolingo.

**Routing**: Client-side routing implemented with Wouter, providing a lightweight alternative to React Router. Four main routes exist:
- Home (`/`) - Marketing page with value proposition
- Booking (`/reservation`) - Session booking form with calendar
- Packages (`/forfaits`) - Monthly package pricing display
- Contact (`/contact`) - Contact information page

**State Management**: TanStack Query (React Query) for server state management with custom query client configuration. Form state handled by React Hook Form with Zod schema validation.

**Styling Approach**: Utility-first CSS with Tailwind, using CSS custom properties for theming. Design guidelines emphasize clean white backgrounds, soft blues for primary actions, and warm orange accents for CTAs. The system uses consistent spacing units (4, 6, 8, 12, 16) and responsive layouts that collapse to single columns on mobile.

**Key Architectural Decisions**:
- **No Authentication**: Simplified booking flow without user accounts to reduce friction
- **Form Validation**: Client-side validation using Zod schemas that mirror backend validation, providing immediate feedback
- **Calendar Integration**: Date-based slot selection with real-time availability checking
- **Dynamic Pricing**: Client-side price calculation logic that updates in real-time based on form selections

### Backend Architecture

**Framework**: Express.js with TypeScript, running on Node.js.

**API Design**: RESTful API with two main endpoints:
- `GET /api/time-slots` - Returns available booking slots
- `POST /api/bookings` - Creates new booking and triggers confirmation email

**Database ORM**: Drizzle ORM configured for PostgreSQL (@neondatabase/serverless), with schema definitions in TypeScript that generate Zod validators automatically.

**Data Storage Strategy**: Two-layer approach with interface-based design:
- `IStorage` interface defines storage contract
- `MemStorage` class provides in-memory implementation for development
- Database schemas defined for PostgreSQL migration when provisioned

**Schema Design**:
- `bookings` table: Stores student information, session details, pricing, and timestamps
- `time_slots` table: Tracks available time slots with booking status (isBooked flag)

**Validation**: Shared Zod schemas between frontend and backend ensure type safety and consistent validation rules across the stack.

**Email System**: Nodemailer integration for Gmail SMTP, sending HTML-formatted confirmation emails. Gracefully handles missing credentials in development (logs instead of sending).

**Key Architectural Decisions**:
- **Shared Schema**: Single source of truth for data validation in `shared/schema.ts`
- **Middleware Logging**: Custom request/response logging for API endpoints
- **Vite Integration**: Development server proxies API requests through Vite middleware
- **Production Build**: Separate client (Vite) and server (esbuild) builds with static file serving

### External Dependencies

**Database**: PostgreSQL via Neon serverless driver (`@neondatabase/serverless`). Database URL configured through `DATABASE_URL` environment variable.

**Email Service**: Gmail SMTP via Nodemailer, requiring `EMAIL_USER` and `EMAIL_PASS` environment variables. Degrades gracefully when credentials are missing (development mode).

**Third-party Libraries**:
- **UI Components**: Extensive Radix UI primitives (@radix-ui/*) for accessible, unstyled components
- **Styling**: Tailwind CSS with PostCSS, class-variance-authority for component variants
- **Forms**: React Hook Form with @hookform/resolvers for Zod integration
- **Date Handling**: date-fns for date formatting and manipulation (French locale support)
- **Validation**: Zod for runtime type validation and schema generation (drizzle-zod)

**Development Tools**:
- TypeScript for type safety across the stack
- Drizzle Kit for database migrations
- ESBuild for server bundling
- Vite plugins for Replit integration (cartographer, dev-banner, runtime-error-modal)

**Session Management**: Infrastructure exists for connect-pg-simple (PostgreSQL session store), though not currently utilized due to no-authentication architecture.

**Pricing Configuration**: Hardcoded pricing tables in `client/src/lib/pricing.ts` with calculations for:
- Per-session rates by grade level, duration, and location
- Monthly packages with pre-calculated savings
- Promotional discounts (15% family discount, $30 quarterly discount)