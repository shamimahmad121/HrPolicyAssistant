import { Injectable, signal } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import {
  Policy,
  PolicyReplaceRequest,
  PolicyUploadRequest,
  PolicyVersion,
} from '../models/policy.model';

/**
 * In-memory implementation so the UI is fully demoable before the
 * ASP.NET Core API + S3 + OpenSearch pipeline exists. Swap the bodies
 * of these methods for HttpClient calls to environment.apiBaseUrl —
 * the public interface (return types, method signatures) is designed
 * to stay the same.
 */
@Injectable({ providedIn: 'root' })
export class PolicyService {
  private readonly policiesSignal = signal<Policy[]>(seedPolicies());
  readonly policies = this.policiesSignal.asReadonly();

  list(): Observable<Policy[]> {
    return of(this.policiesSignal()).pipe(delay(300));
  }

  getVersionHistory(policyId: string): Observable<PolicyVersion[]> {
    const policy = this.policiesSignal().find((p) => p.id === policyId);
    if (!policy) {
      return throwError(() => new Error('Policy not found'));
    }
    return of([...policy.versions].sort((a, b) => b.version - a.version)).pipe(delay(200));
  }

  upload(request: PolicyUploadRequest): Observable<Policy> {
    const version: PolicyVersion = {
      id: crypto.randomUUID(),
      version: 1,
      fileName: request.file.name,
      effectiveDate: request.effectiveDate,
      uploadedDate: new Date().toISOString(),
      uploadedBy: 'you@company.com',
      status: 'active',
    };

    const policy: Policy = {
      id: crypto.randomUUID(),
      name: request.name,
      category: request.category,
      currentVersion: 1,
      effectiveDate: request.effectiveDate,
      status: 'active',
      versions: [version],
    };

    this.policiesSignal.update((list) => [policy, ...list]);
    return of(policy).pipe(delay(600));
  }

  replace(request: PolicyReplaceRequest): Observable<Policy> {
    const policies = this.policiesSignal();
    const target = policies.find((p) => p.id === request.policyId);
    if (!target) {
      return throwError(() => new Error('Policy not found'));
    }

    const nextVersionNumber = target.currentVersion + 1;
    const newVersion: PolicyVersion = {
      id: crypto.randomUUID(),
      version: nextVersionNumber,
      fileName: request.file.name,
      effectiveDate: request.effectiveDate,
      uploadedDate: new Date().toISOString(),
      uploadedBy: 'you@company.com',
      status: 'active',
    };

    const updated: Policy = {
      ...target,
      currentVersion: nextVersionNumber,
      effectiveDate: request.effectiveDate,
      versions: [
        ...target.versions.map((v) => ({ ...v, status: 'retired' as const })),
        newVersion,
      ],
    };

    this.policiesSignal.update((list) => list.map((p) => (p.id === target.id ? updated : p)));
    return of(updated).pipe(delay(600));
  }

  retire(policyId: string): Observable<Policy> {
    const policies = this.policiesSignal();
    const target = policies.find((p) => p.id === policyId);
    if (!target) {
      return throwError(() => new Error('Policy not found'));
    }

    const updated: Policy = { ...target, status: 'retired' };
    this.policiesSignal.update((list) => list.map((p) => (p.id === target.id ? updated : p)));
    return of(updated).pipe(delay(400));
  }
}

function seedPolicies(): Policy[] {
  return [
    {
      id: 'pol-1',
      name: 'Paid Time Off Policy',
      category: 'Leave & Time Off',
      currentVersion: 3,
      effectiveDate: '2026-01-01',
      status: 'active',
      versions: [
        {
          id: 'v1',
          version: 1,
          fileName: 'pto-policy-v1.pdf',
          effectiveDate: '2024-01-01',
          uploadedDate: '2023-12-15T10:00:00Z',
          uploadedBy: 'priya.nair@company.com',
          status: 'retired',
        },
        {
          id: 'v2',
          version: 2,
          fileName: 'pto-policy-v2.pdf',
          effectiveDate: '2025-01-01',
          uploadedDate: '2024-12-10T09:30:00Z',
          uploadedBy: 'priya.nair@company.com',
          status: 'retired',
        },
        {
          id: 'v3',
          version: 3,
          fileName: 'pto-policy-v3.pdf',
          effectiveDate: '2026-01-01',
          uploadedDate: '2025-12-18T14:20:00Z',
          uploadedBy: 'priya.nair@company.com',
          status: 'active',
        },
      ],
    },
    {
      id: 'pol-2',
      name: 'Remote Work Policy',
      category: 'Workplace',
      currentVersion: 1,
      effectiveDate: '2025-06-01',
      status: 'active',
      versions: [
        {
          id: 'v1',
          version: 1,
          fileName: 'remote-work-policy-v1.pdf',
          effectiveDate: '2025-06-01',
          uploadedDate: '2025-05-20T11:00:00Z',
          uploadedBy: 'priya.nair@company.com',
          status: 'active',
        },
      ],
    },
    {
      id: 'pol-3',
      name: 'Code of Conduct',
      category: 'Compliance',
      currentVersion: 2,
      effectiveDate: '2024-03-01',
      status: 'retired',
      versions: [
        {
          id: 'v1',
          version: 1,
          fileName: 'code-of-conduct-v1.pdf',
          effectiveDate: '2022-01-01',
          uploadedDate: '2021-12-01T08:00:00Z',
          uploadedBy: 'priya.nair@company.com',
          status: 'retired',
        },
        {
          id: 'v2',
          version: 2,
          fileName: 'code-of-conduct-v2.pdf',
          effectiveDate: '2024-03-01',
          uploadedDate: '2024-02-15T13:45:00Z',
          uploadedBy: 'priya.nair@company.com',
          status: 'retired',
        },
      ],
    },
  ];
}
