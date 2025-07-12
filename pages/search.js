import { useState, useEffect } from 'react'
import { useRouter } from "next/router"

import animapuApi from "../apis/AnimapuApi"
import ChangeSourceModalOnly from "../components/ChangeSourceModalOnly"
import { toast } from 'react-toastify'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Search } from 'lucide-react'
import MangaCardV2 from '@/components/MangaCardV2'
import { LoadingSpinner } from '@/components/ui/icon'

var onApiCall = false
export default function Home() {
  let router = useRouter()
  const query = router.query

  const [mangas, setMangas] = useState([])
  const [title, setTitle] = useState("")
  const [activeSource, setActiveSource] = useState("")
  const [isLoadMoreLoading, setIsLoadMoreLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const closeModal = () => {
    setShowModal(false)
  }
  const [mangaSourcesData, setMangaSourcesData] = useState([])
  const [searchMode, setSearchMode] = useState("global")

  useEffect(() => {
    setActiveSource(animapuApi.GetActiveMangaSource())
  }, [])

  async function SearchManga() {
    if (onApiCall) {return}
    onApiCall = true
    try {
      setIsLoadMoreLoading(true)
      if (mangaSourcesData.length > 0 && searchMode === "global") {
        // console.log(mangaSourcesData)

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

  function handleKeyDown(e) {
    if (e.key === "Enter") SearchManga()
  }

  return (
    <div className='flex flex-col gap-4'>
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="flex justify-between items-center">
            <div>
              <h1 className='text-xl'>{activeSource}</h1>
            </div>
            <div>
              <Button onClick={()=>{setShowModal(true)}}>Ganti Sumber</Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="p-4">
          <CardTitle className="flex justify-between items-center">
            <div>
              <h1 className='text-xl'>Search</h1>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="global-search"
                  checked={searchMode==="global"}
                  onClick={()=>{searchMode==="global" ? setSearchMode("single") : setSearchMode("global")}}
                />
                <Label htmlFor="global-search">Global Search</Label>
              </div>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4">
          <div className='flex items-center gap-2'>
            <Input
              type="text"
              placeholder="Search"
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e)}
            />
            <Button onClick={()=>SearchManga()}>
              <Search />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      { isLoadMoreLoading ? <LoadingSpinner /> : <></>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 z-0">
        {mangas.map((manga, idx) => (
          <MangaCardV2 manga={manga} idx={idx} key={`${manga.source}-${manga.source_id}`} show_hover_source={true} />
        ))}
      </div>

      <ChangeSourceModalOnly show={showModal} onClose={closeModal} setMangaSourcesData={setMangaSourcesData} />
    </div>
  )
}
