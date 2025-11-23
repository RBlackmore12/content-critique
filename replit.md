# AI Content Feedback Chatbot

## Overview

This is an AI-powered content feedback application that analyzes messaging content using the CONNECT Method. The application allows users to paste their marketing copy, emails, or social media posts and receive expert feedback on how to improve their messaging by focusing on audience recognition rather than creator-focused content.

The system uses Claude AI (via Replit AI Integrations) to provide detailed, actionable feedback based on six core principles: Recognition vs Emoting, Specificity, Story Ownership, the 40-30-20-10 Formula, Natural Voice vs Performance, and Micro-Moments.

**Status**: Fully functional MVP deployed and tested

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (November 22, 2025)

### Completed Features
- ✅ Clean, centered single-page interface with responsive design
- ✅ Large textarea (min-h-64) with character counter for content input
- ✅ Submit button with proper responsive behavior (full-width mobile, auto-width desktop)
- ✅ Loading state with spinner and "Analyzing..." text during API calls
- ✅ Error handling with toast notifications
- ✅ Feedback display card with formatted AI responses
- ✅ Claude API integration using Replit AI Integrations (no API key required, billed to credits)
- ✅ CONNECT Method principles embedded in AI system prompt
- ✅ End-to-end testing completed successfully

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast hot module replacement
- Wouter for lightweight client-side routing
- Single-page application (SPA) architecture with a simple home page and 404 fallback

**UI Component System**
- Shadcn UI (New York style) with Radix UI primitives for accessible, composable components
- Tailwind CSS for utility-first styling with custom design tokens
- Material Design principles guiding the overall design approach
- Custom theme system with CSS variables for colors, spacing, and typography
- Responsive design with mobile-first approach

**State Management**
- TanStack React Query (v5) for server state management and API caching
- React Hook Form with Zod resolvers for form validation
- Local component state using React hooks

**Design System**
- Typography: System font stack with defined size scales (text-3xl for headings, text-sm for labels, text-base for body)
- Spacing: Consistent use of Tailwind units (4, 6, 8) for vertical rhythm
- Layout: Centered max-width containers (max-w-3xl) optimized for reading
- Component specifications detailed in design_guidelines.md

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API routing
- TypeScript with ESM modules for modern JavaScript features
- Development and production server configurations with different entry points
- Custom logging middleware for request tracking

**API Design**
- RESTful endpoint: POST /api/feedback for content analysis
- Zod schema validation for request/response data
- Centralized error handling with appropriate HTTP status codes
- JSON-based request/response format

**AI Integration**
- Anthropic Claude SDK for natural language processing
- Replit AI Integrations for API key management (billed to Replit credits)
- Detailed system prompt implementing the CONNECT Method framework
- Streaming or single-response architecture for AI-generated feedback

**Development Tooling**
- Vite middleware integration for development with HMR
- Separate dev and production server builds
- Source maps for debugging
- Runtime error overlay for better DX

### Data Storage

**Database Setup**
- Drizzle ORM configured for PostgreSQL
- Neon Database serverless PostgreSQL integration
- Schema-first approach with migrations in ./migrations directory
- Currently minimal storage implementation (MemStorage placeholder)

**Session Management**
- connect-pg-simple for PostgreSQL-backed sessions (configured but not actively used)
- Prepared for future authentication/user session requirements

### External Dependencies

**AI Services**
- Anthropic Claude API via @anthropic-ai/sdk
- Configured to use Replit's AI Integrations (no direct API key required)
- System prompts implement the CONNECT Method coaching framework

**Database Services**
- Neon Database (@neondatabase/serverless) for PostgreSQL hosting
- Serverless-optimized connection pooling
- Environment variable-based configuration (DATABASE_URL)

**UI Libraries**
- Radix UI component primitives (accordion, dialog, dropdown, etc.)
- Lucide React for icon system
- date-fns for date manipulation
- cmdk for command palette patterns
- vaul for drawer components

**Development Tools**
- Drizzle Kit for database migrations and schema management
- ESBuild for production server bundling
- PostCSS with Autoprefixer for CSS processing
- TypeScript compiler for type checking

**Monitoring & Developer Experience**
- Replit-specific plugins (cartographer, dev-banner, runtime-error-modal) for enhanced development experience
- Custom logging system with formatted timestamps
- Request/response logging for API debugging