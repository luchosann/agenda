import prisma from '../prisma/client';
import type { CreateBusinessInput } from '../models/business.model';
import { slugify } from '../utils/slugify';
import { BadRequestError } from '../utils/errors';

const RESERVED_SLUGS = ['www', 'api', 'admin', 'app', 'mail', 'ftp', 'blog', 'test', 'dev'];

export const createBusiness = async (data: CreateBusinessInput, userId: string) => {
  const baseSlug = slugify(data.name);

  if (RESERVED_SLUGS.includes(baseSlug)) {
    throw new BadRequestError(`El nombre de empresa '${data.name}' no está permitido. Por favor, elige otro.`);
  }

  let slug = baseSlug;
  let counter = 1;

  // Ensure slug uniqueness
  while (await prisma.business.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Usamos una transacción para asegurar la atomicidad
  return await prisma.$transaction(async (tx) => {
    const business = await tx.business.create({ data: { ...data, slug, ownerId: userId } });

    await tx.user.update({
      where: { id: userId },
      data: { role: 'OWNER' },
    });

    return business;
  });
};

export const getBusinessByIdOrSlug = async (idOrSlug: string) => {
  // Check if it's a UUID (ID) or a slug
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

  if (isUUID) {
    return await prisma.business.findUnique({ where: { id: idOrSlug } });
  } else {
    return await prisma.business.findUnique({ where: { slug: idOrSlug } });
  }
};

export const getAllBusinesses = async () => {
  return await prisma.business.findMany();
};

export const updateBusiness = async (id: string, data: Partial<CreateBusinessInput>) => {
  const updateData: Partial<CreateBusinessInput> & { slug?: string } = { ...data };

  if (updateData.name) {
    const baseSlug = slugify(updateData.name);

    if (RESERVED_SLUGS.includes(baseSlug)) {
      throw new BadRequestError(`El nombre de empresa '${updateData.name}' no está permitido. Por favor, elige otro.`);
    }

    let slug = baseSlug;
    let counter = 1;
    while (await prisma.business.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    updateData.slug = slug;
  }

  return await prisma.business.update({ where: { id }, data: updateData });
};

export const deleteBusiness = async (id: string) => {
  return await prisma.business.delete({ where: { id } });
};
