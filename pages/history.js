import { useState, useEffect } from 'react'

import BottomMenuBar from "../components/BottomMenuBar"
import MangaCard from "../components/MangaCard"

export default function Home() {
  const [mangas, setMangas] = useState([
    {id: "dummy-1", shimmer: true},
    {id: "dummy-2", shimmer: true},
    {id: "dummy-3", shimmer: true}
  ])

  async function GetLatestManga() {
    var listKey = `ANIMAPU_LITE:HISTORY:LOCAL:LIST`
    var historyArrayString = localStorage.getItem(listKey)

    if (historyArrayString) {
      setMangas(JSON.parse(historyArrayString))
      console.log("HISTORY LIST", JSON.parse(historyArrayString))
    } else {
      setMangas([])
    }
  }

  useEffect(() => {
    GetLatestManga()
  // eslint-disable-next-line
  }, [])

  return (
    <div className="min-h-screen pb-40 bg-[#d6e0ef]">
      <div className="bg-[#2b2d42] h-[140px] mb-[-100px]">
        <div className="container mx-auto max-w-[1040px] pt-2">
          <span className="px-4 mb-4 text-white text-xl">History</span>
        </div>
      </div>

      <div className="pt-4">
        <div className="container mx-auto max-w-[1040px]">
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
