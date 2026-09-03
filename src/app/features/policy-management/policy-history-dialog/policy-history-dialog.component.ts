import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PolicyService } from '../../../core/services/policy.service';
import { Policy, PolicyVersion } from '../../../core/models/policy.model';

export interface PolicyHistoryDialogData {
  policy: Policy;
}

@Component({
  selector: 'app-policy-history-dialog',
  standalone: true,
  imports: [
    DatePipe,
    MatDialogModule,
    MatTableModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './policy-history-dialog.component.html',
  styleUrl: './policy-history-dialog.component.scss',
})
export class PolicyHistoryDialogComponent implements OnInit {
  private readonly policyService = inject(PolicyService);
  private readonly data = inject<PolicyHistoryDialogData>(MAT_DIALOG_DATA);

  readonly policy = this.data.policy;
  readonly versions = signal<PolicyVersion[]>([]);
  readonly loading = signal(true);
  readonly displayedColumns = ['version', 'fileName', 'effectiveDate', 'uploadedDate', 'uploadedBy', 'status'];

  ngOnInit(): void {
    this.policyService.getVersionHistory(this.policy.id).subscribe((versions) => {
      this.versions.set(versions);
      this.loading.set(false);
    });
  }
}
