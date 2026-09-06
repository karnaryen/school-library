import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { T } from '../nl';

export interface DangerDialogData {
  title: string;
  message: string;
  /** When set, the user must type exactly this text (e.g. the school name) before confirming. */
  challenge?: string;
  challengeLabel?: string;
  /** When set, a password field is shown and its value is returned. */
  passwordLabel?: string;
  confirmLabel: string;
}

export interface DangerDialogResult {
  password: string;
}

/**
 * Confirmation for irreversible actions: a red button that only unlocks after
 * the user retypes a challenge word or enters their password.
 */
@Component({
  selector: 'app-danger-dialog',
  imports: [FormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title class="text-red-800">{{ data.title }}</h2>
    <mat-dialog-content class="flex flex-col gap-3">
      <p class="m-0">{{ data.message }}</p>
      @if (data.challenge) {
        <mat-form-field class="w-full">
          <mat-label>{{ data.challengeLabel }}</mat-label>
          <input matInput [ngModel]="typed()" (ngModelChange)="typed.set($event)" autocomplete="off" cdkFocusInitial>
        </mat-form-field>
      }
      @if (data.passwordLabel) {
        <mat-form-field class="w-full">
          <mat-label>{{ data.passwordLabel }}</mat-label>
          <input matInput type="password" [ngModel]="password()" (ngModelChange)="password.set($event)" autocomplete="current-password">
        </mat-form-field>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="ref.close()">{{ t.common.cancel }}</button>
      <button mat-flat-button type="button" class="bg-red-700! text-white!" [disabled]="!ready()" (click)="confirm()">{{ data.confirmLabel }}</button>
    </mat-dialog-actions>
  `,
})
export class DangerDialogComponent {
  protected readonly t = T;
  protected readonly data = inject<DangerDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject<MatDialogRef<DangerDialogComponent, DangerDialogResult>>(MatDialogRef);
  protected readonly typed = signal('');
  protected readonly password = signal('');

  protected readonly ready = computed(() => {
    const challengeOk = !this.data.challenge || this.typed().trim() === this.data.challenge.trim();
    const passwordOk = !this.data.passwordLabel || this.password().length > 0;
    return challengeOk && passwordOk;
  });

  protected confirm(): void {
    if (this.ready()) this.ref.close({ password: this.password() });
  }
}
