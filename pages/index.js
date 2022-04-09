import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from "next/router"

import BottomMenuBar from "../components/BottomMenuBar"
import MangaCard from "../components/MangaCard"
import animapuApi from "../apis/AnimapuApi"

var page

export default function Home() {
  let router = useRouter()

  const [activeSource, setActiveSource] = useState("")

  const [mangas, setMangas] = useState([
    {id: "dummy-1", shimmer: true},
    {id: "dummy-2", shimmer: true},
  ])

  async function GetLatestManga(append) {
    if (append) {
      page = page + 1
    } else {
      page = 1
    }

    try {
      const response = await animapuApi.GetLatestManga({
        manga_source: animapuApi.GetActiveMangaSource(),
        page: page
      })
      const body = await response.json()
      console.log(body)
      setActiveSource(animapuApi.GetActiveMangaSource())
      if (response.status == 200) {
        if (append) {
          setMangas(mangas.concat(body.data))
        } else {
          setMangas(body.data)
        }
      }

    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    if (!router) {return}
    GetLatestManga(false)
  // eslint-disable-next-line
  }, [router])

  function GetLatestMangaNextPage() {
    GetLatestManga(true)
  }

  return (
    <div className="bg-[#d6e0ef]">
      <div className="bg-[#2b2d42] h-[140px] mb-[-100px]">
        <div className="container mx-auto max-w-[1040px] pt-2">
          <span className="px-4 mb-4 text-white">Current Source: <span className="text-[#3db3f2] font-bold">{activeSource}</span></span>
        </div>
      </div>
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

      <div className="pt-4">
        <div className="container mx-auto max-w-[1040px]">
          <div className="grid grid-rows-1 grid-flow-col">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
              {mangas.map((manga, idx) => (
                <MangaCard manga={manga} idx={idx} key={`${idx}-${manga.id}`} />
              ))}
            </div>
          </div>

          <div className="px-4">
            <button
              className="block w-full bg-[#2b2d42] hover:bg-[#3db3f2] text-white rounded mb-2 p-2 text-center  m"
              onClick={() => GetLatestMangaNextPage()}
            >
              Load More
            </button>
          </div>
        </div>
      </div>

      <BottomMenuBar />
    </div>
  )
}
