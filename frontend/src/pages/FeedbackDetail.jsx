import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, User, Mail, Building2, BookOpen,
  Tag, GraduationCap, Calendar, MessageSquare,
  ThumbsUp, ThumbsDown, Clock, Edit3
} from 'lucide-react'
import { feedbackApi } from '../services/api'
import RatingStars from '../components/ui/RatingStars'
import Badge from '../components/ui/Badge'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const Field = ({ icon: Icon, label, value, full }) => {
  if (!value && value !== false) return null
  return (
    <div className={full ? 'col-span-2' : ''}>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
        <Icon size={11} /> {label}
      </p>
      <p className="text-slate-800 font-medium text-sm leading-relaxed">{value}</p>
    </div>
  )
}

export default function FeedbackDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [fb, setFb]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    feedbackApi.getById(id)
      .then(r => setFb(r.data))
      .catch(() => navigate('/feedback'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <LoadingSpinner text="Loading feedback..." />
  if (!fb) return null

  const ratingColor = {
    1: 'from-red-500 to-red-600',
    2: 'from-orange-500 to-orange-600',
    3: 'from-amber-500 to-amber-600',
    4: 'from-green-500 to-green-600',
    5: 'from-emerald-500 to-emerald-600',
  }[fb.rating] || 'from-indigo-500 to-indigo-600'

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 text-sm font-medium transition-colors"
      >
        <ArrowLeft size={15} /> Back to list
      </button>

      {/* Hero Card */}
      <div className="card overflow-hidden">
        <div className={`bg-gradient-to-r ${ratingColor} px-6 py-5`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                <span className="text-white text-2xl font-black">
                  {fb.participant_name.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-white font-bold text-lg leading-tight">{fb.participant_name}</h2>
                {fb.email && <p className="text-white/80 text-sm">{fb.email}</p>}
                {fb.department && (
                  <span className="inline-block mt-1 bg-white/20 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                    {fb.department}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-white/70 text-xs mb-1">Overall Rating</div>
              <RatingStars rating={fb.rating} showLabel size="md" />
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Program Info */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">
              Program Information
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Field icon={BookOpen}      label="Program / Event"  value={fb.program_name} />
              <Field icon={Tag}           label="Category"         value={<Badge label={fb.category} type={fb.category} />} />
              {fb.trainer_name && <Field icon={GraduationCap} label="Trainer / Instructor" value={fb.trainer_name} />}
              {fb.session_date && (
                <Field
                  icon={Calendar}
                  label="Session Date"
                  value={new Date(fb.session_date).toLocaleDateString('en-IN', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                  })}
                />
              )}
            </div>
          </div>

          {/* Feedback Content */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">
              Feedback Content
            </h3>
            <div className="space-y-4">
              {fb.comments && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <MessageSquare size={11} /> Comments
                  </p>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-slate-700 text-sm leading-relaxed italic">"{fb.comments}"</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Recommendation</p>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold ${
                    fb.would_recommend
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {fb.would_recommend
                      ? <><ThumbsUp size={14} /> Would Recommend</>
                      : <><ThumbsDown size={14} /> Would Not Recommend</>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock size={11} /> Submitted on{' '}
              {new Date(fb.submitted_at).toLocaleString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </span>
            <span className="font-mono">ID #{fb.feedback_id}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate(`/admin/edit/${fb.feedback_id}`)}
          className="btn-primary text-sm"
        >
          <Edit3 size={14} /> Edit This Feedback
        </button>
        <button onClick={() => navigate('/admin')} className="btn-secondary text-sm">
          Go to Admin Panel
        </button>
      </div>
    </div>
  )
}
