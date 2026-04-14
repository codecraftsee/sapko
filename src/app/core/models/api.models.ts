export type Species = 'dog' | 'cat';
export type Sex = 'male' | 'female';
export type Size = 'small' | 'medium' | 'large';
export type UserRole = 'admin' | 'shelter' | 'vet' | 'user';
export type AdoptionStatus = 'open' | 'adopted' | 'closed';
export type UrgentType =
  | 'blood'
  | 'food_donation'
  | 'lost_pet'
  | 'injured_stray'
  | 'medical_fundraising'
  | 'other';
export type UrgentStatus = 'open' | 'resolved' | 'closed';
export type BloodGroup = 'DEA_1_1+' | 'DEA_1_1-' | 'A' | 'B' | 'AB' | 'unknown';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  city?: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface PetPhoto {
  id: string;
  url: string;
  sort_order: number;
}

export interface Pet {
  id: string;
  owner_id: string;
  species: Species;
  name: string;
  age_years?: number;
  sex?: Sex;
  breed?: string;
  size?: Size;
  weight_kg?: number;
  description?: string;
  vaccinated: boolean;
  neutered: boolean;
  created_at: string;
  photos: PetPhoto[];
}

export interface AdoptionListing {
  id: string;
  pet_id: string;
  city: string;
  status: AdoptionStatus;
  created_at: string;
  pet?: Pet;
}

export interface DonorRegistration {
  id: string;
  pet_id: string;
  blood_group: BloodGroup;
  last_donation_date?: string;
  consent: boolean;
  active: boolean;
  created_at: string;
  pet?: Pet;
}

export interface UrgentRequest {
  id: string;
  author_id: string;
  type: UrgentType;
  species?: Species;
  title: string;
  description: string;
  city: string;
  deadline?: string;
  status: UrgentStatus;
  contact_phone?: string;
  extra_data?: Record<string, unknown>;
  created_at: string;
  photos: { id: string; url: string; sort_order: number }[];
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
