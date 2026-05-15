import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <p className="text-8xl font-black text-slate-200 leading-none">404</p>
      <p className="text-2xl font-bold text-slate-700 mt-4">Page Not Found</p>
      <p className="text-slate-400 mt-2 max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="flex gap-3 mt-8">
        <button onClick={() => navigate(-1)} className="btn-secondary">
          <ArrowLeft size={15} /> Go Back
        </button>
        <button onClick={() => navigate('/')} className="btn-primary">
          <Home size={15} /> Dashboard
        </button>
      </div>
    </div>
  )
}
