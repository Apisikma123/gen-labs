/**
 * Centralized Date & Time Utility for Gen Labs (Section 4 & 21)
 * Converts database timestamps into standardized Indonesian localized formats.
 * Zero hardcoded date strings in UI.
 */

export function formatRelativeTime(timestamp?: string | Date | null): string {
  if (!timestamp) return 'Belum ada waktu tercatat';

  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  if (isNaN(date.getTime())) return 'Waktu tidak valid';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 30) {
    return 'Baru saja';
  }
  if (diffInSeconds < 60) {
    return `${diffInSeconds} detik yang lalu`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} menit yang lalu`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} jam yang lalu`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return 'Kemarin';
  }
  if (diffInDays < 7) {
    return `${diffInDays} hari yang lalu`;
  }

  return formatDate(date);
}

export function formatDate(timestamp?: string | Date | null): string {
  if (!timestamp) return '-';

  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  if (isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(timestamp?: string | Date | null): string {
  if (!timestamp) return '-';

  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  if (isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
