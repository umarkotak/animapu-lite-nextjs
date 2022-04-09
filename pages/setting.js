import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from "next/router"

import BottomMenuBar from "../components/BottomMenuBar"
import animapuApi from "../apis/AnimapuApi"

var onApiCall = false
export default function Home() {
  let router = useRouter()

  const [sources, setSources] = useState([])
  const [activeSource, setActiveSource] = useState("")

  async function GetSourceList() {
    if (onApiCall) {return}
    onApiCall = true
    try {
      const response = await animapuApi.GetSourceList({})
      const body = await response.json()
      console.log(body)
      if (response.status == 200) {
        setSources(body.data)
        setActiveSource(animapuApi.GetActiveMangaSource())
      }
      onApiCall = false

    } catch (e) {
      console.log(e)
      onApiCall = false
    }
  }

  useEffect(() => {
    GetSourceList()
  // eslint-disable-next-line
  }, [])

  function changeMangaSource(source) {
    if (typeof window !== "undefined") {
      localStorage.setItem("ANIMAPU_LITE:ACTIVE_MANGA_SOURCE", source)
      setActiveSource(source)
    }
  }

  return (
    <div className="bg-[#d6e0ef]">
      <Head>
        <title>Animapu - Lite</title>
        <meta name="description" content="Tempat baca komik gratis tanpa iklan" />
        <link rel="icon" href="/favicon.ico" />

        <meta property="og:title" content="Animapu - Lite" />
        <meta property="og:type" content="book" />
        <meta property="og:url" content="https://animapu-lite.vercel.app/" />
        <meta property="og:image" content="/images/cover.jpeg" />
        <meta property="og:description" content="Tempat baca komik gratis tanpa iklan"></meta>
      </Head>

      <div className="pt-4">
        <div className="container mx-auto max-w-[1040px]">
          <h2 className="text-xl mb-2 px-4">Select Manga Source</h2>
          <span className="mb-2 px-4">Current Source: <span className="text-[#3db3f2] font-bold">{activeSource}</span></span>
          {sources.map((source, idx) => (
            <div className="px-4" key={idx}>
              <button
                className="block w-full bg-[#2b2d42] hover:bg-[#3db3f2] text-white rounded mt-2 p-2 text-center"
                onClick={() => changeMangaSource(source)}
              >
                {source}
              </button>
            </div>
          ))}
        </div>
      </div>

      <BottomMenuBar />
    </div>
  )
}
