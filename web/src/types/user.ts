export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  pictureUrl: string;
  birthdate: string | null;
  phone: string | null;
  createdAt: string;
  deletedAt: string | null;
}

export type UserFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  pictureUrl: string;
  phone: string;
  birthdate: string;
};
