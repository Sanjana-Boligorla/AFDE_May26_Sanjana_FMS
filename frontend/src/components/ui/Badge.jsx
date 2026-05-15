const variants = {
  Training: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  Product:  'bg-purple-100 text-purple-700 border-purple-200',
  Event:    'bg-amber-100  text-amber-700  border-amber-200',
  Service:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  Other:    'bg-slate-100  text-slate-600  border-slate-200',
  yes:      'bg-emerald-100 text-emerald-700 border-emerald-200',
  no:       'bg-red-100    text-red-700    border-red-200',
}

export default function Badge({ label, type }) {
  const cls = variants[type] || variants[label] || 'bg-slate-100 text-slate-600 border-slate-200'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {label}
    </span>
  )
}
