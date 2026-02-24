import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Client — use DIRECT_URL for seeding (bypasses connection pooler)
// ---------------------------------------------------------------------------

const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Supabase Admin client — requires SERVICE_ROLE_KEY for auth.admin operations.
// For local dev, grab these from `supabase status`.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------
//
// All static IDs use valid RFC 4122 v4 format:
//   xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx
// (version nibble = 4, variant nibble = 8)

const LOCATIONS = [
  {
    id: '10000000-0000-4000-8000-000000000001',
    buildingName: 'Administration Building',
    description: 'Main administrative offices of UP Cebu',
    latitude: 10.322329,
    longitude: 123.898199,
  },
  {
    id: '10000000-0000-4000-8000-000000000002',
    buildingName: 'Library Building',
    description: 'Campus library and study area',
    latitude: 10.321434,
    longitude: 123.897985,
  },
  {
    id: '10000000-0000-4000-8000-000000000003',
    buildingName: 'Oblation Square',
    description: 'Central open area with the Oblation statue',
    latitude: 10.322395,
    longitude: 123.898569,
  },
  {
    id: '10000000-0000-4000-8000-000000000004',
    buildingName: 'Amphitheater/Sunset Garden',
    description: 'Open amphitheater and garden area',
    latitude: 10.323369,
    longitude: 123.897727,
  },
  {
    id: '10000000-0000-4000-8000-000000000005',
    buildingName: 'Science Building',
    description: 'College of Science building',
    latitude: 10.322249,
    longitude: 123.897939,
  },
] as const;

const TAGS = [
  {
    id: '20000000-0000-4000-8000-000000000001',
    name: 'freshman',
    slug: 'freshman',
  },
  {
    id: '20000000-0000-4000-8000-000000000002',
    name: 'batch-2024',
    slug: 'batch-2024',
  },
  {
    id: '20000000-0000-4000-8000-000000000003',
    name: 'tradition',
    slug: 'tradition',
  },
  {
    id: '20000000-0000-4000-8000-000000000004',
    name: 'academics',
    slug: 'academics',
  },
  {
    id: '20000000-0000-4000-8000-000000000005',
    name: 'finals',
    slug: 'finals',
  },
  { id: '20000000-0000-4000-8000-000000000006', name: 'event', slug: 'event' },
  { id: '20000000-0000-4000-8000-000000000007', name: 'music', slug: 'music' },
  {
    id: '20000000-0000-4000-8000-000000000008',
    name: 'night-event',
    slug: 'night-event',
  },
  {
    id: '20000000-0000-4000-8000-000000000009',
    name: 'activism',
    slug: 'activism',
  },
  {
    id: '20000000-0000-4000-8000-000000000010',
    name: 'sunset',
    slug: 'sunset',
  },
  {
    id: '20000000-0000-4000-8000-000000000011',
    name: 'culture',
    slug: 'culture',
  },
] as const;

// A single seed program + batch so the memory FK is satisfied.
// The ProgramBatch id matches MOCK_PROGRAM_BATCH_ID used in AddMemoryModal.
const PROGRAM_ID = '30000000-0000-4000-8000-000000000001';
const BATCH_ID = '40000000-0000-4000-8000-000000000001';
const PROGRAM_BATCH_ID = '50000000-0000-4000-8000-000000000001';
const BATCH_YEAR = 2024;

// Seed user — linked to Supabase Auth. The UUID is assigned at runtime by Supabase.
const SEED_USER = {
  studentId: '2024-00001',
  email: 'seed@skolaroid.dev',
  password: 'Password1234!',
  firstName: 'Seed',
  lastName: 'User',
} as const;

