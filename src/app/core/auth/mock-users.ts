import { AppUser } from '../models/user.model';

/**
 * Demo accounts used only while no Cognito User Pool is configured
 * (see environment.ts). Lets the UI be built and reviewed before
 * infra/Cognito exists. Password is not checked beyond non-empty.
 */
export const MOCK_ACCOUNTS: Record<string, AppUser> = {
  'admin@hrpolicy.demo': {
    username: 'admin@hrpolicy.demo',
    email: 'admin@hrpolicy.demo',
    displayName: 'Priya Nair',
    roles: ['HR-Admin'],
  },
  'employee@hrpolicy.demo': {
    username: 'employee@hrpolicy.demo',
    email: 'employee@hrpolicy.demo',
    displayName: 'Jordan Lee',
    roles: ['Employee'],
  },
};
