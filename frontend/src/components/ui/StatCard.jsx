export default function StatCard({ title, value, subtitle, icon: Icon, color = 'indigo', trend }) {
  const colors = {
    indigo:  { bg: 'bg-indigo-50',  icon: 'bg-indigo-600',  text: 'text-indigo-600'  },
    emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-600', text: 'text-emerald-600' },
    amber:   { bg: 'bg-amber-50',   icon: 'bg-amber-500',   text: 'text-amber-600'   },
    violet:  { bg: 'bg-violet-50',  icon: 'bg-violet-600',  text: 'text-violet-600'  },
  }
  const c = colors[color] || colors.indigo

  return (
    <div className="card p-5 flex items-start gap-4 hover:shadow-md transition-shadow duration-200">
      <div className={`${c.bg} rounded-xl p-3 flex-shrink-0`}>
        <div className={`${c.icon} rounded-lg p-2`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500 font-medium truncate">{title}</p>
        <p className={`text-3xl font-bold ${c.text} mt-0.5 leading-tight`}>{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  )
}
