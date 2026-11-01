/**
 * GEN LABS — Global Feedback, Alert, Dialog & Confirmation System Types
 */

export type FeedbackVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastItemData {
  id: string;
  variant: FeedbackVariant;
  message: string;
  title?: string;
  duration?: number;
  createdAt: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ConfirmDialogOptions {
  title: string;
  description: string;
  /** Actual target name (e.g. module title, username, parameter name) */
  targetName?: string;
  /** Action button variant: 'danger' (default for destructive) | 'warning' | 'primary' */
  variant?: 'danger' | 'warning' | 'primary';
  confirmLabel?: string;
  cancelLabel?: string;
  /** For high-risk destructive actions, requires typing an exact phrase */
  requirePhrase?: boolean;
  /** Exact phrase required (e.g. 'HAPUS', 'RESET', 'HAPUS AKUN') */
  confirmationPhrase?: string;
  phrasePrompt?: string;
  /** Async or sync callback executed when confirmed */
  onConfirm: () => Promise<void> | void;
  /** Optional callback when dismissed or canceled */
  onCancel?: () => void;
}

export interface AlertDialogOptions {
  title: string;
  message: string;
  variant?: FeedbackVariant;
  actionLabel?: string;
  onAcknowledge?: () => void;
}

export interface ToastMethods {
  success: (message: string, title?: string, duration?: number) => string;
  error: (message: string, title?: string, duration?: number) => string;
  warning: (message: string, title?: string, duration?: number) => string;
  info: (message: string, title?: string, duration?: number) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

export interface FeedbackContextValue {
  toast: ToastMethods;
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
  alert: (options: AlertDialogOptions) => Promise<void>;
  /** Direct close methods */
  closeConfirm: () => void;
  closeAlert: () => void;
}
