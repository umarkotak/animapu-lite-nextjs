import { useState, useEffect } from 'react'

import BottomMenuBar from "../components/BottomMenuBar"
import MangaCard from "../components/MangaCard"
import animapuApi from "../apis/AnimapuApi"

var mangaSynced
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
    var historyArrayString = localStorage.getItem(listKey)
    mangaSynced = false

    if (historyArrayString) {
      setMangas(JSON.parse(historyArrayString))
      // console.log("LIBRARY LIST", JSON.parse(historyArrayString))
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

    var idx = 1
    var anyUpdate = false
    var libraryArray
    for (const manga of mangas) {
      if (!mangaSynced) {
        if (!manga.local_updated_at || (manga.local_updated_at+3600) <= Math.floor(Date.now() / 1000) ) {
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

          if (showLatestChapter(mangaDetail) > showLatestChapter(manga)) {
            var listKey = `ANIMAPU_LITE:FOLLOW:LOCAL:LIST`
            var detailKey = `ANIMAPU_LITE:FOLLOW:LOCAL:DETAIL:${manga.source}:${manga.source_id}:${manga.secondary_source_id}`

            var libraryArrayString = localStorage.getItem(listKey)

            if (libraryArrayString) {
              libraryArray = JSON.parse(libraryArrayString)
            } else {
              libraryArray = []
            }

            libraryArray = libraryArray.filter(arrManga => !(`${arrManga.source}-${arrManga.source_id}` === `${manga.source}-${manga.source_id}`))

            var tempManga = mangaDetail
            libraryArray.unshift(tempManga)

            localStorage.setItem(listKey, JSON.stringify(libraryArray))
            localStorage.setItem(detailKey, JSON.stringify(tempManga))
            anyUpdate = true
          }
        }
      }

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
    <div className="bg-[#d6e0ef]">
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
