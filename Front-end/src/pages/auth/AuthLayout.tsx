import { UtensilsCrossed } from 'lucide-react'
import type { ReactNode } from 'react'

export default function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="auth-page flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12"
        style={{ borderRight: '1px solid rgba(230,57,70,0.15)', background: 'linear-gradient(160deg,#06090F,#0F172A)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#E63946,#C1121F)' }}>
            <UtensilsCrossed size={20} className="text-white" />
          </div>
          <span className="text-white text-xl font-bold" style={{ fontFamily: 'Outfit' }}>FoodHub</span>
        </div>

        <div>
          <div className="mb-8 relative overflow-hidden rounded-2xl" style={{ height: 260 }}>
            <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&h=400&fit=crop&auto=format"
              alt="Food" className="w-full h-full object-cover opacity-75" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,#06090F 0%,transparent 60%)' }} />
          </div>
          <h2 className="text-4xl font-bold text-white mb-3 leading-tight" style={{ fontFamily: 'Outfit' }}>
            Manage your restaurant<br /><span style={{ color: '#E63946' }}>smarter.</span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            Real-time orders · instant chat · powerful analytics.<br />All in one place.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[{ n: '4+', label: 'Restaurants' }, { n: '800+', label: 'Orders' }, { n: '99%', label: 'Uptime' }].map(s => (
              <div key={s.label} className="rounded-xl p-4 text-center"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-2xl font-bold" style={{ fontFamily: 'Outfit', color: '#E63946' }}>{s.n}</p>
                <p className="text-xs text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-slate-700 text-xs">© 2024 FoodHub. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md anim-fade py-4">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#E63946,#C1121F)' }}>
              <UtensilsCrossed size={16} className="text-white" />
            </div>
            <span className="text-white font-bold" style={{ fontFamily: 'Outfit' }}>FoodHub</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1.5" style={{ fontFamily: 'Outfit' }}>{title}</h1>
          <p className="text-slate-400 mb-8 text-sm">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  )
}

interface FieldProps {
  label: string; type?: string; value: string
  onChange: (v: string) => void; placeholder?: string; error?: string
  extra?: ReactNode
}

export function AuthField({ label, type = 'text', value, onChange, placeholder, error, extra }: FieldProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className={`auth-input pr-${extra ? '10' : '4'} ${error ? 'error' : ''}`} />
        {extra && <div className="absolute right-3 top-1/2 -translate-y-1/2">{extra}</div>}
      </div>
      {error && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">⚠ {error}</p>}
    </div>
  )
}

export function AuthBtn({ children, onClick, loading, type = 'button' }: {
  children: ReactNode; onClick?: () => void; loading?: boolean; type?: 'button' | 'submit'
}) {
  return (
    <button type={type} onClick={onClick} disabled={loading}
      className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm"
      style={{ fontFamily: 'Outfit', fontSize: '0.95rem' }}>
      {loading ? <><span className="spinner" /> Loading...</> : children}
    </button>
  )
}
