import { useState, useEffect } from 'react'

import BottomMenuBar from "../components/BottomMenuBar"
import MangaCard from "../components/MangaCard"
import animapuApi from "../apis/AnimapuApi"
import { useAlert } from 'react-alert'
import Manga from "../models/Manga"

export default function Home() {
  const alert = useAlert()

  const [activeTab, setActiveTab] = useState("local")

  const [mangas, setMangas] = useState([
    {id: "dummy-1", shimmer: true},
    {id: "dummy-2", shimmer: true},
    {id: "dummy-3", shimmer: true}
  ])
  const [onlineMangas, setOnlineMangas] = useState([
    {id: "dummy-1", shimmer: true},
    {id: "dummy-2", shimmer: true},
    {id: "dummy-3", shimmer: true}
  ])

  async function GetLocalReadHistories() {
    var listKey = `ANIMAPU_LITE:HISTORY:LOCAL:LIST`
    var historyArrayString = localStorage.getItem(listKey)

    if (historyArrayString) {
      setMangas(JSON.parse(historyArrayString))
    } else {
      setMangas([])
    }
  }

  async function GetOnlineReadHistories() {
    if (typeof window !== "undefined" && localStorage.getItem("ANIMAPU_LITE:USER:LOGGED_IN") !== "true") {
      setOnlineMangas([])
      return
    }

    try {
      const response = await animapuApi.GetUserReadHistories({uid: localStorage.getItem("ANIMAPU_LITE:USER:UNIQUE_SHA")})
      const body = await response.json()

      if (response.status !== 200) {
        alert.error(`${body.error.error_code} || ${body.error.message}`)
        setOnlineMangas([])
        setIsLoadMoreLoading(false)
        return
      }

      setOnlineMangas(body.data.manga_histories)
      SyncOnlineHistoriesToLocalStorage(body.data.manga_histories)

    } catch (e) {
      alert.error(e.message)
      setOnlineMangas([])
    }
  }

  useEffect(() => {
    GetLocalReadHistories()
    GetOnlineReadHistories()

    if (typeof window !== "undefined" && localStorage.getItem("ANIMAPU_LITE:USER:LOGGED_IN") === "true") {
      setActiveTab("online")
    }
  // eslint-disable-next-line
  }, [])

  function getTabColor(tabString) {
    if (activeTab === tabString) {
      return "text-[#3db3f2]"
    }
    return "hover:text-[#3db3f2]"
  }

  function SyncOnlineHistoriesToLocalStorage(mangaHistories) {
    mangaHistories.map((mangaHistory) => {
      var mangaObj = new Manga(mangaHistory, localStorage.getItem("ANIMAPU_LITE:USER:UNIQUE_SHA"))
      localStorage.setItem(mangaObj.GetOnlineHistoryKey(), JSON.stringify(mangaHistory))
    })
  }

  return (
    <div className="min-h-screen pb-60 bg-[#d6e0ef]">
      <div className="bg-[#2b2d42] h-[140px] mb-[-100px]">
        <div className="container mx-auto max-w-[1040px] pt-2">
          <div className="flex justify-between">
            <span className="px-4 mb-4 text-white">
              History
            </span>
            <span className="px-4 mb-4 text-white">
              <button className={`mx-2 ${getTabColor("local")}`} onClick={()=>{setActiveTab("local")}}><i className="fa-solid fa-file"></i> Local</button>
              <button className={`mx-2 ${getTabColor("online")}`} onClick={()=>{setActiveTab("online")}}><i className="fa-solid fa-cloud"></i> Online</button>
            </span>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <div className="container mx-auto max-w-[1040px]">
          <div className="grid grid-rows-1 grid-flow-col">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
              {(activeTab === "local") &&
                mangas.map((manga, idx) => (
                  <MangaCard manga={manga} idx={idx} key={`local-${idx}-${manga.id}`} card_type="history" />
                ))
              }
              {(activeTab === "online") &&
                onlineMangas.map((manga, idx) => (
                  <MangaCard manga={manga} idx={idx} key={`online-${idx}-${manga.id}`} card_type="history" />
                ))
              }
            </div>
          </div>
        </div>
      </div>

      <BottomMenuBar />
    </div>
  )
}
