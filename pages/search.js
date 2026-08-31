import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { ArrowLeft, Search as SearchIcon } from "lucide-react"
import animapuApi from "@/apis/AnimapuApi"
import AnimeCard from "@/components/AnimeCard"
import MangaCardV2 from "@/components/MangaCardV2"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoadingSpinner } from "@/components/ui/icon"
import { Badge } from "@/components/ui/badge"

export default function Search() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [sources, setSources] = useState([])
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadSources() {
      try {
        const [mangaResponse, animeResponse] = await Promise.all([animapuApi.GetSourceList({}), animapuApi.GetAnimeSourceList({})])
        const [mangaBody, animeBody] = await Promise.all([mangaResponse.json(), animeResponse.json()])
        const mangaSources = mangaBody.data?.filter((source) => source.active).map((source) => ({ ...source, mediaType: "manga" })) || []
        const animeSources = animeBody.data?.filter((source) => source.active).map((source) => ({ ...source, mediaType: "anime" })) || []
        const activeManga = animapuApi.GetActiveMangaSource()
        const activeAnime = animapuApi.GetActiveAnimeSource()
        setSources([
          ...mangaSources.filter((source) => source.id === activeManga),
          ...animeSources.filter((source) => source.id === activeAnime),
          ...mangaSources.filter((source) => source.id !== activeManga),
          ...animeSources.filter((source) => source.id !== activeAnime),
        ])
      } catch (error) {
        console.error(error)
      }
    }

    loadSources()
  }, [])

  async function searchSource(source) {
    try {
      const response = source.mediaType === "anime"
        ? await animapuApi.SearchAnime({ anime_source: source.id, title })
        : await animapuApi.SearchManga({ manga_source: source.id, title })
      const body = await response.json()
      return response.status === 200 && body.data?.length ? { ...source, items: body.data } : null
    } catch (error) {
      console.error(error)
      return null
    }
  }

  async function handleSearch() {
    if (!title.trim() || !sources.length) return
    setLoading(true)
    setSections([])
    const results = await Promise.all(sources.map(searchSource))
    setSections(results.filter(Boolean))
    setLoading(false)
  }

  return (
    <div className="relative min-h-screen overflow-x-clip px-4 py-5">
      <div className="pointer-events-none absolute -top-16 left-1/2 h-64 w-screen -translate-x-1/2 rounded-b-[50%] bg-gradient-to-b from-purple-500/30 via-fuchsia-500/20 to-pink-500/0 blur-3xl" />
      <div className="relative flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button aria-label="Go home" onClick={() => router.push("/home")} size="icon" variant="ghost"><ArrowLeft size={20} /></Button>
          <h1 className="text-xl font-semibold">Search</h1>
        </div>
        <div className="flex items-center gap-2">
          <Input className="h-11 bg-background/50 backdrop-blur" onChange={(event) => setTitle(event.target.value)} onKeyDown={(event) => event.key === "Enter" && handleSearch()} placeholder="Search manga and anime" value={title} />
          <Button disabled={!sources.length || loading} onClick={handleSearch} size="icon"><SearchIcon size={20} /></Button>
        </div>

        {loading && <div className="flex justify-center py-12"><LoadingSpinner /></div>}
        {!loading && !sections.length && <p className="py-16 text-center text-sm text-muted-foreground">Search all active manga and anime sources.</p>}

        <div className="mt-8 flex flex-col gap-9">
          {sections.map((section) => (
            <section key={`${section.mediaType}-${section.id}`}>
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <Badge variant="secondary" className="uppercase">{section.mediaType}</Badge>
                <span>{section.title || section.id}</span>
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {section.items.map((item) => <div className="w-[175px] flex-none" key={`${section.id}-${item.id || item.source_id}`}>{section.mediaType === "anime" ? <AnimeCard anime={item} source={section.id} /> : <MangaCardV2 manga={item} />}</div>)}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
