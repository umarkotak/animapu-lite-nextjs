import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from "next/router"

import BottomMenuBar from "../components/BottomMenuBar"
import animapuApi from "../apis/AnimapuApi"

var onApiCall = false
export default function Home() {
  let router = useRouter()

  const [mangas, setMangas] = useState([
    {id: "dummy-1", shimmer: true},
    {id: "dummy-2", shimmer: true},
    {id: "dummy-3", shimmer: true}
  ])

  async function GetLatestManga() {
    if (onApiCall) {return}
    onApiCall = true
    try {
      const response = await animapuApi.GetLatestManga({
        manga_source: animapuApi.GetActiveMangaSource(),
        page: 1
      })
      const body = await response.json()
      console.log(body)
      setMangas(body.data)
      onApiCall = false

    } catch (e) {
      console.log(e)
      onApiCall = false
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
        <link rel="icon" href="/favicon.ico" />

        <meta name="description" property="description" key="description" content="Tempat baca komik gratis tanpa iklan" />
        <meta name="og:title" property="og:title" key="og:title" content="Animapu - Lite" />
        <meta name="og:type" property="og:type" key="og:type" content="book" />
        <meta name="og:url" property="og:url" key="og:url" content="https://animapu-lite.vercel.app/" />
        <meta name="og:image" property="og:image" key="og:image" content="/images/cover.jpeg" />
        <meta name="og:description" property="og:description" key="og:description" content="Tempat baca komik gratis tanpa iklan" />
      </Head>

      <div className="pt-4">
      </div>

      <BottomMenuBar />
    </div>
  )
}
