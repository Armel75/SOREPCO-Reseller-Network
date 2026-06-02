import { Role, User, Reseller, ConstructionSite } from '../database/index.ts';

export type { Role, User, Reseller, ConstructionSite };

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
    email: string | null;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
