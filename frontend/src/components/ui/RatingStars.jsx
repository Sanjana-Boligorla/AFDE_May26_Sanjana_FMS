import { Star } from 'lucide-react'

const LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' }
const COLORS = {
  1: 'text-red-500',
  2: 'text-orange-400',
  3: 'text-amber-500',
  4: 'text-green-500',
  5: 'text-emerald-500',
}

export default function RatingStars({ rating, showLabel = false, size = 'md', interactive = false, onRate }) {
  const sizes = { sm: 14, md: 16, lg: 22 }
  const px = sizes[size] || 16

  return (
    <span className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={px}
          onClick={() => interactive && onRate && onRate(s)}
          className={`${
            s <= rating ? COLORS[rating] : 'text-slate-300'
          } ${s <= rating ? 'fill-current' : ''} ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
        />
      ))}
      {showLabel && (
        <span className={`ml-1 text-xs font-semibold ${COLORS[rating]}`}>
          {LABELS[rating]}
        </span>
      )}
    </span>
  )
}

export { LABELS as RATING_LABELS, COLORS as RATING_COLORS }
