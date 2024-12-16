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
      setMangas(body.data)
      onApiCall = false

    } catch (e) {
      console.error(e)
      onApiCall = false
    }
  }

  useEffect(() => {
    GetLatestManga()
  }, [])

  return (
    <div className="bg-[#d6e0ef]">
      <div className="pt-4">
      </div>

      <BottomMenuBar />
    </div>
  )
}
