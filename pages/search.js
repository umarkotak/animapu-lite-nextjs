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
              <Link href="/search_legacy">
                <Button>Old Search</Button>
              </Link>
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
            <div className="flex items-center space-x-2">
              <Switch
                id="global-search"
                checked={searchMode==="global"}
                onClick={()=>{searchMode==="global" ? setSearchMode("single") : setSearchMode("global")}}
              />
              <Label htmlFor="global-search">Global Search</Label>
            </div>
            <Button onClick={()=>SearchManga()}>
              <Search />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {
        isLoadMoreLoading ? <svg role="status" className="mx-auto w-8 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg> : <></>
      }

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 z-0">
        {mangas.map((manga, idx) => (
          <MangaCardV2 manga={manga} idx={idx} key={`${manga.source}-${manga.source_id}`} show_hover_source={true} />
        ))}
      </div>

      <ChangeSourceModalOnly show={showModal} onClose={closeModal} setMangaSourcesData={setMangaSourcesData} />
    </div>
  )
}
