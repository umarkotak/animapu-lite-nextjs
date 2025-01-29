import { useState, useEffect } from 'react'

import BottomMenuBar from "../components/BottomMenuBar"
import MangaCard from "../components/MangaCard"
import animapuApi from "../apis/AnimapuApi"
import Manga from "../models/Manga"
import { CloudIcon, FolderIcon, HistoryIcon } from 'lucide-react'
import { toast } from 'react-toastify'
import AdsFloater from '@/components/AdsFloater'
import Link from 'next/link'

var tempAllMangas = []
var limit = 16

export default function History() {
  const [darkMode, setDarkMode] = useState(true)
  useEffect(() => {
    if (!localStorage) {return}
    if (localStorage.getItem("ANIMAPU_LITE:DARK_MODE") === "true") {
      setDarkMode(true)
    } else { setDarkMode(false) }
  }, [])

  var dummyMangas = [
    {id: "dummy-1", shimmer: true},
    {id: "dummy-2", shimmer: true},
    {id: "dummy-3", shimmer: true}
  ]

  const [onlineMangas, setOnlineMangas] = useState(dummyMangas)

  async function GetOnlineReadHistories() {
    try {
      const response = await animapuApi.GetUserReadHistoriesV2()
      const body = await response.json()

      if (response.status !== 200) {
        toast.error(`${body.error.error_code} || ${body.error.message}`)
        setOnlineMangas([])
        return
      }

      tempAllMangas = body.data.manga_histories
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
    <>
      <AdsFloater />

      <div className={`${darkMode ? "dark bg-stone-900" : "bg-[#d6e0ef]"} min-h-screen pb-60`}>
        <div className="bg-[#2b2d42] h-[140px] mb-[-100px]">
          <div className="container mx-auto max-w-[768px] pt-2">
            <div className="flex justify-between">
              <span className="px-4 mb-4 text-white">
                History
              </span>
              <span className="px-4 mb-4 text-white flex gap-2">
                <Link className={`mx-2 flex items-center gap-1`} href="/history_legacy"><HistoryIcon size={18} /> Old History</Link>
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <div className="container mx-auto max-w-[768px]">
            <div className="grid grid-rows-1 grid-flow-col mx-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 z-0">
                {onlineMangas.map((manga, idx) => (
                  <MangaCard manga={manga} idx={idx} key={`online-${idx}-${manga.id}`} card_type="history" remove_margination={true} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <BottomMenuBar />
      </div>
    </>
  )
}