const MEMORIES = [
  // --- Administration Building (3 memories) ---
  {
    id: '60000000-0000-4000-8000-000000000001',
    title: 'Freshman Welcome at the Admin Building',
    description:
      'The first day of classes — batch 2024 gathered at the Admin Building for the traditional photo.',
    mediaURL: null,
    visibility: 'PUBLIC' as const,
    locationId: '10000000-0000-4000-8000-000000000001',
    programBatchId: PROGRAM_BATCH_ID,
    tagSlugs: ['freshman', 'batch-2024'],
  },
  {
    id: '60000000-0000-4000-8000-000000000002',
    title: 'Enrollment Day Rush',
    description:
      'Annual tradition — the long queues and early mornings at the admin office.',
    mediaURL: null,
    visibility: 'PUBLIC' as const,
    locationId: '10000000-0000-4000-8000-000000000001',
    programBatchId: PROGRAM_BATCH_ID,
    tagSlugs: ['tradition'],
  },
  {
    id: '60000000-0000-4000-8000-000000000003',
    title: 'Sunset at the Admin Building',
    description: null,
    mediaURL: null,
    visibility: 'PROGRAM_ONLY' as const,
    locationId: '10000000-0000-4000-8000-000000000001',
    programBatchId: PROGRAM_BATCH_ID,
    tagSlugs: [],
  },
  // --- Library Building (2 memories) ---
  {
    id: '60000000-0000-4000-8000-000000000004',
    title: 'Finals Week Study Session',
    description:
      'The library was packed during finals — every table claimed by 7 AM.',
    mediaURL: null,
    visibility: 'PUBLIC' as const,
    locationId: '10000000-0000-4000-8000-000000000002',
    programBatchId: PROGRAM_BATCH_ID,
    tagSlugs: ['academics', 'finals'],
  },
  {
    id: '60000000-0000-4000-8000-000000000005',
    title: 'Library Book Fair',
    description: 'Annual book fair hosted in the library lobby.',
    mediaURL: null,
    visibility: 'PUBLIC' as const,
    locationId: '10000000-0000-4000-8000-000000000002',
    programBatchId: PROGRAM_BATCH_ID,
    tagSlugs: ['event'],
  },
  // --- Oblation Square (2 memories) ---
  {
    id: '60000000-0000-4000-8000-000000000006',
    title: 'Acoustic Night at Oblation Square',
    description:
      'Student bands played until midnight — one of the best nights on campus.',
    mediaURL: null,
    visibility: 'PUBLIC' as const,
    locationId: '10000000-0000-4000-8000-000000000003',
    programBatchId: PROGRAM_BATCH_ID,
    tagSlugs: ['music', 'night-event'],
  },
  {
    id: '60000000-0000-4000-8000-000000000007',
    title: 'Rally for Academic Freedom',
    description: 'Students gathered at the square for a peaceful rally.',
    mediaURL: null,
    visibility: 'BATCH_ONLY' as const,
    locationId: '10000000-0000-4000-8000-000000000003',
    programBatchId: PROGRAM_BATCH_ID,
    tagSlugs: ['activism'],
  },
  // --- Amphitheater/Sunset Garden (3 memories) ---
  {
    id: '60000000-0000-4000-8000-000000000008',
    title: 'Lantern Parade 2024',
    description:
      'The amphitheater lit up with handmade lanterns — a beautiful sight every December.',
    mediaURL: null,
    visibility: 'PUBLIC' as const,
    locationId: '10000000-0000-4000-8000-000000000004',
    programBatchId: PROGRAM_BATCH_ID,
    tagSlugs: ['tradition', 'event'],
  },
  {
    id: '60000000-0000-4000-8000-000000000009',
    title: 'Sunset Watch with Blockmates',
    description:
      'We sat at the garden steps after a long day of classes and just watched the sun sink into the sea. Nobody wanted to leave.',
    mediaURL: null,
    visibility: 'PUBLIC' as const,
    locationId: '10000000-0000-4000-8000-000000000004',
    programBatchId: PROGRAM_BATCH_ID,
    tagSlugs: ['sunset'],
  },
  {
    id: '60000000-0000-4000-8000-000000000010',
    title: 'Cultural Night at the Amphitheater',
    description:
      'The batch staged a short cultural production — traditional dances, original compositions, and a lot of heart.',
    mediaURL: null,
    visibility: 'BATCH_ONLY' as const,
    locationId: '10000000-0000-4000-8000-000000000004',
    programBatchId: PROGRAM_BATCH_ID,
    tagSlugs: ['event', 'culture'],
  },
  // --- Science Building (0 memories) — intentionally empty ---
] as const;

// ---------------------------------------------------------------------------
// Seed functions
// ---------------------------------------------------------------------------

