export type AppRole = 'HR-Admin' | 'Employee';

export interface AppUser {
  username: string;
  email: string;
  displayName: string;
  roles: AppRole[];
}
