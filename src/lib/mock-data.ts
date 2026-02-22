/**
 * Mock location data for the landmark selector.
 * TODO: Replace with a useLocations() hook that fetches from the API.
 */
export const MOCK_LOCATIONS = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    buildingName: 'Oblation Plaza',
    description: 'Main entrance and iconic landmark',
    latitude: 14.6537,
    longitude: 121.0685,
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    buildingName: 'UP Main Library',
    description: 'Gonzalez Hall — central library',
    latitude: 14.6544,
    longitude: 121.0703,
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    buildingName: 'AS Steps',
    description: 'College of Arts and Sciences amphitheater steps',
    latitude: 14.6539,
    longitude: 121.0711,
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    buildingName: 'Sunken Garden',
    description: 'Open field for events and gatherings',
    latitude: 14.6546,
    longitude: 121.0695,
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    buildingName: 'College of Engineering',
    description: 'Melchor Hall and surrounding buildings',
    latitude: 14.6556,
    longitude: 121.0662,
  },
] as const;

export type MockLocation = (typeof MOCK_LOCATIONS)[number];

/**
 * Mock memory data for landmark memory display.
 * Spread unevenly across locations to test empty/populated states.
 *
 * TODO: Remove mock data once SCRUM-54 database integration is complete.
 * These will be replaced by real Prisma queries in the API routes.
 */
