import { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen, ChevronDown, Play, Search } from "lucide-react"
import animapuApi from "@/apis/AnimapuApi"
import ChangeAnimeSourceModalOnly from "@/components/ChangeAnimeSourceModalOnly"
import ChangeSourceModalOnly from "@/components/ChangeSourceModalOnly"
import { Button } from "@/components/ui/button"

export default function HomeMediaMenu({ activeMedia, onMediaChange }) {
  const [showSourceModal, setShowSourceModal] = useState(false)
  const [source, setSource] = useState("")

  useEffect(() => {
    setSource(activeMedia === "anime" ? animapuApi.GetActiveAnimeSource() : animapuApi.GetActiveMangaSource())
  }, [activeMedia])

  function selectMedia(media) {
    onMediaChange(media)
  }

  return (
    <>
      <div className="fixed inset-x-0 bottom-2 z-40 flex justify-center px-2">
        <div className="flex items-center rounded-2xl border border-white/15 bg-background/65 p-2 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <Button className="h-11 shrink-0 rounded-2xl px-2 text-xs sm:px-5 sm:text-sm" onClick={() => selectMedia("manga")} size="sm" variant={activeMedia === "manga" ? "default" : "ghost"}><BookOpen size={18} /><span>Manga</span></Button>
          <Button className="h-11 shrink-0 rounded-2xl px-2 text-xs sm:px-5 sm:text-sm" onClick={() => selectMedia("anime")} size="sm" variant={activeMedia === "anime" ? "default" : "ghost"}><Play size={18} /><span>Anime</span></Button>
          <span className="mx-1 h-8 w-px shrink-0 bg-white/15 sm:mx-2" />
          <Button className="h-11 min-w-0 flex-1 justify-between px-2 text-xs sm:max-w-40 sm:px-4 sm:text-sm" onClick={() => setShowSourceModal(true)} size="sm" variant="ghost"><span className="truncate">{source}</span><ChevronDown className="shrink-0" size={18} /></Button>
          <Button aria-label="Search" asChild className="size-11 rounded-2xl" size="sm" variant="ghost"><Link href="/search"><Search size={18} /></Link></Button>
        </div>
      </div>
      {activeMedia === "anime" ? <ChangeAnimeSourceModalOnly show={showSourceModal} onClose={() => setShowSourceModal(false)} /> : <ChangeSourceModalOnly show={showSourceModal} onClose={() => setShowSourceModal(false)} />}
    </>
  )
}
