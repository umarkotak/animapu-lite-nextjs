import { useState } from "react"
import { BookOpen, Play } from "lucide-react"
import HistoryDrawer from "@/components/HistoryDrawer"

export default function HistoryCard({ history, compact = false }) {
  const [showModal, setShowModal] = useState(false)

  if (history.shimmer) {
    return <div className={`${compact ? "w-[220px] h-[112px] flex-none" : "w-full h-[280px]"} animate-pulse rounded-2xl border border-white/10 bg-white/5`} />
  }

  const isAnime = history.media_type === "anime"
  const Icon = isAnime ? Play : BookOpen
  const progressLabel = isAnime ? "Episode" : "Chapter"
  const cover = history.cover_urls?.[0] || "/images/default-book.png"
  return (
    <div className={compact ? "flex-none" : "w-full"}>
      {showModal && <HistoryDrawer history={history} open={showModal} onOpenChange={setShowModal} />}
      <button type="button" onClick={() => setShowModal(true)} aria-label={`Open ${history.title}`} className={`group relative block overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left backdrop-blur-xl transition hover:-translate-y-1 hover:border-primary/60 hover:bg-white/10 ${compact ? "w-[220px] h-[160px]" : "w-full h-[280px]"}`}>
        <img className={`absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105 ${compact ? "opacity-55" : "opacity-75"}`} src={cover} alt="" decoding="async" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/5" />
        <div className="relative flex h-full flex-col justify-between p-3 text-white">
          <span className="inline-flex w-fit items-center gap-1 rounded-full border border-white/20 bg-black/35 px-2 py-1 text-[10px] font-medium uppercase tracking-wider backdrop-blur-md"><Icon size={12} /> {history.media_type}</span>
          <div>
            <p className="line-clamp-2 text-sm font-semibold">{history.title}</p>
            <p className="mt-1 text-xs text-white/75">{progressLabel.toLowerCase()} {history.progress}</p>
            {!compact && <p className="mt-1 text-xs text-primary">Latest {progressLabel.toLowerCase()} {history.latest_number}</p>}
          </div>
        </div>
      </button>
    </div>
  )
}
