import { useState, useEffect } from 'react'

import BottomMenuBar from "../components/BottomMenuBar"
import MangaCard from "../components/MangaCard"
import animapuApi from "../apis/AnimapuApi"

var mangaSynced = true
export default function Library() {
  const [mangas, setMangas] = useState([])

  const [updateStatus, setUpdateStatus] = useState({
    current: 0,
    currentTitle: "",
    max: 0,
    percent: 0,
    finished: false
  })

  function GetLatestManga() {
    var listKey = `ANIMAPU_LITE:FOLLOW:LOCAL:LIST`
    var libraryArrayString = localStorage.getItem(listKey)
    mangaSynced = false

    if (libraryArrayString) {
      console.log(JSON.parse(libraryArrayString))
      setMangas(JSON.parse(libraryArrayString))
      // console.log("LIBRARY LIST", JSON.parse(libraryArrayString))
    } else {
      setMangas([])
    }
  }

  function showLatestChapter(manga) {
    if (!manga) { return 0 }

    var latestChapter = manga.latest_chapter_number
    if (latestChapter <= 0 || !latestChapter) {
      if (manga.chapters.length > 0) {
        latestChapter = manga.chapters[0].number
      }
    }
    if (latestChapter) {
      return latestChapter
    }
    return 0
  }

  async function CheckForUpdates() {
    if (mangas.length <= 0) { return }
    if (mangaSynced) { return }

    var idx = 1
    var anyUpdate = false
    var libraryArray
    var listKey = `ANIMAPU_LITE:FOLLOW:LOCAL:LIST`

    for (const manga of mangas) {
      var detailKey = `ANIMAPU_LITE:FOLLOW:LOCAL:DETAIL:${manga.source}:${manga.source_id}:${manga.secondary_source_id}`

      if (manga.local_updated_at && (manga.local_updated_at+3600) > Math.floor(Date.now() / 1000)) { continue }

      const response = await animapuApi.GetMangaDetail({
        manga_source: manga.source,
        manga_id: manga.source_id,
        secondary_source_id: manga.secondary_source_id
      })
      const body = await response.json()
      var mangaDetail
      if (response.status == 200) {
        mangaDetail = body.data
      }

      var tempManga = mangaDetail
      if (mangaDetail.title === "" || !mangaDetail.title) {
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

      if (showLatestChapter(tempManga) > showLatestChapter(manga)) {
        libraryArray = libraryArray.filter(arrManga => !(`${arrManga.source}-${arrManga.source_id}` === `${manga.source}-${manga.source_id}`))
        libraryArray.unshift(tempManga)
        anyUpdate = true
      } else {
        libraryArray = libraryArray.map(arrManga => {
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
        current: idx, currentTitle: manga.title, max: mangas.length, percent: ((idx)/mangas.length)*100, finished: false
      })
      idx = idx+1
    }
    mangaSynced = true

    setUpdateStatus({
      current: 0, currentTitle: "", max: 0, percent: 100, finished: true
    })

    if (anyUpdate) {
      setMangas(libraryArray)
    }
  }

  useEffect(() => {
    GetLatestManga()
  // eslint-disable-next-line
  }, [])

  useEffect(() => {
    CheckForUpdates()
  // eslint-disable-next-line
  }, [mangas])

  return (
    <div className="min-h-screen pb-60 bg-[#d6e0ef]">
      <div className="bg-[#2b2d42] h-[140px] mb-[-100px]">
        <div className="container mx-auto max-w-[1040px] pt-2">
          <span className="px-4 mb-4 text-white text-xl">Library</span>
        </div>
      </div>

      <div className="pt-4">
        <div className="container mx-auto max-w-[1040px]">
          <div className={`px-4 ${updateStatus.finished ? "hidden" : "block"}`}>
            <div className="mb-1 text-base font-medium text-white">
              Checking for updates ({updateStatus.currentTitle}) {updateStatus.current}/{updateStatus.max}
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full dark:bg-gray-700 mb-8">
              <div className="h-1.5 bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={{width: `${updateStatus.percent}%`}}></div>
            </div>
          </div>
          <div className="grid grid-rows-1 grid-flow-col">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
              {mangas.map((manga, idx) => (
                <MangaCard manga={manga} idx={idx} key={`${idx}-${manga.id}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <BottomMenuBar />
    </div>
  )
}
