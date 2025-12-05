export type UserRole = 'admin' | 'user';
export type Gender = 'Male' | 'Female';

export interface User {
  username: string;
  role: UserRole;
  name?: string;
  email?: string;
  gender?: Gender;
  darkMode?: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  gender: Gender;
  darkMode: boolean;
}
