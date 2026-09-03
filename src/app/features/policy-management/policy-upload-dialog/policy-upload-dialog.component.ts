import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Policy } from '../../../core/models/policy.model';

export interface PolicyUploadDialogData {
  /** When set, this dialog is replacing an existing policy rather than creating a new one. */
  replacing?: Policy;
}

export interface PolicyUploadDialogResult {
  name: string;
  category: string;
  effectiveDate: Date;
  file: File;
}

const MAX_FILE_BYTES = 25 * 1024 * 1024;

@Component({
  selector: 'app-policy-upload-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './policy-upload-dialog.component.html',
  styleUrl: './policy-upload-dialog.component.scss',
})
export class PolicyUploadDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<PolicyUploadDialogComponent>);
  private readonly data = inject<PolicyUploadDialogData>(MAT_DIALOG_DATA);

  readonly isReplace = !!this.data.replacing;
  readonly selectedFile = signal<File | null>(null);
  readonly fileError = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: [this.data.replacing?.name ?? '', Validators.required],
    category: [this.data.replacing?.category ?? '', Validators.required],
    effectiveDate: [new Date(), Validators.required],
  });

  constructor() {
    if (this.isReplace) {
      this.form.controls.name.disable();
      this.form.controls.category.disable();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.fileError.set(null);
    this.selectedFile.set(null);

    if (!file) {
      return;
    }
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      this.fileError.set('Only PDF files are accepted.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      this.fileError.set('File exceeds the 25 MB limit.');
      return;
    }

    this.selectedFile.set(file);
  }

  submit(): void {
    const file = this.selectedFile();
    if (this.form.invalid || !file) {
      this.form.markAllAsTouched();
      if (!file) {
        this.fileError.set('Select a PDF file to upload.');
      }
      return;
    }

    const { name, category, effectiveDate } = this.form.getRawValue();
    const result: PolicyUploadDialogResult = { name, category, effectiveDate, file };
    this.dialogRef.close(result);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
