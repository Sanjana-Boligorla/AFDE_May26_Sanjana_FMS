import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ total, limit, skip, onPageChange }) {
  const totalPages = Math.ceil(total / limit)
  const currentPage = Math.floor(skip / limit) + 1
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const visible = pages.filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
      <p className="text-sm text-slate-500">
        Showing <span className="font-semibold text-slate-700">{Math.min(skip + 1, total)}</span>–
        <span className="font-semibold text-slate-700">{Math.min(skip + limit, total)}</span> of{' '}
        <span className="font-semibold text-slate-700">{total}</span> records
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(skip - limit)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600"
        >
          <ChevronLeft size={16} />
        </button>
        {visible.map((p, i) => {
          const prev = visible[i - 1]
          return (
            <span key={p} className="flex items-center gap-1">
              {prev && p - prev > 1 && <span className="text-slate-400 px-1">…</span>}
              <button
                onClick={() => onPageChange((p - 1) * limit)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  p === currentPage
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            </span>
          )
        })}
        <button
          onClick={() => onPageChange(skip + limit)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
