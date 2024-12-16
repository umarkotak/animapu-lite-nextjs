import { useState, useEffect } from 'react'
import { ref, onValue, child, get} from "firebase/database"

import BottomMenuBar from "../components/BottomMenuBar"
import MangaCard from "../components/MangaCard"
import animapuApi from "../apis/AnimapuApi"
import Manga from "../models/Manga"
import clientCredentials from "../firebase/clientCredentials"

var mangaSynced = false
var listKey = `ANIMAPU_LITE:FOLLOW:LOCAL:LIST`

export default function Library() {
  const [darkMode, setDarkMode] = useState(true)
  const [mangaFilter, setMangaFilter] = useState("")

  useEffect(() => {
    if (!localStorage) {return}
    if (localStorage.getItem("ANIMAPU_LITE:DARK_MODE") === "true") {
      setDarkMode(true)
    } else { setDarkMode(false) }
  }, [])

  // function TestFireBase() {
  //   const rtDb = clientCredentials.GetDB()

  //   console.log("clicked")
  //   const rootRef = ref(rtDb, 'animapu-lite-api')
  //   get(child(rootRef, `users`)).then((snapshot) => {
  //     if (snapshot.exists()) {
  //       console.log(snapshot.val())
  //     } else {
  //       console.log("No data available")
  //     }
  //   }).catch((error) => {
  //     console.error(error)
  //   })
  // }

  const [mangas, setMangas] = useState([])
  const [onlineMangas, setOnlineMangas] = useState([])

  const [updateStatus, setUpdateStatus] = useState({
    current: 0,
    currentTitle: "",
    max: 0,
    percent: 0,
    finished: false
  })

  function GetLibraryMangas() {
    var libraryArrayString = localStorage.getItem(listKey)
    mangaSynced = false

    if (libraryArrayString) {
      return JSON.parse(libraryArrayString)
    } else {
      return []
    }
  }

  function showLatestChapter(manga) {
    if (!manga) { return 0 }

    if (manga.latest_chapter_number && manga.latest_chapter_number > 0) {
      return manga.latest_chapter_number
    }

    if (manga.chapters.length > 0 && manga.chapters[0] && manga.chapters[0].number > 0) {
      return manga.chapters[0].number
    }

    return 0
  }

  async function CheckForUpdates(libraryMangas) {
    if (libraryMangas.length <= 0) {
      setUpdateStatus({
        current: 0, currentTitle: "", max: 0, percent: 100, finished: true
      })
      return
    }
    if (mangaSynced) {
      setUpdateStatus({
        current: 0, currentTitle: "", max: 0, percent: 100, finished: true
      })
      return
    }

    var idx = 1
    var anyUpdate = false
    var libraryArray

    var tempMangas = libraryMangas
    tempMangas = libraryMangas.filter((v) => {
      return ((!v.local_updated_at || (v.local_updated_at && Math.floor(Date.now() / 1000) > (v.local_updated_at+3600))))
    })

    for (const manga of tempMangas) {
      var thisUpdated = false
      var detailKey = `ANIMAPU_LITE:FOLLOW:LOCAL:DETAIL:${manga.source}:${manga.source_id}:${manga.secondary_source_id}`

      if (manga.local_updated_at && (manga.local_updated_at+3600) > Math.floor(Date.now() / 1000)) { continue }

      var mangaDetail
      try {
        const response = await animapuApi.GetMangaDetail({
          manga_source: manga.source,
          manga_id: manga.source_id,
          secondary_source_id: manga.secondary_source_id
        })
        const body = await response.json()
        if (response.status == 200) {
          mangaDetail = body.data
        }
      } catch {
        mangaDetail = manga
      }

      var tempManga = mangaDetail
      if (!mangaDetail.title || mangaDetail.title === "") {
        tempManga = manga
        tempManga.unavailable = true
      }

      tempManga.local_updated_at = Math.floor(Date.now() / 1000)
      if (tempManga.chapters && tempManga.chapters.length > 0) {
        tempManga.chapters = [tempManga.chapters[0]]
      }

      var libraryArrayString = localStorage.getItem(listKey)

      if (libraryArrayString) {
        libraryArray = JSON.parse(libraryArrayString)
      } else {
        libraryArray = []
      }

      // Update library
      if (showLatestChapter(tempManga) > showLatestChapter(manga)) {
        libraryArray = libraryArray.filter((arrManga) => {
          return !(`${arrManga.source}-${arrManga.source_id}` === `${manga.source}-${manga.source_id}`) && !`${arrManga.source_id}`.includes("/")
        })
        libraryArray.unshift(tempManga)
        anyUpdate = true
        thisUpdated = true

      } else {
        libraryArray = libraryArray.filter((v) => (v.title !== "" && !`${v.source_id}`.includes("/"))).map(arrManga => {
          if (`${arrManga.source}-${arrManga.source_id}` === `${manga.source}-${manga.source_id}`) {
            arrManga = tempManga
          }
          if (arrManga.chapters && arrManga.chapters.length > 0) {
            arrManga.chapters = [arrManga.chapters[0]]
          }
          return arrManga
        })
      }

      localStorage.setItem(listKey, JSON.stringify(libraryArray))
      localStorage.setItem(detailKey, JSON.stringify(tempManga))

      setUpdateStatus({
        current: idx,
        currentTitle: manga.title,
        max: tempMangas.length,
        percent: ((idx)/tempMangas.length)*100,
        finished: false
      })
      idx = idx+1
      if (anyUpdate && thisUpdated) {
        setMangas(libraryArray)
      }
    }
    mangaSynced = true

    setUpdateStatus({
      current: 0, currentTitle: "", max: 0, percent: 100, finished: true
    })
  }

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("ANIMAPU_LITE:USER:LOGGED_IN") === "true") {
      setActiveTab("online")
    }

    var libraryMangas = GetLibraryMangas()
    setMangas(libraryMangas)
  }, [])

  function ExecuteSync() {
    var libraryMangas = GetLibraryMangas()
    CheckForUpdates(libraryMangas)
  }

  useEffect(() => {
  }, [mangas])

  const [activeTab, setActiveTab] = useState("local")

  function getTabColor(tabString) {
    if (activeTab === tabString) {
      return "text-[#3db3f2]"
    }
    return "hover:text-[#3db3f2]"
  }

  const [activeFilter, setActiveFilter] = useState("all")

  function filterMangas(mangas, selectedTab, filterMode) {
    var filteredMangas = mangas

    if (filterMode !== "all") {
      filteredMangas = filteredMangas.filter((filteredManga) => {
        if (typeof window !== "undefined") {
          var mangaObj = new Manga(filteredManga, localStorage.getItem("ANIMAPU_LITE:USER:UNIQUE_SHA"))

          if (localStorage.getItem("ANIMAPU_LITE:USER:LOGGED_IN") === "true" && localStorage.getItem(mangaObj.GetOnlineHistoryKey())) {
            var historyMangaDetail = JSON.parse(localStorage.getItem(mangaObj.GetOnlineHistoryKey()))

            if (filterMode === "ongoing" && (historyMangaDetail && historyMangaDetail.last_chapter_read > 1 && historyMangaDetail.last_chapter_read < filteredManga.latest_chapter_number)) {
              return true
            } else if (filterMode === "unread" && !(historyMangaDetail && historyMangaDetail.last_chapter_read > 1)) {
              return true
            } else if (filterMode === "finished" && (historyMangaDetail && historyMangaDetail.last_chapter_read >= filteredManga.latest_chapter_number)) {
              return true
            } else if (filterMode === "unread") {
              return false
            } else if (filterMode === "finished") {
              return false
            }
          }

          if (localStorage.getItem(mangaObj.GetLocalHistoryKey())) {
            var historyMangaDetail = JSON.parse(localStorage.getItem(mangaObj.GetLocalHistoryKey()))

            if (filterMode === "ongoing" && (historyMangaDetail && historyMangaDetail.last_chapter_read > 1 && historyMangaDetail.last_chapter_read < filteredManga.latest_chapter_number)) {
              return true
            } else if (filterMode === "unread" && !(historyMangaDetail && historyMangaDetail.last_chapter_read > 1)) {
              return true
            } else if (filterMode === "finished" && (historyMangaDetail && historyMangaDetail.last_chapter_read >= filteredManga.latest_chapter_number)) {
              return true
            } else if (filterMode === "unread") {
              return false
            } else if (filterMode === "finished") {
              return false
            }
          }

          if (filterMode === "unread") {
            return true
          }
        }

        return false
      })
    }

    return filteredMangas.filter((oneManga) => (oneManga.title.toLowerCase().includes(mangaFilter.toLowerCase())))
  }

  function getFilterColor(filterString) {
    if (activeFilter === filterString) {
      return "text-[#3db3f2]"
    }
    return "hover:text-[#3db3f2]"
  }

  return (
    <div className={`${darkMode ? "dark bg-stone-900" : "bg-[#d6e0ef]"} min-h-screen pb-60`}>
      <div className="bg-[#2b2d42] h-[140px] mb-[-100px]">
        <div className="container mx-auto max-w-[768px] pt-2">
          <div className="flex justify-between">
            <span className="px-4 mb-4 text-white">
              Library
            </span>
            <span className="px-4 mb-4 text-white">
              <button className={`mx-2 ${getTabColor("local")}`} onClick={()=>{setActiveTab("local")}}><i className="fa-solid fa-file"></i> Local</button>
              <button className={`mx-2 ${getTabColor("online")}`} onClick={()=>{setActiveTab("online")}}><i className="fa-solid fa-cloud"></i> Online</button>
              <button className={`mx-2 hover:text-[#3db3f2]`} onClick={()=>{ExecuteSync()}}><i className="fa-solid fa-wifi"></i> Sync</button>
            </span>
          </div>
        </div>
      </div>

      <div className='pt-0'>
        <div className="container mx-auto max-w-[768px]">
          <div className='px-2 flex flex-col gap-2 text-white'>
            <span className='ml-2'><b><i className='fa fa-filter'></i> Filters: </b></span>

            <div className="flex justify-start">
              <button className={`py-0.5 px-2 rounded-full bg-blue-900 text-sm ml-2 ${getFilterColor("all")}`} onClick={()=>{setActiveFilter("all")}}>
                All
              </button>
              <button className={`py-0.5 px-2 rounded-full bg-blue-900 text-sm ml-2 ${getFilterColor("unread")}`} onClick={()=>{setActiveFilter("unread")}}>
                Unread
              </button>
              <button className={`py-0.5 px-2 rounded-full bg-blue-900 text-sm ml-2 ${getFilterColor("ongoing")}`} onClick={()=>{setActiveFilter("ongoing")}}>
                Ongoing
              </button>
              <button className={`py-0.5 px-2 rounded-full bg-blue-900 text-sm ml-2 ${getFilterColor("finished")}`} onClick={()=>{setActiveFilter("finished")}}>
                Finished
              </button>
            </div>

            <div className='px-2'>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                placeholder="Search"
                onChange={(e) => setMangaFilter(e.target.value)}
                value={mangaFilter}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <div className="container mx-auto max-w-[768px]">
          <div className={`px-4 ${updateStatus.finished || updateStatus.max <= 0 ? "hidden" : "block"}`}>
            <div className="mb-1 text-base font-medium text-white">
              <div className='flex justify-between'>
                <span>Checking for updates</span>
                <span>{updateStatus.current}/{updateStatus.max}</span>
              </div>
              <small>{updateStatus.currentTitle.length > 40 ? updateStatus.currentTitle.slice(0, 38)+"..." : updateStatus.currentTitle}</small>
            </div>
            <div className="w-full bg-gray-200 rounded-full mb-8">
              <div className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.2 leading-none rounded-full" style={{width: `${updateStatus.percent}%`}}>
                {Math.floor(updateStatus.percent)}%
              </div>
            </div>
          </div>

          <div className="grid grid-rows-1 grid-flow-col">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
              {(activeTab === "local") &&
                filterMangas(mangas, activeTab, activeFilter).map((manga, idx) => (
                  <MangaCard manga={manga} idx={idx} key={`${idx}-${manga.id}`} />
                ))
              }
              {/* TODO: Change mangas to onlineMangas */}
              {(activeTab === "online") && mangas.length === 0 && <MangaCard manga={{id: "dummy-1", shimmer: true}} />}
              {(activeTab === "online") &&
                filterMangas(mangas, activeTab, activeFilter).map((manga, idx) => (
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
