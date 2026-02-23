import prisma from '../prisma/client';
import { CreateEmployeeServiceInput } from '../models/employeeservice.model';

export const addEmployeeToBusiness = async (businessId: string, userId: string) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { 
      business: { connect: { id: businessId } },
      role: 'EMPLOYEE'
    },
  });
};

export const removeEmployeeFromBusiness = async (userId: string) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { 
      business: { disconnect: true }
    },
  });
};

export const getEmployeesByBusiness = async (businessId: string) => {
  return await prisma.user.findMany({ where: { businessId, role: 'EMPLOYEE' } });
};

export const assignServiceToEmployee = async (data: CreateEmployeeServiceInput) => {
  return await prisma.employeeService.create({
    data: {
      employee: { connect: { id: data.employeeId } },
      service: { connect: { id: data.serviceId } },
    },
  });
};

export const removeServiceFromEmployee = async (employeeId: string, serviceId: string) => {
  return await prisma.employeeService.delete({
    where: { employeeId_serviceId: { employeeId, serviceId } },
  });
};

export const getServicesByEmployee = async (employeeId: string) => {
  return await prisma.employeeService.findMany({
    where: { employeeId },
    include: { service: true },
  });
};
