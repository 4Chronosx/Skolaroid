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
