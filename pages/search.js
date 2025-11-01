import { useState, useEffect } from 'react'
import { useRouter } from "next/router"

import animapuApi from "../apis/AnimapuApi"
import ChangeSourceModalOnly from "../components/ChangeSourceModalOnly"
import ChangeAnimeSourceModalOnly from "../components/ChangeAnimeSourceModalOnly"
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Search } from 'lucide-react'
import MangaCardV2 from '@/components/MangaCardV2'
import AnimeCard from '@/components/AnimeCard'
import { LoadingSpinner } from '@/components/ui/icon'

var onApiCall = false
export default function Home() {
  let router = useRouter()
  const query = router.query

  // Toggle between manga and anime
  const [searchType, setSearchType] = useState("manga") // "manga" or "anime"

  // Manga states
  const [mangas, setMangas] = useState([])
  const [mangaSourcesData, setMangaSourcesData] = useState([])
  const [searchMode, setSearchMode] = useState("global")
  const [activeMangaSource, setActiveMangaSource] = useState("")
  const [showMangaModal, setShowMangaModal] = useState(false)

  // Anime states
  const [animes, setAnimes] = useState([])
  const [activeAnimeSource, setActiveAnimeSource] = useState("")
  const [showAnimeModal, setShowAnimeModal] = useState(false)

  // Shared states
  const [title, setTitle] = useState("")
  const [isLoadMoreLoading, setIsLoadMoreLoading] = useState(false)

  useEffect(() => {
    setActiveMangaSource(animapuApi.GetActiveMangaSource())
    setActiveAnimeSource(animapuApi.GetActiveAnimeSource())
  }, [])

  async function SearchManga() {
    if (onApiCall) {return}
    onApiCall = true
    try {
      setIsLoadMoreLoading(true)
      if (mangaSourcesData.length > 0 && searchMode === "global") {
        var tmpSearchData = []

        await Promise.all(mangaSourcesData.map(async (oneMangaSourceData) => {
          const response = await animapuApi.SearchManga({
            manga_source: oneMangaSourceData.value,
            title: title
          })
          const body = await response.json()
          if (response.status == 200) {
            tmpSearchData = tmpSearchData.concat(body.data)
          }
        }))

        setMangas(tmpSearchData)

      } else {
        const response = await animapuApi.SearchManga({
          manga_source: animapuApi.GetActiveMangaSource(),
          title: title
        })
        const body = await response.json()

        if (response.status == 200) {
          setMangas(body.data)
        } else {
          toast.error(body.error.message)
          console.error("FAIL", body)
        }
      }
      onApiCall = false
      setIsLoadMoreLoading(false)

    } catch (e) {
      console.error(e)
      onApiCall = false
      toast.error(e.message)
      setIsLoadMoreLoading(false)
    }
  }

  async function SearchAnime() {
    if (onApiCall) {return}
    onApiCall = true
    try {
      setIsLoadMoreLoading(true)
      const response = await animapuApi.SearchAnime({
        anime_source: activeAnimeSource,
        title: title
      })
      const body = await response.json()

      if (response.status == 200) {
        setAnimes(body.data)
      } else {
        toast.error(body.error.message)
        console.error("FAIL", body)
      }
      onApiCall = false
      setIsLoadMoreLoading(false)

    } catch (e) {
      console.error(e)
      onApiCall = false
      toast.error(e.message)
      setIsLoadMoreLoading(false)
    }
  }

  function handleSearch() {
    if (searchType === "manga") {
      SearchManga()
    } else {
      SearchAnime()
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSearch()
  }

  return (
    <div className='flex flex-col gap-2'>
      {/* Type Toggle Card */}
      <div>
        <div className="p-2">
          <div className="flex justify-between items-center">
            <h1 className='text-xl'>Search</h1>
            <div className="flex items-center space-x-2">
              <Label htmlFor="search-type">Manga</Label>
              <Switch
                id="search-type"
                checked={searchType === "anime"}
                onClick={() => setSearchType(searchType === "manga" ? "anime" : "manga")}
              />
              <Label htmlFor="search-type">Anime</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="global-search"
                checked={searchMode === "global"}
                onClick={() => setSearchMode(searchMode === "global" ? "single" : "global")}
              />
              <Label htmlFor="global-search">Global Search</Label>
            </div>
          </div>
        </div>
      </div>

      {/* Source Card */}
      <div>
        <div className="p-2">
          <div className="flex justify-between items-center">
            <div>
              <h1 className='text-xl'>
                {searchType === "manga" ? activeMangaSource : activeAnimeSource}
              </h1>
            </div>
            <div>
              <Button onClick={() => {
                if (searchType === "manga") {
                  setShowMangaModal(true)
                } else {
                  setShowAnimeModal(true)
                }
              }}>
                Ganti Sumber
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Card */}
      <div>
        <div className="p-2">
          <div className='flex items-center gap-2'>
            <Input
              type="text"
              placeholder="Search"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e)}
            />
            <Button onClick={handleSearch}>
              <Search />
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Loading Spinner */}
      {isLoadMoreLoading ? <LoadingSpinner /> : <></>}

      {/* Results Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 z-0">
        {searchType === "manga"
          ? mangas.map((manga, idx) => (
              <MangaCardV2
                manga={manga}
                idx={idx}
                key={`${manga.source}-${manga.source_id}`}
                show_hover_source={true}
              />
            ))
          : animes.map((oneAnimeData) => (
              <AnimeCard
                anime={oneAnimeData}
                key={`${oneAnimeData.source}-${oneAnimeData.id}`}
                source={oneAnimeData.source}
              />
            ))
        }
      </div>

      {/* Modals */}
      <ChangeSourceModalOnly
        show={showMangaModal}
        onClose={() => setShowMangaModal(false)}
        setMangaSourcesData={setMangaSourcesData}
      />
      <ChangeAnimeSourceModalOnly
        show={showAnimeModal}
        onClose={() => setShowAnimeModal(false)}
      />
    </div>
  )
}