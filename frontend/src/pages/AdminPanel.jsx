import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Search, SlidersHorizontal, Edit3, Trash2, Eye, RotateCcw, ShieldCheck } from 'lucide-react'
import { feedbackApi } from '../services/api'
import RatingStars from '../components/ui/RatingStars'
import Badge from '../components/ui/Badge'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ConfirmModal from '../components/ui/ConfirmModal'
import Pagination from '../components/ui/Pagination'

const CATEGORIES = ['Training', 'Product', 'Event', 'Service', 'Other']

export default function AdminPanel() {
  const [data, setData]           = useState([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [skip, setSkip]           = useState(0)
  const limit = 10

  const [keyword,   setKeyword]   = useState('')
  const [searchIn,  setSearchIn]  = useState('')
  const [rating,    setRating]    = useState('')
  const [category,  setCategory]  = useState('')

  const [deleteId,    setDeleteId]    = useState(null)
  const [deleting,    setDeleting]    = useState(false)

  const navigate = useNavigate()

  const fetchData = useCallback(async (newSkip = skip) => {
    setLoading(true)
    try {
      const params = { skip: newSkip, limit }
      if (keyword)  params.keyword  = keyword
      if (rating)   params.rating   = rating
      if (category) params.category = category
      const res = await feedbackApi.getAll(params)
      setData(res.data.data)
      setTotal(res.data.total)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [skip, keyword, rating, category])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSearch = () => { setKeyword(searchIn); setSkip(0) }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await feedbackApi.delete(deleteId)
      toast.success('Feedback deleted successfully')
      setDeleteId(null)
      fetchData()
    } catch {
      toast.error('Failed to delete feedback')
    } finally {
      setDeleting(false)
    }
  }

  const resetFilters = () => {
    setKeyword(''); setSearchIn(''); setRating(''); setCategory(''); setSkip(0)
  }
  const hasFilters = keyword || rating || category

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl px-5 py-4 flex items-center gap-3">
        <div className="bg-indigo-600 rounded-lg p-2">
          <ShieldCheck className="text-white w-5 h-5" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm">Admin Panel</p>
          <p className="text-slate-400 text-xs">Full management access — edit and delete feedback records</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-2xl font-bold text-white">{total}</p>
          <p className="text-slate-400 text-xs">total records</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card p-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input-field pl-9"
              placeholder="Search feedback records..."
              value={searchIn}
              onChange={e => setSearchIn(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button onClick={handleSearch} className="btn-primary text-sm">
            <Search size={14} /> Search
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <SlidersHorizontal size={14} className="text-slate-400" />
          <select
            value={rating}
            onChange={e => { setRating(e.target.value); setSkip(0) }}
            className="input-field text-sm !py-2 w-36"
          >
            <option value="">All Ratings</option>
            {['1','2','3','4','5'].map(r => (
              <option key={r} value={r}>{'⭐'.repeat(Number(r))} {r} Star</option>
            ))}
          </select>
          <select
            value={category}
            onChange={e => { setCategory(e.target.value); setSkip(0) }}
            className="input-field text-sm !py-2 w-36"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          {hasFilters && (
            <button onClick={resetFilters} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium ml-auto">
              <RotateCcw size={12} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-600 font-medium">
            {loading ? 'Loading…' : `${total} record${total !== 1 ? 's' : ''}`}
          </p>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading records..." />
        ) : data.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🗂️</p>
            <p className="text-slate-500 font-medium">No records found</p>
            {hasFilters && (
              <button onClick={resetFilters} className="btn-secondary text-sm mt-4 mx-auto">
                <RotateCcw size={13} /> Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-th">#</th>
                    <th className="table-th">Participant</th>
                    <th className="table-th">Program</th>
                    <th className="table-th">Category</th>
                    <th className="table-th">Rating</th>
                    <th className="table-th">Rec.</th>
                    <th className="table-th">Date</th>
                    <th className="table-th text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((fb) => (
                    <tr key={fb.feedback_id} className="hover:bg-slate-50 transition-colors group">
                      <td className="table-td text-slate-400 font-mono text-xs">#{fb.feedback_id}</td>
                      <td className="table-td">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-indigo-700 font-bold text-xs">
                              {fb.participant_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{fb.participant_name}</p>
                            {fb.email && <p className="text-xs text-slate-400 truncate max-w-[140px]">{fb.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="table-td">
                        <p className="text-sm text-slate-700 font-medium max-w-[160px] truncate" title={fb.program_name}>
                          {fb.program_name}
                        </p>
                      </td>
                      <td className="table-td">
                        <Badge label={fb.category} type={fb.category} />
                      </td>
                      <td className="table-td">
                        <RatingStars rating={fb.rating} size="sm" />
                      </td>
                      <td className="table-td">
                        <Badge
                          label={fb.would_recommend ? 'Yes' : 'No'}
                          type={fb.would_recommend ? 'yes' : 'no'}
                        />
                      </td>
                      <td className="table-td text-slate-400 text-xs whitespace-nowrap">
                        {new Date(fb.submitted_at).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="table-td">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => navigate(`/feedback/${fb.feedback_id}`)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                            title="View"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/edit/${fb.feedback_id}`)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                            title="Edit"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteId(fb.feedback_id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination total={total} limit={limit} skip={skip} onPageChange={(s) => { setSkip(s); fetchData(s) }} />
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Feedback"
        message={`Are you sure you want to permanently delete feedback #${deleteId}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  )
}
