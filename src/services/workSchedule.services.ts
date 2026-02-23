import prisma from '../prisma/client';
import { CreateWorkScheduleInput } from '../models/workschedule.model';

export const createWorkSchedule = async (data: CreateWorkScheduleInput) => {
  const { employeeId, ...scheduleData } = data; // Separate employeeId from schedule data
  return await prisma.workSchedule.create({
    data: {
      ...scheduleData,
      employee: { connect: { id: employeeId } },
    },
  });
};

export const getWorkScheduleById = async (id: string) => {
  return await prisma.workSchedule.findUnique({ where: { id } });
};

export const getWorkSchedulesByEmployee = async (employeeId: string) => {
  return await prisma.workSchedule.findMany({ where: { employeeId } });
};

export const updateWorkSchedule = async (id: string, data: Partial<CreateWorkScheduleInput>) => {
  return await prisma.workSchedule.update({ where: { id }, data });
};

export const deleteWorkSchedule = async (id: string) => {
  return await prisma.workSchedule.delete({ where: { id } });
};
