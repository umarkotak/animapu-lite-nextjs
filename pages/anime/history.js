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
import AnimeCard from '@/components/AnimeCard'
import AdsCard from '@/components/AdsCard'
import AnimeCardBar from '@/components/AnimeCardBar'

var onApiCall = false
export default function AnimeHistory({discoveryBar}) {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [animes, setAnimes] = useState([
    {source: "shimmer-1", id: "1", shimmer: true},
    {source: "shimmer-2", id: "2", shimmer: true},
  ])

  useEffect(() => {
    GetAnimeHistory()
  }, [params, searchParams])

  async function GetAnimeHistory() {
    if (!window) {return}

    if (onApiCall) {return}
    onApiCall = true

    try {
      const response = await animapuApi.GetAnimeHistory({})
      const body = await response.json()
      if (response.status !== 200) {
        console.log("error", body)
        onApiCall = false
        return
      }

      if (body.data && body.data.length <= 0) {
        onApiCall = false
        return
      }

      setAnimes(body.data)
      onApiCall = false

    } catch (e) {
      console.error(e.message)
      onApiCall = false
    }
  }

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

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="flex justify-between items-center">
            <div>
              <h1 className='text-xl'>Watch History</h1>
            </div>
            <div>
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
