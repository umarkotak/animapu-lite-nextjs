import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from "next/router"

import BottomMenuBar from "../components/BottomMenuBar"
import MangaCard from "../components/MangaCard"
import animapuApi from "../apis/AnimapuApi"

var onApiCall = false
export default function Home() {
  let router = useRouter()

  const [mangas, setMangas] = useState([])
  const [title, setTitle] = useState("")
  const [activeSource, setActiveSource] = useState(animapuApi.GetActiveMangaSource())

  async function SearchManga() {
    if (onApiCall) {return}
    onApiCall = true
    try {
      const response = await animapuApi.SearchManga({
        manga_source: animapuApi.GetActiveMangaSource(),
        title: title
      })
      const body = await response.json()

      if (response.status == 200) {
        console.log(body)
        setMangas(body.data)
      } else {
        console.log("FAIL", body)
      }
      onApiCall = false

    } catch (e) {
      console.log(e)
      onApiCall = false
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") SearchManga()
  }

  return (
    <div className="bg-[#d6e0ef]">
      <Head>
        <title>Animapu - Lite</title>
        <link rel="icon" href="/favicon.ico" />

        <meta name="description" property="description" key="description" content="Tempat baca komik gratis tanpa iklan" />
        <meta name="og:title" property="og:title" key="og:title" content="Animapu - Lite" />
        <meta name="og:type" property="og:type" key="og:type" content="book" />
        <meta name="og:url" property="og:url" key="og:url" content="https://animapu-lite.vercel.app/" />
        <meta name="og:image" property="og:image" key="og:image" content="/images/cover.jpeg" />
        <meta name="og:description" property="og:description" key="og:description" content="Tempat baca komik gratis tanpa iklan" />
      </Head>

      <div className="bg-[#2b2d42] h-[140px] mb-[-100px]">
        <div className="container mx-auto max-w-[1040px] pt-2">
          <span className="px-4 mb-4 text-white">Current Source: <span className="text-[#3db3f2] font-bold">{activeSource}</span></span>
        </div>
      </div>

      <div className="pt-4">
        <div className="container mx-auto max-w-[1040px]">

          <div className="bg-[#2b2d42] rounded p-2 m-2">
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="Search"
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e)} />
          </div>
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
