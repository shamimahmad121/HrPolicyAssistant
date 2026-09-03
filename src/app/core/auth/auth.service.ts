import { Injectable, computed, signal } from '@angular/core';
import {
  fetchAuthSession,
  getCurrentUser,
  signIn as amplifySignIn,
  signOut as amplifySignOut,
} from 'aws-amplify/auth';
import { Router } from '@angular/router';
import { isCognitoConfigured } from './auth.config';
import { MOCK_ACCOUNTS } from './mock-users';
import { AppRole, AppUser } from '../models/user.model';

const MOCK_SESSION_KEY = 'hrpa.mockSession';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserSignal = signal<AppUser | null>(this.restoreMockSession());
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly roles = computed<AppRole[]>(() => this.currentUserSignal()?.roles ?? []);
  readonly isHrAdmin = computed(() => this.roles().includes('HR-Admin'));
  readonly usingMockAuth = !isCognitoConfigured;

  constructor(private readonly router: Router) {}

  /** Resolves a previously-authenticated Cognito session on app start, if any. */
  async restoreSession(): Promise<void> {
    if (!isCognitoConfigured) {
      return;
    }
    try {
      const user = await getCurrentUser();
      const appUser = await this.toAppUser(user.username);
      this.currentUserSignal.set(appUser);
    } catch {
      this.currentUserSignal.set(null);
    }
  }

  async signIn(username: string, password: string): Promise<boolean> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      if (isCognitoConfigured) {
        const result = await amplifySignIn({ username, password });
        if (!result.isSignedIn) {
          this.errorSignal.set('Additional sign-in step required.');
          return false;
        }
        const appUser = await this.toAppUser(username);
        this.currentUserSignal.set(appUser);
        return true;
      }

      // Mock auth path — no live Cognito pool configured yet.
      const account = MOCK_ACCOUNTS[username.trim().toLowerCase()];
      if (!account || !password) {
        this.errorSignal.set('Invalid email or password.');
        return false;
      }
      this.currentUserSignal.set(account);
      sessionStorage.setItem(MOCK_SESSION_KEY, account.username);
      return true;
    } catch (err) {
      this.errorSignal.set(err instanceof Error ? err.message : 'Sign-in failed.');
      return false;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async signOut(): Promise<void> {
    if (isCognitoConfigured) {
      await amplifySignOut();
    } else {
      sessionStorage.removeItem(MOCK_SESSION_KEY);
    }
    this.currentUserSignal.set(null);
    await this.router.navigate(['/login']);
  }

  /** Bearer token for outgoing API calls; null when using mock auth. */
  async getAuthToken(): Promise<string | null> {
    if (!isCognitoConfigured) {
      return null;
    }
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() ?? null;
  }

  private async toAppUser(username: string): Promise<AppUser> {
    const session = await fetchAuthSession();
    const payload = session.tokens?.idToken?.payload ?? {};
    const groups = (payload['cognito:groups'] as string[] | undefined) ?? [];
    const roles = groups.filter((g): g is AppRole => g === 'HR-Admin' || g === 'Employee');

    return {
      username,
      email: (payload['email'] as string) ?? username,
      displayName: (payload['name'] as string) ?? username,
      roles: roles.length ? roles : ['Employee'],
    };
  }

  private restoreMockSession(): AppUser | null {
    if (isCognitoConfigured) {
      return null;
    }
    const saved = sessionStorage.getItem(MOCK_SESSION_KEY);
    return saved ? MOCK_ACCOUNTS[saved] ?? null : null;
  }
}
