import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from "next/router"

import BottomMenuBar from "../components/BottomMenuBar"
import animapuApi from "../apis/AnimapuApi"
import MangaCard from "../components/MangaCard"

var onApiCall = false
export default function Home() {
  let router = useRouter()

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
    <div className="bg-[#d6e0ef]">
      <Head>
        <title>Animapu - Lite</title>
        <meta name="description" content="Baca komik gratis tanpa iklan" />

        <meta itemprop="name" content="Animapu - Lite" />
        <meta itemprop="description" content="Baca komik gratis tanpa iklan" />
        <meta itemprop="image" content="https://animapu-lite.vercel.app/images/cover.jpeg" />

        <meta name="og:url" property="og:url" content="https://animapu-lite.vercel.app/" />
        <meta name="og:type" property="og:type" content="website" />
        <meta name="og:title" property="og:title" content="Animapu - Lite" />
        <meta name="og:description" property="og:description" content="Baca komik gratis tanpa iklan" />
        <meta name="og:image" property="og:image" content="https://animapu-lite.vercel.app/images/cover.jpeg" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Animapu - Lite" />
        <meta name="twitter:description" content="Baca komik gratis tanpa iklan" />
        <meta name="twitter:image" content="https://animapu-lite.vercel.app/images/cover.jpeg" />
      </Head>

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
