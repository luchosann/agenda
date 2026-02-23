export type CreateWorkScheduleInput = {
  dayOfWeek: number; // 0 = domingo, 1 = lunes...
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  employeeId: string;
};
