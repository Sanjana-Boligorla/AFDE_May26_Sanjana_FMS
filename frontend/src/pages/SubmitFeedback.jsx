import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Send, User, Mail, Building2, BookOpen, Tag, GraduationCap, Calendar, MessageSquare, ThumbsUp } from 'lucide-react'
import { feedbackApi } from '../services/api'
import RatingStars from '../components/ui/RatingStars'

const CATEGORIES = ['Training', 'Product', 'Event', 'Service', 'Other']

// Defined outside the component so React never remounts inputs on re-render
const InputWrap = ({ label, icon: Icon, error, children }) => (
  <div>
    <label className="label flex items-center gap-1.5">
      {Icon && <Icon size={13} className="text-slate-400" />} {label}
    </label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
)

const initial = {
  participant_name: '', email: '', department: '',
  program_name: '', category: 'Training', trainer_name: '',
  session_date: '', rating: 0, comments: '', would_recommend: true,
}

export default function SubmitFeedback() {
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.participant_name.trim()) e.participant_name = 'Name is required'
    if (!form.program_name.trim())     e.program_name     = 'Program name is required'
    if (!form.rating)                  e.rating           = 'Please select a rating'
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      const payload = {
        ...form,
        session_date: form.session_date || null,
        email: form.email || null,
        department: form.department || null,
        trainer_name: form.trainer_name || null,
        comments: form.comments || null,
      }
      await feedbackApi.create(payload)
      toast.success('Feedback submitted successfully!')
      navigate('/feedback')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit feedback.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5">
          <h2 className="text-white font-bold text-lg">Submit Feedback</h2>
          <p className="text-indigo-200 text-sm mt-0.5">Share your experience to help us improve</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section: Participant */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User size={12} /> Participant Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputWrap label="Full Name *" icon={User} error={errors.participant_name}>
                <input
                  className="input-field"
                  placeholder="e.g. Alice Johnson"
                  value={form.participant_name}
                  onChange={e => set('participant_name', e.target.value)}
                />
              </InputWrap>
              <InputWrap label="Email Address" icon={Mail} error={errors.email}>
                <input
                  type="email"
                  className="input-field"
                  placeholder="alice@example.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                />
              </InputWrap>
              <InputWrap label="Department" icon={Building2}>
                <input
                  className="input-field"
                  placeholder="e.g. Engineering"
                  value={form.department}
                  onChange={e => set('department', e.target.value)}
                />
              </InputWrap>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Section: Program */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BookOpen size={12} /> Program / Event Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputWrap label="Program / Event / Product Name *" icon={BookOpen} error={errors.program_name}>
                <input
                  className="input-field"
                  placeholder="e.g. Python for Data Engineering"
                  value={form.program_name}
                  onChange={e => set('program_name', e.target.value)}
                />
              </InputWrap>
              <InputWrap label="Category" icon={Tag}>
                <select
                  className="input-field"
                  value={form.category}
                  onChange={e => set('category', e.target.value)}
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </InputWrap>
              <InputWrap label="Trainer / Instructor Name" icon={GraduationCap}>
                <input
                  className="input-field"
                  placeholder="e.g. Dr. Ramesh Kumar"
                  value={form.trainer_name}
                  onChange={e => set('trainer_name', e.target.value)}
                />
              </InputWrap>
              <InputWrap label="Session Date" icon={Calendar}>
                <input
                  type="date"
                  className="input-field"
                  value={form.session_date}
                  onChange={e => set('session_date', e.target.value)}
                />
              </InputWrap>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Section: Feedback */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <MessageSquare size={12} /> Your Feedback
            </h3>

            {/* Rating */}
            <div className="mb-4">
              <label className="label">Overall Rating *</label>
              <div className="bg-slate-50 rounded-xl p-4 flex flex-col items-center gap-2 border border-slate-200">
                <RatingStars rating={form.rating} size="lg" interactive onRate={v => set('rating', v)} />
                <p className="text-sm font-semibold text-slate-600">
                  {form.rating
                    ? ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][form.rating]
                    : 'Click to rate'}
                </p>
              </div>
              {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
            </div>

            {/* Comments */}
            <InputWrap label="Comments & Suggestions" icon={MessageSquare}>
              <textarea
                className="input-field resize-none"
                rows={4}
                placeholder="Share your detailed experience, suggestions, or areas of improvement..."
                value={form.comments}
                onChange={e => set('comments', e.target.value)}
              />
            </InputWrap>

            {/* Would Recommend */}
            <div className="mt-4">
              <label className="label flex items-center gap-1.5">
                <ThumbsUp size={13} className="text-slate-400" /> Would you recommend this?
              </label>
              <div className="flex gap-3">
                {[true, false].map((val) => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() => set('would_recommend', val)}
                    className={`flex-1 py-2.5 rounded-lg border text-sm font-semibold transition-all ${
                      form.would_recommend === val
                        ? val
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                          : 'bg-red-600 border-red-600 text-white shadow-sm'
                        : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {val ? '👍 Yes, Recommend' : '👎 No, Would Not'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end border-t border-slate-100 pt-4">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              <Send size={15} />
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
