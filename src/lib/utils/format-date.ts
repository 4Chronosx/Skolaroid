/**
 * Formats an ISO timestamp into a human-readable relative label.
 * Examples: "Today", "Yesterday", "3d ago", "2mo ago", "1y ago"
 */
export function formatRelativeDate(iso: string | Date): string {
  const date = typeof iso === 'string' ? new Date(iso) : iso;
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays}d ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;

  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears}y ago`;
}
