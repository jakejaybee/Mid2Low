# Mid2Low Golf Improvement App

## Overview

Mid2Low is a comprehensive golf improvement application that helps golfers track their performance, manage practice sessions, and connect with external golf services. The app combines AI-powered practice recommendations with GHIN (Golf Handicap and Information Network) integration to provide a complete golf improvement solution.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom golf-themed color palette
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **External APIs**: OpenAI for AI recommendations, GHIN API for handicap data
- **File Upload**: Basic file handling for scorecard screenshots

## Key Components

### Database Schema
The application uses PostgreSQL with the following main tables:
- **users**: User profiles with GHIN integration fields
- **rounds**: Golf round data with detailed statistics
- **practice_resources**: User-managed practice facilities and equipment
- **practice_plans**: AI-generated personalized practice schedules

### Authentication & User Management
- Currently implements a simplified user system (hardcoded to user ID 1 for demo)
- GHIN OAuth 2.0 integration for official handicap data
- Session management ready for implementation

### AI Integration
- OpenAI GPT-4o integration for generating personalized practice plans
- Performance analysis based on recent round data
- Recommendations tailored to handicap level and available resources

### GHIN Integration
- OAuth 2.0 flow for secure GHIN account connection
- Automatic score import from official GHIN records
- Handicap synchronization with official data

## Data Flow

1. **Score Submission**: Users manually enter rounds or import from GHIN
2. **Performance Analysis**: AI analyzes recent rounds to identify weaknesses
3. **Practice Plan Generation**: OpenAI creates personalized improvement plans
4. **Resource Management**: Users track available practice facilities and equipment
5. **Progress Tracking**: Dashboard displays handicap trends and goal progress

## External Dependencies

### Required API Keys
- `OPENAI_API_KEY`: For AI-powered practice recommendations
- `GHIN_CLIENT_ID`: GHIN API client identifier
- `GHIN_CLIENT_SECRET`: GHIN API client secret
- `DATABASE_URL`: PostgreSQL connection string

### Third-Party Services
- **OpenAI**: Practice plan generation and performance analysis
- **GHIN/USGA**: Official handicap and score data
- **Neon Database**: Serverless PostgreSQL hosting

### Development Dependencies
- **Vite**: Frontend build tool and development server
- **Drizzle Kit**: Database migrations and schema management
- **ESBuild**: Backend bundling for production

## Deployment Strategy

### Development
- Vite dev server on port 5000
- Hot module replacement for rapid development
- Automatic database migrations with Drizzle

### Production
- Build process creates optimized frontend bundle
- Backend compiled to ES modules with esbuild
- Designed for deployment on Replit with autoscale target
- Static file serving integrated with Express

### Database Management
- PostgreSQL with connection pooling
- Migrations handled via Drizzle Kit
- Schema definitions in TypeScript for type safety

## Changelog

- June 17, 2025: Transformed from golf round tracking to activity logging system ("Strava for golf")
  - Changed from rounds to three activity categories: Off-course work, On-course play, Practice area
  - Updated navigation from "Submit Round" to "Record Activity" 
  - Added comprehensive activity tracking with time, duration, and comments
  - Updated dashboard to show activity-based statistics and performance metrics
  - Changed "Mental Training" to "Hitting Balls at Home" in off-course activities
- June 15, 2025. Initial setup with full golf improvement platform
- December 15, 2024. Removed GHIN integration and practice plan functionality to focus on core golf tracking (Strava for golf vision)

## User Preferences

Preferred communication style: Simple, everyday language.