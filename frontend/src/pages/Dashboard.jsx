import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import {
  MessageSquare, Star, ThumbsUp, TrendingUp,
  ArrowRight, User, BookOpen, Calendar, Trophy,
  GraduationCap, Building2, Target, Zap
} from 'lucide-react'
import { dashboardApi } from '../services/api'
import StatCard from '../components/ui/StatCard'
import RatingStars from '../components/ui/RatingStars'
import Badge from '../components/ui/Badge'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const RATING_LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'V.Good', 5: 'Excellent' }
const RATING_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#10b981']
const PIE_COLORS    = ['#6366f1', '#8b5cf6', '#f59e0b', '#10b981', '#94a3b8']
const DEPT_COLORS   = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#06b6d4','#f97316']

const DarkTooltip = ({ active, payload, label, labelMap }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 text-white px-3 py-2 rounded-lg shadow-xl text-sm">
      <p className="font-semibold">{labelMap ? labelMap[label] : label}</p>
      <p className="text-slate-300">{payload[0].value} responses</p>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats]             = useState(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(false)
  const [chartsReady, setChartsReady] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    dashboardApi.getStats()
      .then(r => setStats(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  // Mount charts slightly after data arrives so Recharts
  // always gets a clean container measurement and fires animation
  useEffect(() => {
    if (stats) {
      const t = setTimeout(() => setChartsReady(true), 150)
      return () => clearTimeout(t)
    }
  }, [stats])

  if (loading) return <LoadingSpinner text="Loading dashboard..." />
  if (error || !stats) return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="text-6xl mb-4">⚠️</div>
      <h2 className="text-xl font-bold text-slate-700">Unable to load dashboard</h2>
      <p className="text-slate-400 mt-2 max-w-sm text-sm">
        The backend server is not responding. Make sure uvicorn is running on port 8000.
      </p>
      <code className="mt-3 text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg">
        uvicorn main:app --reload
      </code>
      <button
        onClick={() => { setError(false); setLoading(true); dashboardApi.getStats().then(r => setStats(r.data)).catch(() => setError(true)).finally(() => setLoading(false)) }}
        className="btn-primary mt-5 text-sm"
      >
        Retry
      </button>
    </div>
  )

  const ratingData = Object.entries(stats.rating_distribution).map(([k, v]) => ({
    rating: Number(k), count: v,
  }))

  const categoryData = Object.entries(stats.category_distribution).map(([k, v]) => ({
    name: k, value: v,
  }))

  const deptData = Object.entries(stats.department_distribution || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  const maxDept = deptData[0]?.[1] || 1

  return (
    <div className="space-y-5">

      {/* ── Stat Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Feedback"    value={stats.total_feedback}           subtitle="All time submissions"    icon={MessageSquare} color="indigo"  />
        <StatCard title="Average Rating"    value={`${stats.average_rating} / 5`}  subtitle="Across all entries"      icon={Star}          color="amber"   />
        <StatCard title="Would Recommend"   value={`${stats.recommend_percentage}%`} subtitle="Recommendation rate"   icon={ThumbsUp}      color="emerald" />
        <StatCard title="Active Categories" value={Object.keys(stats.category_distribution).length} subtitle="Feedback types" icon={TrendingUp} color="violet" />
      </div>

      {/* ── Quick Insights Strip ───────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Top Program */}
        <div className="card p-4 flex items-center gap-3 border-l-4 border-indigo-500">
          <div className="bg-indigo-100 p-2.5 rounded-lg flex-shrink-0">
            <Trophy className="text-indigo-600 w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Top Program</p>
            <p className="text-sm font-bold text-slate-800 truncate" title={stats.top_programs[0]?.program_name}>
              {stats.top_programs[0]?.program_name || '—'}
            </p>
            <p className="text-xs text-slate-500">{stats.top_programs[0]?.count} responses · ⭐ {stats.top_programs[0]?.avg_rating}</p>
          </div>
        </div>

        {/* Top Trainer */}
        <div className="card p-4 flex items-center gap-3 border-l-4 border-amber-500">
          <div className="bg-amber-100 p-2.5 rounded-lg flex-shrink-0">
            <GraduationCap className="text-amber-600 w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Top Trainer</p>
            <p className="text-sm font-bold text-slate-800 truncate" title={stats.top_trainers[0]?.trainer_name}>
              {stats.top_trainers[0]?.trainer_name || '—'}
            </p>
            <p className="text-xs text-slate-500">{stats.top_trainers[0]?.count} sessions · ⭐ {stats.top_trainers[0]?.avg_rating}</p>
          </div>
        </div>

        {/* Most Active Dept */}
        <div className="card p-4 flex items-center gap-3 border-l-4 border-emerald-500">
          <div className="bg-emerald-100 p-2.5 rounded-lg flex-shrink-0">
            <Building2 className="text-emerald-600 w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Most Active Dept</p>
            <p className="text-sm font-bold text-slate-800 truncate">{deptData[0]?.[0] || '—'}</p>
            <p className="text-xs text-slate-500">{deptData[0]?.[1]} submissions</p>
          </div>
        </div>

        {/* Satisfaction score */}
        <div className="card p-4 flex items-center gap-3 border-l-4 border-violet-500">
          <div className="bg-violet-100 p-2.5 rounded-lg flex-shrink-0">
            <Target className="text-violet-600 w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Satisfaction Score</p>
            <p className="text-2xl font-black text-violet-600 leading-tight">
              {Math.round(stats.average_rating / 5 * 100)}
              <span className="text-sm font-semibold text-slate-400">%</span>
            </p>
            <p className="text-xs text-slate-500">Based on avg rating</p>
          </div>
        </div>
      </div>

      {/* ── Charts Row ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Rating Distribution */}
        <div className="card p-5">
          <div className="mb-4">
            <h2 className="section-title">Rating Distribution</h2>
            <p className="text-xs text-slate-400 mt-0.5">Number of responses per rating level</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
           {chartsReady ? <BarChart data={ratingData} barSize={44}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="rating" tickFormatter={v => RATING_LABELS[v]} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<DarkTooltip labelMap={RATING_LABELS} />} cursor={{ fill: '#f8fafc' }} />
              <Bar
                dataKey="count"
                radius={[6,6,0,0]}
                isAnimationActive={true}
                animationBegin={0}
                animationDuration={900}
                animationEasing="ease-out"
              >
                {ratingData.map((e, i) => <Cell key={i} fill={RATING_COLORS[e.rating - 1]} />)}
              </Bar>
            </BarChart> : <div className="h-[200px] flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"/></div>}
          </ResponsiveContainer>
        </div>

        {/* Category Donut */}
        <div className="card p-5">
          <div className="mb-4">
            <h2 className="section-title">By Category</h2>
            <p className="text-xs text-slate-400 mt-0.5">Feedback type breakdown</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            {chartsReady ? <PieChart>
              <Pie
                data={categoryData}
                cx="50%" cy="45%"
                innerRadius={50} outerRadius={75}
                paddingAngle={3}
                dataKey="value"
                isAnimationActive={true}
                animationBegin={0}
                animationDuration={1100}
                animationEasing="ease-out"
              >
                {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '13px' }}
                labelStyle={{ color: '#f8fafc', fontWeight: '600' }}
                itemStyle={{ color: '#94a3b8' }}
                formatter={(value, name) => [
                  <span style={{ color: '#f8fafc', fontWeight: '600' }}>{value} responses</span>,
                  <span style={{ color: '#94a3b8' }}>{name}</span>
                ]}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
            </PieChart> : <div className="h-[200px] flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"/></div>}
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Leaderboards Row ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Top Programs */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="text-indigo-500 w-4 h-4" />
            <h2 className="section-title">Top Programs</h2>
          </div>
          <div className="space-y-3">
            {stats.top_programs.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                  i === 0 ? 'bg-amber-100 text-amber-700' :
                  i === 1 ? 'bg-slate-100 text-slate-600' :
                  i === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-slate-50 text-slate-500'
                }`}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate" title={p.program_name}>
                    {p.program_name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                      <div
                        className="bg-indigo-500 h-1.5 rounded-full"
                        style={{ width: `${(p.count / (stats.top_programs[0]?.count || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">{p.count} · ⭐{p.avg_rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Trainers */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="text-amber-500 w-4 h-4" />
            <h2 className="section-title">Top Trainers</h2>
          </div>
          <div className="space-y-3">
            {stats.top_trainers.map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-700 font-bold text-xs">{t.trainer_name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate" title={t.trainer_name}>
                    {t.trainer_name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <RatingStars rating={Math.round(t.avg_rating)} size="sm" />
                    <span className="text-xs text-slate-400">{t.avg_rating} · {t.count} session{t.count !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="text-emerald-500 w-4 h-4" />
            <h2 className="section-title">By Department</h2>
          </div>
          <div className="space-y-3">
            {deptData.map(([dept, count], i) => (
              <div key={dept} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-slate-700 truncate">{dept}</p>
                    <span className="text-xs font-semibold text-slate-500 ml-2 flex-shrink-0">{count}</span>
                  </div>
                  <div className="bg-slate-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${(count / maxDept) * 100}%`,
                        backgroundColor: DEPT_COLORS[i % DEPT_COLORS.length]
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Feedback ────────────────────────────── */}
      <div className="card">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
          <div>
            <h2 className="section-title">Recent Feedback</h2>
            <p className="text-xs text-slate-400 mt-0.5">Latest 5 submissions</p>
          </div>
          <button
            onClick={() => navigate('/feedback')}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight size={14} />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {stats.recent_feedback.map((fb) => (
            <div
              key={fb.feedback_id}
              onClick={() => navigate(`/feedback/${fb.feedback_id}`)}
              className="px-5 py-3.5 flex items-center gap-4 hover:bg-indigo-50/40 cursor-pointer transition-colors group"
            >
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-700 font-bold text-sm">{fb.participant_name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-slate-800 text-sm">{fb.participant_name}</p>
                  {fb.department && <span className="text-xs text-slate-400">· {fb.department}</span>}
                  <Badge label={fb.category} type={fb.category} />
                </div>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <BookOpen size={11} /> {fb.program_name}
                  </span>
                  {fb.trainer_name && (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <User size={11} /> {fb.trainer_name}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <RatingStars rating={fb.rating} showLabel size="sm" />
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar size={10} />
                  {new Date(fb.submitted_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
