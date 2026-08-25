import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  change?: number
  subtitle?: string
  color?: 'red' | 'blue' | 'green' | 'amber' | 'purple'
}

const iconCls: Record<string, string> = {
  red:    'text-red-500',
  blue:   'text-blue-500',
  green:  'text-emerald-500',
  amber:  'text-amber-500',
  purple: 'text-purple-500',
}
const iconBg: Record<string, string> = {
  red:    'rgba(230,57,70,0.12)',
  blue:   'rgba(59,130,246,0.12)',
  green:  'rgba(16,185,129,0.12)',
  amber:  'rgba(245,158,11,0.12)',
  purple: 'rgba(139,92,246,0.12)',
}

export default function StatCard({ title, value, icon: Icon, change, subtitle, color = 'red' }: StatCardProps) {
  return (
    <div className="card stat-card p-5 hover:shadow-md transition-shadow duration-200 anim-fade">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-fg3">{title}</p>
          <p className="text-2xl font-bold text-fg mt-1.5" style={{ fontFamily: 'Outfit' }}>{value}</p>
          {subtitle && <p className="text-xs text-fg3 mt-1">{subtitle}</p>}
          {change !== undefined && (
            <p className={`text-xs font-semibold mt-2 flex items-center gap-1 ${change >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% vs last month
            </p>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconCls[color]}`}
          style={{ background: iconBg[color] }}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  )
}
