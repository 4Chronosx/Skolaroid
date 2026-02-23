export type LandmarkType = 'buildings' | 'activity' | 'security';

export interface Landmark {
  id: string;
  name: string;
  type: LandmarkType;
  coordinates: [number, number]; // [longitude, latitude]
}

/**
 * UP Cebu campus landmarks with real-world coordinates.
 * Scraped from the UPSEE reference site.
 */
export const LANDMARKS: Landmark[] = [
  {
    id: '1',
    name: 'Administration Building',
    type: 'buildings',
    coordinates: [123.898199, 10.322329],
  },
  {
    id: '2',
    name: 'Science Building',
    type: 'buildings',
    coordinates: [123.897939, 10.322249],
  },
  {
    id: '3',
    name: 'Technology Innovation Center Bldg.',
    type: 'buildings',
    coordinates: [123.897882, 10.321726],
  },
  {
    id: '3a',
    name: 'Cafeteria',
    type: 'buildings',
    coordinates: [123.897946, 10.321814],
  },
  {
    id: '3b',
    name: 'Clinic',
    type: 'buildings',
    coordinates: [123.897962, 10.321684],
  },
  {
    id: '4',
    name: 'Library Building',
    type: 'buildings',
    coordinates: [123.897985, 10.321434],
  },
  {
    id: '5',
    name: 'Residence Halls',
    type: 'buildings',
    coordinates: [123.89759, 10.321825],
  },
  {
    id: '5a',
    name: 'Balay Varangao',
    type: 'buildings',
    coordinates: [123.897562, 10.321921],
  },
  {
    id: '5b',
    name: 'Lalahon Hall',
    type: 'buildings',
    coordinates: [123.897685, 10.321631],
  },
  {
    id: '5c',
    name: 'Liadlaw Hall',
    type: 'buildings',
    coordinates: [123.897555, 10.321638],
  },
  {
    id: '5d',
    name: 'Lihangin Hall',
    type: 'buildings',
    coordinates: [123.897523, 10.322135],
  },
  {
    id: '6',
    name: 'School of Management',
    type: 'buildings',
    coordinates: [123.8978, 10.322611],
  },
  {
    id: '6a',
    name: 'Management Administration',
    type: 'buildings',
    coordinates: [123.897737, 10.32278],
  },
  {
    id: '6b',
    name: 'Management Bldg. 1',
    type: 'buildings',
    coordinates: [123.897771, 10.32311],
  },
  {
    id: '6c',
    name: 'Management Bldg. 2',
    type: 'buildings',
    coordinates: [123.897714, 10.322545],
  },
  {
    id: '7',
    name: 'Undergraduate Building',
    type: 'buildings',
    coordinates: [123.897928, 10.323404],
  },
  {
    id: '8',
    name: 'Arts and Design Workshop Bldg.',
    type: 'buildings',
    coordinates: [123.898273, 10.323521],
  },
  {
    id: '9',
    name: 'Arts and Design Workshop Bldg. 2',
    type: 'buildings',
    coordinates: [123.898096, 10.323937],
  },
  {
    id: '10',
    name: 'Arts and Science Extension Bldg. (ASX)',
    type: 'buildings',
    coordinates: [123.897949, 10.323871],
  },
  {
    id: '11',
    name: 'Arts and Sciences (AS) Bldg.',
    type: 'buildings',
    coordinates: [123.899292, 10.323221],
  },
  {
    id: '11a',
    name: 'AS Conference Hall',
    type: 'buildings',
    coordinates: [123.899462, 10.323281],
  },
  {
    id: '11b',
    name: 'AS East Wing',
    type: 'buildings',
    coordinates: [123.89943, 10.323088],
  },
  {
    id: '11c',
    name: 'AS West Wing',
    type: 'buildings',
    coordinates: [123.899506, 10.323501],
  },
  {
    id: '12',
    name: 'Union Building',
    type: 'buildings',
    coordinates: [123.899779, 10.323402],
  },
  {
    id: '13',
    name: 'Cebu Cultural Center',
    type: 'buildings',
    coordinates: [123.899158, 10.322484],
  },
  {
    id: '14',
    name: 'High School Area',
    type: 'buildings',
    coordinates: [123.899711, 10.321967],
  },
  {
    id: 'A1',
    name: 'Oblation Square',
    type: 'activity',
    coordinates: [123.898569, 10.322395],
  },
  {
    id: 'A2',
    name: 'Admin Cottages',
    type: 'activity',
    coordinates: [123.89824, 10.321963],
  },
  {
    id: 'A3',
    name: 'Malacañang Cottage',
    type: 'activity',
    coordinates: [123.898494, 10.321822],
  },
  {
    id: 'A4',
    name: 'Admin Field',
    type: 'activity',
    coordinates: [123.898449, 10.321591],
  },
  {
    id: 'A5',
    name: 'College Mini Stage',
    type: 'activity',
    coordinates: [123.898634, 10.321482],
  },
  {
    id: 'A6',
    name: 'Undergraduate Cottages',
    type: 'activity',
    coordinates: [123.898161, 10.322744],
  },
  {
    id: 'A7',
    name: 'SOM Basketball Court',
    type: 'activity',
    coordinates: [123.89792, 10.322698],
  },
  {
    id: 'A8',
    name: 'Volleyball Court',
    type: 'activity',
    coordinates: [123.898368, 10.323105],
  },
  {
    id: 'A9',
    name: 'Amphitheater/Sunset Garden',
    type: 'activity',
    coordinates: [123.897727, 10.323369],
  },
  {
    id: 'A10',
    name: 'High School Open Field',
    type: 'activity',
    coordinates: [123.899085, 10.32205],
  },
  {
    id: 'A11',
    name: 'High School Open Court',
    type: 'activity',
    coordinates: [123.899468, 10.321972],
  },
  {
    id: 'A12',
    name: 'High School Covered Court',
    type: 'activity',
    coordinates: [123.899965, 10.321848],
  },
  {
    id: 'A13',
    name: 'Soccer Field',
    type: 'activity',
    coordinates: [123.89982, 10.322717],
  },
  {
    id: 'G1',
    name: 'Entrance Gate Guard House',
    type: 'security',
    coordinates: [123.898713, 10.321827],
  },
  {
    id: 'G2',
    name: 'Exit Gate Guard House',
    type: 'security',
    coordinates: [123.898521, 10.322888],
  },
  {
    id: 'G3',
    name: 'High School Guard House',
    type: 'security',
    coordinates: [123.898842, 10.322043],
  },
  {
    id: 'G4',
    name: 'AS Guard House',
    type: 'security',
    coordinates: [123.898689, 10.322791],
  },
  {
    id: 'P1',
    name: 'COS Bldg. Parking',
    type: 'security',
    coordinates: [123.898083, 10.322275],
  },
  {
    id: 'P2',
    name: 'Canteen Parking',
    type: 'security',
    coordinates: [123.897778, 10.321974],
  },
  {
    id: 'P3',
    name: 'Library Parking',
    type: 'security',
    coordinates: [123.898128, 10.321456],
  },
  {
    id: 'P4',
    name: 'Motorcycle Parking',
    type: 'security',
    coordinates: [123.898424, 10.322876],
  },
  {
    id: 'P5',
    name: 'Undergraduate Bldg. Parking',
    type: 'security',
    coordinates: [123.897979, 10.32356],
  },
  {
    id: 'P6',
    name: 'AS Motorcycle Parking',
    type: 'security',
    coordinates: [123.898972, 10.322907],
  },
  {
    id: 'P7',
    name: 'AS Parking',
    type: 'security',
    coordinates: [123.898907, 10.323085],
  },
];

/** Tailwind background classes per landmark type */
export const LANDMARK_TYPE_COLORS: Record<LandmarkType, string> = {
  buildings: 'bg-blue-600',
  activity: 'bg-emerald-600',
  security: 'bg-amber-600',
};

/** Tailwind hover background classes per landmark type */
export const LANDMARK_TYPE_HOVER_COLORS: Record<LandmarkType, string> = {
  buildings: 'group-hover:bg-blue-500',
  activity: 'group-hover:bg-emerald-500',
  security: 'group-hover:bg-amber-500',
};

/** Human-readable labels per landmark type */
export const LANDMARK_TYPE_LABELS: Record<LandmarkType, string> = {
  buildings: 'Building',
  activity: 'Activity Area',
  security: 'Security / Parking',
};
