export type CreateBookingInput = {
  startTime: Date;
  customerId?: string; // Made optional
  businessId: string;
  employeeId: string;
  serviceId: string;
  slug: string;
  customerName?: string; // Added
  customerEmail?: string; // Added
  customerPhone?: string; // Added
};
