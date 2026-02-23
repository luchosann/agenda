export type CreateServiceInput = {
  name: string;
  description?: string;
  duration: number;
  price: number;
  employees?: { connect: { id: string }[] };
};
