# Clean Grant Application Assistant

A simple, focused grant application assistant built with Next.js 14. Helps users create grant applications with voice input and submit them to Make.com workflows.

## Core Philosophy

**User Value First**

- Build features users actually need
- Simplest solution that works
- Working software over perfect code
- Standard patterns over custom solutions

**Anti-Over-Engineering**

- No complex testing infrastructure - add tests as needed
- No branded types or elaborate type systems - use simple interfaces
- No complex build processes - use standard Next.js patterns
- No elaborate state management - use React state and Supabase

## Features

**MVP Focus**

- 🔐 **Authentication**: OAuth (Google) with Supabase and MVP access control
- 📝 **Grant Applications**: Multi-step form with auto-save functionality
- 🎤 **Voice Recording**: Record answers and get transcriptions via OpenAI Whisper
- 📄 **File Upload**: PDF financial statements with basic validation
- 🔗 **Make.com Integration**: Submit applications to existing workflow
- 🌙 **Basic UI**: Clean, responsive interface with dark/light theme
- ♿ **Accessibility**: Basic WCAG compliance with keyboard navigation

## Tech Stack

**Core Technologies**

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Authentication**: Supabase Auth with OAuth (Google only for MVP)
- **Voice**: OpenAI Whisper API for transcription

**Development Tools**

- **Code Quality**: ESLint + Prettier + Husky pre-commit hooks
- **Testing**: Standard Jest patterns (add tests as needed)
- **Deployment**: Vercel with GitHub Actions CI/CD

## Success Criteria

**MVP Success**

- Users can register and log in
- Users can create grant applications with all required fields
- Users can record voice answers and see transcriptions
- Users can upload PDF financial statements
- Users can submit applications to Make.com
- Interface is clean and accessible
- App works on mobile and desktop

**Quality Standards**

- TypeScript compilation passes
- ESLint passes with no errors
- App builds successfully
- Core user flows work end-to-end
- Basic accessibility requirements met

## Development

### Quick Start

```bash
pnpm install
pnpm dev
```

### Available Commands

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm format           # Format with Prettier
pnpm type-check       # TypeScript type checking

# Testing (add as needed)
pnpm test             # Run tests
```

### Development Approach

**Keep It Simple**

- Use standard Next.js patterns and conventions
- Leverage Supabase built-in features instead of custom solutions
- Use existing UI libraries (shadcn/ui) instead of building from scratch
- Focus on working features over perfect code

**User-First Development**

- Build features users actually need
- Test with real user workflows
- Prioritize usability over technical perfection
- Get feedback early and iterate

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── ui/                # shadcn/ui components
│   └── [feature]/         # Feature-specific components
├── lib/                   # Shared utilities
├── hooks/                 # Custom React hooks
└── types/                 # TypeScript interfaces
```

**Simple Organization**

- Group by feature, not by technical layer
- Keep related code together
- Use standard Next.js conventions
- Avoid deep nesting

## Make.com Integration

**Simple Webhook Integration**

- Replace Tally form with our UI
- Submit application data to existing Make.com workflow
- Basic retry logic for failed submissions
- Show submission status to users

**What Make.com Handles (No Changes)**

- PDF text extraction
- Voice transcription via OpenAI Whisper
- Website analysis
- Grant document generation
- Google Docs creation
- Email notification

## Implementation Status

### ✅ Phase 0: Foundation (COMPLETED)

- [x] Clean Next.js 14 project setup
- [x] TypeScript configuration
- [x] ESLint/Prettier setup
- [x] Basic shadcn/ui configuration
- [x] Supabase integration setup

### 🚧 Phase 1: Core User Value (In Progress)

- [x] Authentication & User Management
- [ ] Grant Application Form
- [ ] Voice Recording & Transcription
- [ ] Make.com Integration
- [ ] Basic UI & User Experience

### 📋 Phase 2: Polish & Enhancements (Optional)

- [ ] Data Management
- [ ] Performance & Reliability

## Contributing

**Code Standards**

- Follow TypeScript strict mode
- Use ESLint and Prettier configurations
- Write meaningful variable and function names
- Keep functions simple and focused
- Add tests for core functionality as needed

**Quality Gates**

- `pnpm lint` passes
- `pnpm type-check` passes
- `pnpm build` succeeds
- Core user flows work correctly

## License

MIT License - Complete data ownership and control for users.
