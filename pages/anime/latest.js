'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Select from 'react-select'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'

import AnimeSourceCard from '@/components/AnimeSourceCard'
import AnimeHistoryCard from '@/components/AnimeHistoryCard'
import animapuApi from '@/apis/AnimapuApi'
import ChangeAnimeSourceModalOnly from '@/components/ChangeAnimeSourceModalOnly'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

var page = 1
var onApiCall = false
export default function AnimeSourceHome() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [activeSource, setActiveSource] = useState("")
  const [animes, setAnimes] = useState([])
  const [showModal, setShowModal] = useState(false)

  var endReached = false

  useEffect(() => {
    setActiveSource(animapuApi.GetActiveAnimeSource())
    GetLatestAnime(false)
  }, [params, searchParams])

  async function GetLatestAnime(append) {
    if (!window) {return}

    if (onApiCall) {return}
    onApiCall = true

    if (endReached) {return}

    if (!append) {
      page = 1
    }

    try {
      const response = await animapuApi.GetLatestAnime({
        anime_source: animapuApi.GetActiveAnimeSource(),
        page: page,
      })
      const body = await response.json()
      if (response.status !== 200) {
        console.log("error", body)
        onApiCall = false
        return
      }

      if (body.data && body.data.length <= 0) {
        endReached = true
        onApiCall = false
        return
      }

      if (append) {
        setAnimes(animes.concat(body.data))
      } else {
        setAnimes(body.data)
      }
      page = page + 1
      onApiCall = false

    } catch (e) {
      console.error(e.message)
      onApiCall = false
    }
  }

  const [triggerNextPage, setTriggerNextPage] = useState(0)
  const handleScroll = () => {
    var position = window.pageYOffset
    var maxPosition = document.documentElement.scrollHeight - document.documentElement.clientHeight

    if (maxPosition-position <= 1200) {
      setTriggerNextPage(position)
    }
  }
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])
  useEffect(() => {
    GetLatestAnime(true)
  }, [triggerNextPage])

  return (
    <div className="flex flex-col gap-4">
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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 z-0">
        {animes.map((oneAnimeData) => (
          <AnimeSourceCard oneAnimeData={oneAnimeData} key={`${oneAnimeData.source}-${oneAnimeData.id}`} source={params.anime_source} />
        ))}
      </div>
    </div>
  )
}
