import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Policy } from '../../../core/models/policy.model';

export interface PolicyRetireDialogData {
  policy: Policy;
}

@Component({
  selector: 'app-policy-retire-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './policy-retire-dialog.component.html',
  styleUrl: './policy-retire-dialog.component.scss',
})
export class PolicyRetireDialogComponent {
  private readonly data = inject<PolicyRetireDialogData>(MAT_DIALOG_DATA);

  readonly policy = this.data.policy;
}
