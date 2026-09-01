'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Select from 'react-select'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'

import AnimeSourceCard from '@/components/AnimeSourceCard'
import animapuApi from '@/apis/AnimapuApi'
import ChangeAnimeSourceModalOnly from '@/components/ChangeAnimeSourceModalOnly'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import AnimeCard from '@/components/AnimeCard'
import AnimeCardBar from '@/components/AnimeCardBar'

var page = 1
var onApiCall = false
export default function AnimeLatest({discoveryBar, contentOnly = false}) {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [activeSource, setActiveSource] = useState("")
  const [animes, setAnimes] = useState([
    {source: "shimmer-1", id: "1", shimmer: true},
    {source: "shimmer-2", id: "2", shimmer: true},
  ])
  const [showModal, setShowModal] = useState(false)

  const endReached = useRef(false)

  useEffect(() => {
    setActiveSource(animapuApi.GetActiveAnimeSource())
    endReached.current = false
    GetLatestAnime(false)
  }, [params, searchParams])

  async function GetLatestAnime(append) {
    if (!window) {return}

    if (onApiCall) {return}
    onApiCall = true

    if (endReached.current) { onApiCall = false; return }

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
        endReached.current = true
        onApiCall = false
        return
      }

      if (append) {
        setAnimes((current) => current.concat(body.data))
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

  useEffect(() => {
    let frame
    const handleScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = undefined
        if (document.documentElement.scrollHeight - window.scrollY - window.innerHeight <= 1200 && !onApiCall) {
          GetLatestAnime(true)
        }
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => { window.removeEventListener('scroll', handleScroll); cancelAnimationFrame(frame) }
  }, [])

  if (discoveryBar) {
    return (
      <div className="flex flex-row gap-4 flex-nowrap overflow-auto">
        {animes.map((oneAnimeData) => (
          // <AnimeSourceCard oneAnimeData={oneAnimeData} key={`${oneAnimeData.source}-${oneAnimeData.id}`} source={params.anime_source} />
          <AnimeCardBar anime={oneAnimeData} key={`${oneAnimeData.source}-${oneAnimeData.id}`} source={oneAnimeData.source} />
        ))}
      </div>
    )
  }

  if (contentOnly) {
    return <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 z-0">{animes.map((oneAnimeData) => <AnimeCard anime={oneAnimeData} key={`${oneAnimeData.source}-${oneAnimeData.id}`} source={oneAnimeData.source} />)}</div>
  }

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
          // <AnimeSourceCard oneAnimeData={oneAnimeData} key={`${oneAnimeData.source}-${oneAnimeData.id}`} source={params.anime_source} />
          <AnimeCard anime={oneAnimeData} key={`${oneAnimeData.source}-${oneAnimeData.id}`} source={oneAnimeData.source} />
        ))}
      </div>
    </div>
  )
}
