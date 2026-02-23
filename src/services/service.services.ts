import prisma from '../prisma/client';
import { CreateServiceInput } from '../models/service.model';

export const createService = async (businessId: string, data: CreateServiceInput) => {
  const { employees, ...serviceData } = data; // Separate employees from service data
  return await prisma.service.create({
    data: {
      ...serviceData,
      business: { connect: { id: businessId } },
    },
  });
};


export const getServiceById = async (id: string) => {
  return await prisma.service.findUnique({ where: { id } });
};

export const getServicesByBusiness = async (businessId: string) => {
  return await prisma.service.findMany({ where: { businessId } });
};

export const updateService = async (id: string, data: Partial<CreateServiceInput>) => {
  const { employees, ...serviceData } = data; // Separate employees from service data
  return await prisma.service.update({ where: { id }, data: serviceData });
};

export const deleteService = async (id: string) => {
  return await prisma.service.delete({ where: { id } });
};
