import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'ask' },
      {
        path: 'ask',
        loadComponent: () => import('./features/ask-hr/chat/chat.component').then((m) => m.ChatComponent),
      },
      {
        path: 'policies',
        canActivate: [roleGuard(['HR-Admin'])],
        loadComponent: () =>
          import('./features/policy-management/policy-list/policy-list.component').then(
            (m) => m.PolicyListComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
