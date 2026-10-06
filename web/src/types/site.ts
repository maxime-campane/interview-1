export interface Site {
  id: string;
  name: string;
  address: string;
  postalCode: string;
  city: string;
  createdAt: string;
}

export type SiteFormValues = Pick<Site, 'name' | 'address' | 'postalCode' | 'city'>;