async function clearAll() {
  console.log('Clearing existing seed data...');
  // Delete in dependency order (children first)
  await prisma.memoryVote.deleteMany();
  await prisma.memory.deleteMany();
  await prisma.user.deleteMany();
  await prisma.programBatch.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.program.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.location.deleteMany();

  // Remove seed auth user if it exists
  const { data: listData } = await supabaseAdmin.auth.admin.listUsers({
    perPage: 1000,
  });
  const existing = listData?.users?.find((u) => u.email === SEED_USER.email);
  if (existing) {
    await supabaseAdmin.auth.admin.deleteUser(existing.id);
    console.log('  ✓ Seed auth user removed');
  }

  console.log('  ✓ Tables cleared');
}

async function seedLocations() {
  console.log('Seeding locations...');
  await prisma.location.createMany({
    data: LOCATIONS.map(
      ({ id, buildingName, description, latitude, longitude }) => ({
        id,
        buildingName,
        description,
        latitude,
        longitude,
      })
    ),
  });
  console.log(`  ✓ ${LOCATIONS.length} locations created`);
}

async function seedTags() {
  console.log('Seeding tags...');
  await prisma.tag.createMany({
    data: TAGS.map(({ id, name, slug }) => ({ id, name, slug })),
  });
  console.log(`  ✓ ${TAGS.length} tags created`);
}

async function seedProgramBatch() {
  console.log('Seeding program / batch / programBatch...');

  await prisma.program.create({
    data: {
      id: PROGRAM_ID,
      name: 'BS Computer Science',
      description: 'Bachelor of Science in Computer Science',
    },
  });

  await prisma.batch.create({
    data: { id: BATCH_ID, year: BATCH_YEAR },
  });

  await prisma.programBatch.create({
    data: { id: PROGRAM_BATCH_ID, programId: PROGRAM_ID, batchId: BATCH_ID },
  });

  console.log('  ✓ Program, Batch, and ProgramBatch created');
}

async function ensureStorageBucket() {
  console.log('Ensuring storage bucket...');
  const { error } = await supabaseAdmin.storage.createBucket('memories', {
    public: true,
    allowedMimeTypes: ['image/*', 'video/*'],
    fileSizeLimit: 52428800, // 50 MB
  });
  // Ignore "already exists" error
  if (error && !error.message.includes('already exists')) {
    throw new Error(`Storage bucket creation failed: ${error.message}`);
  }
  console.log('  ✓ Storage bucket "memories" ready');
}

async function seedUser(): Promise<string> {
  console.log('Seeding user...');

  // Create auth user (email confirmed immediately so sign-in works without verification)
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: SEED_USER.email,
    password: SEED_USER.password,
    email_confirm: true,
  });
  if (error) throw new Error(`Auth user creation failed: ${error.message}`);

  const userId = data.user.id;

  await prisma.user.create({
    data: {
      id: userId,
      studentId: SEED_USER.studentId,
      email: SEED_USER.email,
      firstName: SEED_USER.firstName,
      lastName: SEED_USER.lastName,
      programBatchId: PROGRAM_BATCH_ID,
    },
  });

  console.log(`  ✓ Seed user created: ${SEED_USER.email} (id: ${userId})`);
  return userId;
}

async function seedMemories(creatorId: string) {
  console.log('Seeding memories...');
  for (const mem of MEMORIES) {
    const { tagSlugs, ...fields } = mem;
    await prisma.memory.create({
      data: {
        ...fields,
        creatorId,
        tags:
          tagSlugs.length > 0
            ? { connect: tagSlugs.map((slug) => ({ slug })) }
            : undefined,
      },
    });
  }
  console.log(`  ✓ ${MEMORIES.length} memories created`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('Starting seed...\n');
  await clearAll();
  await ensureStorageBucket();
  await seedLocations();
  await seedTags();
  await seedProgramBatch();
  const userId = await seedUser();
  await seedMemories(userId);
  console.log('\nSeed complete.');
  console.log(`\nSeed credentials:`);
  console.log(`  Email:    ${SEED_USER.email}`);
  console.log(`  Password: ${SEED_USER.password}`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
