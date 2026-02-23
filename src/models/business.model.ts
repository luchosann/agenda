export type CreateBusinessInput = {
  name: string;
  address?: string;
  description?: string;
  employees?: { connect: { id: string }[] }; 
  services?: {
    create: {
      name: string;
      description?: string;
      duration: number;
      price: number;
    }[];
  };
};
