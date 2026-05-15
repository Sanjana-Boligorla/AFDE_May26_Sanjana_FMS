import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, X, Eye, RotateCcw } from 'lucide-react'
import { feedbackApi } from '../services/api'
import RatingStars from '../components/ui/RatingStars'
import Badge from '../components/ui/Badge'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Pagination from '../components/ui/Pagination'

const CATEGORIES = ['', 'Training', 'Product', 'Event', 'Service', 'Other']
const RATINGS    = ['', '1', '2', '3', '4', '5']

export default function FeedbackList() {
  const [data, setData]       = useState([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [skip, setSkip]       = useState(0)
  const limit = 10

  const [keyword,      setKeyword]      = useState('')
  const [rating,       setRating]       = useState('')
  const [category,     setCategory]     = useState('')
  const [recommend,    setRecommend]    = useState('')
  const [searchInput,  setSearchInput]  = useState('')

  const navigate = useNavigate()

  const fetchData = useCallback(async (newSkip = skip) => {
    setLoading(true)
    try {
      const params = { skip: newSkip, limit }
      if (keyword)   params.keyword  = keyword
      if (rating)    params.rating   = rating
      if (category)  params.category = category
      if (recommend !== '') params.would_recommend = recommend
      const res = await feedbackApi.getAll(params)
      setData(res.data.data)
      setTotal(res.data.total)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [skip, keyword, rating, category, recommend])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSearch = () => {
    setKeyword(searchInput)
    setSkip(0)
  }

  const resetFilters = () => {
    setKeyword(''); setSearchInput(''); setRating('')
    setCategory(''); setRecommend(''); setSkip(0)
  }

  const hasFilters = keyword || rating || category || recommend !== ''

  const FilterSelect = ({ value, onChange, children, label }) => (
    <select
      value={value}
      onChange={e => { onChange(e.target.value); setSkip(0) }}
      className="input-field text-sm !py-2"
      title={label}
    >
      {children}
    </select>
  )

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input-field pl-9 pr-4"
              placeholder="Search by name, email, program, trainer, comments..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button onClick={handleSearch} className="btn-primary text-sm whitespace-nowrap">
            <Search size={14} /> Search
          </button>
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <SlidersHorizontal size={14} className="text-slate-400" />

          <div className="w-36">
            <FilterSelect value={rating} onChange={setRating} label="Rating">
              <option value="">All Ratings</option>
              {['1','2','3','4','5'].map(r => (
                <option key={r} value={r}>{'⭐'.repeat(Number(r))} {r} Star{r!=='1'?'s':''}</option>
              ))}
            </FilterSelect>
          </div>

          <div className="w-36">
            <FilterSelect value={category} onChange={setCategory} label="Category">
              <option value="">All Categories</option>
              {CATEGORIES.filter(Boolean).map(c => <option key={c}>{c}</option>)}
            </FilterSelect>
          </div>

          <div className="w-40">
            <FilterSelect value={recommend} onChange={setRecommend} label="Recommend">
              <option value="">All Responses</option>
              <option value="true">👍 Recommended</option>
              <option value="false">👎 Not Recommended</option>
            </FilterSelect>
          </div>

          {hasFilters && (
            <button onClick={resetFilters} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium ml-auto">
              <RotateCcw size={12} /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <p className="text-sm text-slate-600 font-medium">
            {loading ? 'Loading…' : `${total} record${total !== 1 ? 's' : ''} found`}
          </p>
          {hasFilters && (
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
              Filtered
            </span>
          )}
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching feedback..." />
        ) : data.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400 text-4xl mb-3">🔍</p>
            <p className="text-slate-500 font-medium">No feedback found</p>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</p>
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
                    <th className="table-th">Trainer</th>
                    <th className="table-th">Rating</th>
                    <th className="table-th">Recommend</th>
                    <th className="table-th">Date</th>
                    <th className="table-th text-center">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((fb) => (
                    <tr
                      key={fb.feedback_id}
                      onClick={() => navigate(`/feedback/${fb.feedback_id}`)}
                      className="hover:bg-indigo-50/40 cursor-pointer transition-colors group"
                    >
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
                            {fb.department && <p className="text-xs text-slate-400">{fb.department}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="table-td">
                        <p className="font-medium text-slate-700 text-sm max-w-[180px] truncate" title={fb.program_name}>
                          {fb.program_name}
                        </p>
                      </td>
                      <td className="table-td">
                        <Badge label={fb.category} type={fb.category} />
                      </td>
                      <td className="table-td text-slate-500 text-sm">
                        {fb.trainer_name || <span className="text-slate-300">—</span>}
                      </td>
                      <td className="table-td">
                        <RatingStars rating={fb.rating} showLabel size="sm" />
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
                      <td className="table-td text-center">
                        <button className="p-1.5 rounded-lg text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-100 transition-all">
                          <Eye size={15} />
                        </button>
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
    </div>
  )
}
