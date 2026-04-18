# AI Website Builder

AI Website Builder is a full-stack application that turns natural language prompts into interactive website prototypes. Users can generate projects with AI, iterate on them through revision prompts, preview the result live, save custom edits, export the generated HTML, and publish selected projects to a public community showcase.

## Highlights

- Prompt-to-website generation powered by OpenAI-compatible APIs
- AI-assisted revisions with conversation history per project
- Version tracking with rollback support
- Live project preview and responsive device modes
- Manual code saving and HTML export
- Publish and unpublish controls for community sharing
- Authentication with Better Auth
- Credit-based usage model with plan UI

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL with Prisma
- Auth: Better Auth
- AI: OpenAI SDK with OpenRouter-compatible configuration

## Core Workflow

1. A signed-in user submits a project prompt.
2. The backend creates a project record and starts AI generation.
3. The generated HTML is stored as the current project version.
4. Users open the editor to preview, revise, save, export, publish, or roll back their project.

## Project Structure

```text
.
|-- client/   # React + Vite frontend
|-- server/   # Express + Prisma backend
```

## Environment Variables

Create a `server/.env` file with values for:

```env
DATABASE_URL=
AI_API_KEY=
BETTER_AUTH_URL=
BETTER_AUTH_SECRET=
TRUSTED_ORIGINS=http://localhost:5173,http://localhost:3000
NODE_ENV=development
```

Create a `client/.env` file with:

```env
VITE_BASEURL=http://localhost:3000
```

## Local Setup

### 1. Install dependencies

```bash
cd client
npm install
```

```bash
cd server
npm install
```

### 2. Run database migrations

```bash
cd server
npx prisma migrate dev
```

### 3. Start the backend

```bash
cd server
npm run start
```

### 4. Start the frontend

```bash
cd client
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:3000`

## Available Scripts

### Client

- `npm run dev` starts the Vite dev server
- `npm run build` builds the production frontend
- `npm run preview` previews the production frontend locally

### Server

- `npm run start` starts the server with `tsx`
- `npm run server` starts the server with `nodemon`
- `npm run build` compiles the TypeScript backend

## Current Features

- User sign up, sign in, and session-based authentication
- AI generation of single-file website prototypes
- Revision prompts that update existing projects
- Version history storage and rollback
- Project dashboard for managing created work
- Public project publishing and viewing
- Credit tracking in the data model

## In Progress / Planned

- Payment integration for purchasing credits
- Expanded project settings and account management
- More advanced publishing and collaboration features

## Notes

- Generated projects are currently saved as standalone HTML documents.
- The pricing interface is present, but payment processing is not implemented yet.
- AI generation depends on a valid compatible API key and database configuration.

## License

This project is available under the `ISC` license defined in the server package.
