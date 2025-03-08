import { useState, useEffect } from 'react'

import animapuApi from "../apis/AnimapuApi"
import Manga from "../models/Manga"
import { toast } from 'react-toastify'
import Link from 'next/link'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import MangaCardV2 from '@/components/MangaCardV2'

var tempAllMangas = []
var limit = 16

var dummyMangas = [
  {source: "shimmer", source_id: "shimmer-1", shimmer: true},
  {source: "shimmer", source_id: "shimmer-2", shimmer: true},
]

export default function History() {
  const [onlineMangas, setOnlineMangas] = useState(dummyMangas)

  async function GetOnlineReadHistories() {
    try {
      const response = await animapuApi.GetUserReadHistoriesV2(10000, 1)
      const body = await response.json()

      if (response.status !== 200) {
        toast.error(`${body.error.error_code} || ${body.error.message}`)
        setOnlineMangas([])
        return
      }

      tempAllMangas = body.data
      const tempSelectedMangas = tempAllMangas.slice(0, limit)
      setOnlineMangas(tempSelectedMangas)

    } catch (e) {
      toast.error(e.message)
      setOnlineMangas([])
    }
  }

  useEffect(() => {
    GetOnlineReadHistories()
  }, [])

  useEffect(() => {
    SyncOnlineHistoriesToLocalStorage(onlineMangas)

  }, [onlineMangas])

  async function SyncOnlineHistoriesToLocalStorage(mangaHistories) {
    mangaHistories.map((mangaHistory) => {
      var mangaObj = new Manga(mangaHistory, localStorage.getItem("ANIMAPU_LITE:USER:UNIQUE_SHA"))
      localStorage.setItem(mangaObj.GetOnlineHistoryKey(), JSON.stringify(mangaHistory))
    })
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
    limit += limit
    const tempSelectedMangas = tempAllMangas.slice(0, limit)
    setOnlineMangas(tempSelectedMangas)
  }, [triggerNextPage])

  return (
    <div className='flex flex-col gap-4'>
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="flex justify-between items-center">
            <div>
              <h1 className='text-xl'>Read History</h1>
            </div>
            <div>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 z-0">
        {onlineMangas.map((manga, idx) => (
          <MangaCardV2 manga={manga} idx={idx} key={`${manga.source}-${manga.source_id}`} />
        ))}
      </div>
    </div>
  )
}
