import { useState, useEffect } from 'react'
import { useRouter } from "next/router"

import { toast } from 'react-toastify'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/icon'
import animapuApi from '@/apis/AnimapuApi'
import ChangeAnimeSourceModalOnly from '@/components/ChangeAnimeSourceModalOnly'
import AnimeCard from '@/components/AnimeCard'

var onApiCall = false
export default function Home() {
  let router = useRouter()
  const query = router.query

  const [animes, setAnimes] = useState([])
  const [title, setTitle] = useState("")
  const [activeSource, setActiveSource] = useState("")
  const [isLoadMoreLoading, setIsLoadMoreLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    setActiveSource(animapuApi.GetActiveAnimeSource())
  }, [])

  async function SearchAnime() {
    if (onApiCall) {return}
    onApiCall = true
    try {
      setIsLoadMoreLoading(true)
      const response = await animapuApi.SearchAnime({
        anime_source: activeSource,
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

  function handleKeyDown(e) {
    if (e.key === "Enter") SearchAnime()
  }

  return (
    <div className='flex flex-col gap-4'>
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="flex justify-between items-center">
            <div>
              <h1 className="text-xl">{activeSource}</h1>
            </div>
            <div>
              <Button onClick={()=>{setShowModal(true)}}>Ganti Sumber</Button>
              <ChangeAnimeSourceModalOnly show={showModal} onClose={()=>setShowModal(false)} />
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
            <Button onClick={()=>SearchAnime()}>
              <Search />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      { isLoadMoreLoading ? <LoadingSpinner /> : <></>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 z-0">
        {animes.map((oneAnimeData) => (
          <AnimeCard anime={oneAnimeData} key={`${oneAnimeData.source}-${oneAnimeData.id}`} source={oneAnimeData.source} />
        ))}
      </div>
    </div>
  )
}