export const MOCK_MEMORIES = [
  // --- Oblation Plaza (3 memories) ---
  {
    id: '10000000-0000-0000-0000-000000000001',
    title: 'Freshman Welcome at Oblation Plaza',
    description:
      'The first day of classes — batch 2024 gathered at the Oblation for the traditional photo.',
    mediaURL: '/temporary_map.png',
    uploadDate: '2024-08-15T08:00:00.000Z',
    visibility: 'PUBLIC' as const,
    isArchived: false,
    deletedAt: null,
    creatorId: null,
    programBatchId: '20000000-0000-0000-0000-000000000001',
    locationId: '00000000-0000-0000-0000-000000000001',
    createdAt: '2024-08-15T08:00:00.000Z',
    updatedAt: '2024-08-15T08:00:00.000Z',
    location: {
      id: '00000000-0000-0000-0000-000000000001',
      buildingName: 'Oblation Plaza',
    },
    tags: [
      {
        id: '30000000-0000-0000-0000-000000000001',
        name: 'freshman',
        slug: 'freshman',
      },
      {
        id: '30000000-0000-0000-0000-000000000002',
        name: 'batch-2024',
        slug: 'batch-2024',
      },
    ],
    _count: { votes: 12 },
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    title: 'Oblation Run 2024',
    description:
      'Annual tradition — the brave ones sprint across the plaza at dawn.',
    mediaURL: '/temporary_map.png',
    uploadDate: '2024-12-01T05:30:00.000Z',
    visibility: 'PUBLIC' as const,
    isArchived: false,
    deletedAt: null,
    creatorId: null,
    programBatchId: '20000000-0000-0000-0000-000000000001',
    locationId: '00000000-0000-0000-0000-000000000001',
    createdAt: '2024-12-01T05:30:00.000Z',
    updatedAt: '2024-12-01T05:30:00.000Z',
    location: {
      id: '00000000-0000-0000-0000-000000000001',
      buildingName: 'Oblation Plaza',
    },
    tags: [
      {
        id: '30000000-0000-0000-0000-000000000003',
        name: 'tradition',
        slug: 'tradition',
      },
    ],
    _count: { votes: 24 },
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    title: 'Sunset at the Oblation',
    description: null,
    mediaURL: '/temporary_map.png',
    uploadDate: '2025-01-10T17:45:00.000Z',
    visibility: 'PROGRAM_ONLY' as const,
    isArchived: false,
    deletedAt: null,
    creatorId: null,
    programBatchId: '20000000-0000-0000-0000-000000000001',
    locationId: '00000000-0000-0000-0000-000000000001',
    createdAt: '2025-01-10T17:45:00.000Z',
    updatedAt: '2025-01-10T17:45:00.000Z',
    location: {
      id: '00000000-0000-0000-0000-000000000001',
      buildingName: 'Oblation Plaza',
    },
    tags: [],
    _count: { votes: 3 },
  },

  // --- UP Main Library (2 memories) ---
  {
    id: '10000000-0000-0000-0000-000000000004',
    title: 'Finals Week Study Session',
    description:
      'The library was packed during finals — every table claimed by 7 AM.',
    mediaURL: '/temporary_map.png',
    uploadDate: '2024-12-15T07:00:00.000Z',
    visibility: 'PUBLIC' as const,
    isArchived: false,
    deletedAt: null,
    creatorId: null,
    programBatchId: '20000000-0000-0000-0000-000000000001',
    locationId: '00000000-0000-0000-0000-000000000002',
    createdAt: '2024-12-15T07:00:00.000Z',
    updatedAt: '2024-12-15T07:00:00.000Z',
    location: {
      id: '00000000-0000-0000-0000-000000000002',
      buildingName: 'UP Main Library',
    },
    tags: [
      {
        id: '30000000-0000-0000-0000-000000000004',
        name: 'academics',
        slug: 'academics',
      },
      {
        id: '30000000-0000-0000-0000-000000000005',
        name: 'finals',
        slug: 'finals',
      },
    ],
    _count: { votes: 8 },
  },
  {
    id: '10000000-0000-0000-0000-000000000005',
    title: 'Library Book Fair',
    description: 'Annual book fair hosted in the Gonzalez Hall lobby.',
    mediaURL: null,
    uploadDate: '2025-02-10T10:00:00.000Z',
    visibility: 'PUBLIC' as const,
    isArchived: false,
    deletedAt: null,
    creatorId: null,
    programBatchId: '20000000-0000-0000-0000-000000000001',
    locationId: '00000000-0000-0000-0000-000000000002',
    createdAt: '2025-02-10T10:00:00.000Z',
    updatedAt: '2025-02-10T10:00:00.000Z',
    location: {
      id: '00000000-0000-0000-0000-000000000002',
      buildingName: 'UP Main Library',
    },
    tags: [
      {
        id: '30000000-0000-0000-0000-000000000006',
        name: 'event',
        slug: 'event',
      },
    ],
    _count: { votes: 6 },
  },

  // --- AS Steps (2 memories) ---
  {
    id: '10000000-0000-0000-0000-000000000006',
    title: 'Acoustic Night at AS Steps',
    description:
      'Student bands played until midnight — one of the best nights on campus.',
    mediaURL: '/temporary_map.png',
    uploadDate: '2024-11-20T19:00:00.000Z',
    visibility: 'PUBLIC' as const,
    isArchived: false,
    deletedAt: null,
    creatorId: null,
    programBatchId: '20000000-0000-0000-0000-000000000001',
    locationId: '00000000-0000-0000-0000-000000000003',
    createdAt: '2024-11-20T19:00:00.000Z',
    updatedAt: '2024-11-20T19:00:00.000Z',
    location: {
      id: '00000000-0000-0000-0000-000000000003',
      buildingName: 'AS Steps',
    },
    tags: [
      {
        id: '30000000-0000-0000-0000-000000000007',
        name: 'music',
        slug: 'music',
      },
      {
        id: '30000000-0000-0000-0000-000000000008',
        name: 'night-event',
        slug: 'night-event',
      },
    ],
    _count: { votes: 15 },
  },
  {
    id: '10000000-0000-0000-0000-000000000007',
    title: 'Protest Rally for Academic Freedom',
    description: 'Students gathered at the steps for a peaceful rally.',
    mediaURL: '/temporary_map.png',
    uploadDate: '2025-01-25T14:00:00.000Z',
    visibility: 'BATCH_ONLY' as const,
    isArchived: false,
    deletedAt: null,
    creatorId: null,
    programBatchId: '20000000-0000-0000-0000-000000000001',
    locationId: '00000000-0000-0000-0000-000000000003',
    createdAt: '2025-01-25T14:00:00.000Z',
    updatedAt: '2025-01-25T14:00:00.000Z',
    location: {
      id: '00000000-0000-0000-0000-000000000003',
      buildingName: 'AS Steps',
    },
    tags: [
      {
        id: '30000000-0000-0000-0000-000000000009',
        name: 'activism',
        slug: 'activism',
      },
    ],
    _count: { votes: 20 },
  },

  // --- Sunken Garden (1 memory) ---
  {
    id: '10000000-0000-0000-0000-000000000008',
    title: 'Lantern Parade 2024',
    description:
      'The entire garden lit up with handmade lanterns — a beautiful sight every December.',
    mediaURL: '/temporary_map.png',
    uploadDate: '2024-12-18T18:00:00.000Z',
    visibility: 'PUBLIC' as const,
    isArchived: false,
    deletedAt: null,
    creatorId: null,
    programBatchId: '20000000-0000-0000-0000-000000000001',
    locationId: '00000000-0000-0000-0000-000000000004',
    createdAt: '2024-12-18T18:00:00.000Z',
    updatedAt: '2024-12-18T18:00:00.000Z',
    location: {
      id: '00000000-0000-0000-0000-000000000004',
      buildingName: 'Sunken Garden',
    },
    tags: [
      {
        id: '30000000-0000-0000-0000-000000000003',
        name: 'tradition',
        slug: 'tradition',
      },
      {
        id: '30000000-0000-0000-0000-000000000006',
        name: 'event',
        slug: 'event',
      },
    ],
    _count: { votes: 31 },
  },

  // --- College of Engineering (0 memories) ---
  // Intentionally empty to test the "no memories" empty state
];

export type MockMemory = (typeof MOCK_MEMORIES)[number];
