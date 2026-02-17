# Easy Scrum

![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Drizzle](https://img.shields.io/badge/Drizzle-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)

A lightweight scrum board for organizing topics, notes, and comments. Built for simplicity.

## Overview

Create scrum sessions, add topics with custom colors, post notes with categories, share with others, and collaborate with comments. No account required - just create a session and start organizing. (sign-in coming soon...)

## Quick Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Install

```bash
npm install
```

### Configure

Create a `.env` file:

```env
DATABASE_URL=postgres://user:password@localhost:5432/easy_scrum
```

### Database

```bash
# Push schema to database
npm run db:push

# (Optional) Seed demo data
npm run db:seed
```

### Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Scripts

| Command             | Description         |
| ------------------- | ------------------- |
| `npm run dev`       | Start dev server    |
| `npm run build`     | Production build    |
| `npm run db:push`   | Push schema to DB   |
| `npm run db:seed`   | Seed demo data      |
| `npm run db:clear`  | Wipe all data       |
| `npm run db:studio` | Open Drizzle Studio |
