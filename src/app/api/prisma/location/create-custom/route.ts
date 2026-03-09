import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { haversineDistance } from '@/lib/utils/map-utils';

const createCustomLocationSchema = z.object({
  buildingName: z.string().trim().min(1).max(200),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  description: z.string().trim().max(500).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = createCustomLocationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error.issues[0]?.message ?? 'Validation failed',
        },
        { status: 400 }
      );
    }

    const { buildingName, latitude, longitude, description } = result.data;

    // Check for duplicate within 10m radius
    const existingLocations = await prisma.location.findMany({
      select: { id: true, latitude: true, longitude: true, buildingName: true },
    });

    for (const loc of existingLocations) {
      const distance = haversineDistance(
        latitude,
        longitude,
        loc.latitude,
        loc.longitude
      );
      if (distance <= 10) {
        // Return existing location if within 10m
        return NextResponse.json({
          success: true,
          message: 'Using existing nearby location',
          data: loc,
          reused: true,
        });
      }
    }

    // Create new location
    const location = await prisma.location.create({
      data: {
        buildingName,
        latitude,
        longitude,
        description: description ?? null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Location created successfully',
      data: location,
      reused: false,
    });
  } catch (err: unknown) {
    // Handle unique constraint violation (race condition)
    if (err instanceof Error && err.message.includes('Unique constraint')) {
      const body = await request.clone().json();
      const existing = await prisma.location.findFirst({
        where: {
          latitude: body.latitude,
          longitude: body.longitude,
        },
      });
      if (existing) {
        return NextResponse.json({
          success: true,
          message: 'Using existing location at these coordinates',
          data: existing,
          reused: true,
        });
      }
    }

    console.error('[POST /api/prisma/location/create-custom]', err);
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to create location. Please try again.',
      },
      { status: 500 }
    );
  }
}
