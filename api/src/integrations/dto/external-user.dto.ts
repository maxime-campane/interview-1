export interface ExternalUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  birthdate?: string | null;
  phone?: string | null;
}

export type ExternalUserUpdate = Pick<ExternalUser, 'id'> &
  Partial<Omit<ExternalUser, 'id'>>;
