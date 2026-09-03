import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PolicyService } from '../../../core/services/policy.service';
import { Policy } from '../../../core/models/policy.model';
import {
  PolicyUploadDialogComponent,
  PolicyUploadDialogResult,
} from '../policy-upload-dialog/policy-upload-dialog.component';
import { PolicyHistoryDialogComponent } from '../policy-history-dialog/policy-history-dialog.component';
import { PolicyRetireDialogComponent } from '../policy-retire-dialog/policy-retire-dialog.component';

@Component({
  selector: 'app-policy-list',
  standalone: true,
  imports: [
    DatePipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './policy-list.component.html',
  styleUrl: './policy-list.component.scss',
})
export class PolicyListComponent implements OnInit {
  private readonly policyService = inject(PolicyService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly policies = signal<Policy[]>([]);
  readonly loading = signal(true);
  readonly displayedColumns = ['name', 'category', 'currentVersion', 'effectiveDate', 'status', 'actions'];

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.policyService.list().subscribe((policies) => {
      this.policies.set(policies);
      this.loading.set(false);
    });
  }

  openUploadDialog(): void {
    const ref = this.dialog.open(PolicyUploadDialogComponent, { width: '480px', data: {} });
    ref.afterClosed().subscribe((result?: PolicyUploadDialogResult) => {
      if (!result) return;
      this.policyService
        .upload({
          name: result.name,
          category: result.category,
          effectiveDate: result.effectiveDate.toISOString(),
          file: result.file,
        })
        .subscribe(() => {
          this.snackBar.open(`"${result.name}" uploaded.`, 'Dismiss', { duration: 4000 });
          this.refresh();
        });
    });
  }

  openReplaceDialog(policy: Policy): void {
    const ref = this.dialog.open(PolicyUploadDialogComponent, { width: '480px', data: { replacing: policy } });
    ref.afterClosed().subscribe((result?: PolicyUploadDialogResult) => {
      if (!result) return;
      this.policyService
        .replace({
          policyId: policy.id,
          effectiveDate: result.effectiveDate.toISOString(),
          file: result.file,
        })
        .subscribe(() => {
          this.snackBar.open(`New version uploaded for "${policy.name}".`, 'Dismiss', { duration: 4000 });
          this.refresh();
        });
    });
  }

  openHistoryDialog(policy: Policy): void {
    this.dialog.open(PolicyHistoryDialogComponent, { width: '640px', data: { policy } });
  }

  openRetireDialog(policy: Policy): void {
    const ref = this.dialog.open(PolicyRetireDialogComponent, { width: '420px', data: { policy } });
    ref.afterClosed().subscribe((confirmed?: boolean) => {
      if (!confirmed) return;
      this.policyService.retire(policy.id).subscribe(() => {
        this.snackBar.open(`"${policy.name}" retired.`, 'Dismiss', { duration: 4000 });
        this.refresh();
      });
    });
  }
}
