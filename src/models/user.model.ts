export type CreateUserInput = {
  email: string;
  password: string;
  name: string;
  role?: 'OWNER' | 'EMPLOYEE' | 'CLIENT';
  google_refresh_token?: string;
  businessId?: string; // si es empleado de un negocio
};