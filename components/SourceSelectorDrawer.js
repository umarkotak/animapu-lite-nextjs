import { useEffect, useState } from "react"
import animapuApi from "@/apis/AnimapuApi"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"

export default function SourceSelectorDrawer({ mediaType, show, onClose, setMangaSourcesData }) {
  const [sources, setSources] = useState([])
  const isAnime = mediaType === "anime"

  useEffect(() => {
    if (!show) return

    async function loadSources() {
      try {
        const response = isAnime ? await animapuApi.GetAnimeSourceList({}) : await animapuApi.GetSourceList({})
        const body = await response.json()
        if (response.status !== 200) return
        const activeSources = body.data.filter((source) => source.active)
        setSources(activeSources)
        setMangaSourcesData?.(activeSources.map((source) => ({ value: source.id })))
      } catch (error) {
        console.error(error)
      }
    }

    loadSources()
  }, [show, isAnime, setMangaSourcesData])

  function selectSource(source) {
    localStorage.setItem(isAnime ? "ANIMAPU_LITE:ACTIVE_ANIME_SOURCE" : "ANIMAPU_LITE:ACTIVE_MANGA_SOURCE", source.id)
    window.location.reload()
  }

  return (
    <Drawer open={show} onOpenChange={(open) => !open && onClose?.()}>
      <DrawerContent className="mx-auto max-h-[80vh] max-w-2xl">
        <DrawerHeader><DrawerTitle>Select {isAnime ? "Anime" : "Manga"} Source</DrawerTitle></DrawerHeader>
        <div className="overflow-y-auto px-4 pb-6">
          <div className="flex flex-col gap-2">
            {sources.map((source) => (
              <button className="flex items-center justify-between rounded-xl border border-border bg-accent/50 p-3 text-left transition hover:bg-accent" key={source.id} onClick={() => selectSource(source)}>
                <span className="flex items-center gap-3"><img className="h-7 w-7" src={`/images/flags/${source.language}.png`} alt="" /><span><span className="block font-medium">{source.title}</span><span className="text-xs text-muted-foreground">{source.status}</span></span></span>
              </button>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
