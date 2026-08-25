export type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'purple' | 'gray'

const cls: Record<BadgeVariant, string> = {
  success: 'badge-success',
  danger:  'badge-danger',
  warning: 'badge-warning',
  info:    'badge-info',
  purple:  'badge-purple',
  gray:    'badge-gray',
}

export default function Badge({ variant = 'gray', children }: { variant?: BadgeVariant; children: React.ReactNode }) {
  return <span className={`badge ${cls[variant]}`}>{children}</span>
}

const STATUS_MAP: Record<string, { label: string; variant: BadgeVariant }> = {
  active:      { label: 'Active',       variant: 'success' },
  inactive:    { label: 'Inactive',     variant: 'gray' },
  banned:      { label: 'Banned',       variant: 'danger' },
  pending:     { label: 'Pending',      variant: 'warning' },
  accepted:    { label: 'Accepted',     variant: 'info' },
  rejected:    { label: 'Rejected',     variant: 'danger' },
  delivered:   { label: 'Delivered',    variant: 'success' },
  onTheWay:    { label: 'On the Way',   variant: 'info' },
  'on-the-way':{ label: 'On the Way',   variant: 'info' },
  cancelled:   { label: 'Cancelled',    variant: 'danger' },
  approved:    { label: 'Approved',     variant: 'success' },
  reviewed:    { label: 'Reviewed',     variant: 'success' },
  dismissed:   { label: 'Dismissed',    variant: 'gray' },
}

export function StatusBadge({ status }: { status: string }) {
  const c = STATUS_MAP[status] ?? { label: status, variant: 'gray' as BadgeVariant }
  return <Badge variant={c.variant}>{c.label}</Badge>
}
