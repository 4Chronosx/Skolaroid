# Database Setup & Prisma Migration Guide

This document outlines the required setup and recommended workflow for managing database schema changes using Supabase and Prisma.

---

## Prerequisites

Before working with the database, ensure the following are set up:

1. Environment Variables
   - .env – used for local development
   - .env.production – used for production

2. Required Tools
   - Supabase CLI (installed locally)
   - Docker (required to run Supabase locally)

3. Local Supabase Setup
   - Start the local Supabase instance
   - Copy the local database credentials into .env

4. Production Configuration
   - Place the production database credentials in .env.production

---

## Prisma Migration Workflow

Follow this workflow strictly to avoid production issues.

### 1. Apply Changes Locally First

Whenever you modify or add database schema changes, always create migrations using the local database:

npx prisma migrate dev --name migration-name

This command:

- Updates the local database
- Generates a new migration file
- Keeps Prisma schema and database in sync

---

### 2. Develop and Test Locally

- Use the local database for testing and experimentation
- Verify that all features and queries work as expected
- Do not test directly on the production database

---

### 3. Deploy Migrations to Production

Once all changes are validated locally and ready for release, apply the migrations to production:

pnpm run migrate:prod

This command synchronizes the latest local Prisma migrations with the production database.

---

## Important Notes

- Never edit the production database schema manually
- Always commit migration files to version control
- Production migrations should only be run after local validation
