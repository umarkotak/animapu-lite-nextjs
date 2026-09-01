import { useEffect, useState } from "react"
import { BookOpen, ChevronDown, Play } from "lucide-react"
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
        <div className="flex items-center rounded-2xl border border-white/15 bg-background/95 p-2.5 shadow-2xl shadow-black/30 md:bg-background/65 md:backdrop-blur-2xl">
          <Button className="rounded-2xl h-11 px-5 text-sm" onClick={() => selectMedia("manga")} size="sm" variant={activeMedia === "manga" ? "default" : "ghost"}><BookOpen size={18} /> Manga</Button>
          <Button className="rounded-2xl h-11 px-5 text-sm" onClick={() => selectMedia("anime")} size="sm" variant={activeMedia === "anime" ? "default" : "ghost"}><Play size={18} /> Anime</Button>
          <span className="mx-2 h-8 w-px bg-white/15" />
          <Button className="h-11 max-w-40 justify-between px-4 text-sm" onClick={() => setShowSourceModal(true)} size="sm" variant="ghost"><span className="truncate">{source}</span><ChevronDown size={18} /></Button>
        </div>
      </div>
      {activeMedia === "anime" ? <ChangeAnimeSourceModalOnly show={showSourceModal} onClose={() => setShowSourceModal(false)} /> : <ChangeSourceModalOnly show={showSourceModal} onClose={() => setShowSourceModal(false)} />}
    </>
  )
}
