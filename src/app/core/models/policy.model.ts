export type PolicyStatus = 'active' | 'retired';

export interface PolicyVersion {
  id: string;
  version: number;
  fileName: string;
  effectiveDate: string;
  uploadedDate: string;
  uploadedBy: string;
  status: PolicyStatus;
}

export interface Policy {
  id: string;
  name: string;
  category: string;
  currentVersion: number;
  effectiveDate: string;
  status: PolicyStatus;
  versions: PolicyVersion[];
}

export interface PolicyUploadRequest {
  name: string;
  category: string;
  effectiveDate: string;
  file: File;
}

export interface PolicyReplaceRequest {
  policyId: string;
  effectiveDate: string;
  file: File;
}
