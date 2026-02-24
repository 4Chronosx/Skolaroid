import { z } from 'zod';
import { slugify } from '@/lib/slugify';
import { prisma } from '@/lib/prisma';
import { createMemoryServerSchema } from '@/lib/schemas';

type CreateMemoryInput = z.infer<typeof createMemoryServerSchema>;

export async function createMemoryService(
  data: CreateMemoryInput,
  creatorId: string
) {
  const { tags, ...rest } = data;

  return prisma.memory.create({
    data: {
      ...rest,
      creatorId,

      ...(tags &&
        tags.length > 0 && {
          tags: {
            connectOrCreate: tags.map((tag) => {
              const slug = slugify(tag);
              return {
                where: { slug },
                create: {
                  name: tag,
                  slug,
                },
              };
            }),
          },
        }),
    },
  });
}
