import { useState, useEffect, Fragment } from 'react'
import { useRouter } from "next/router"
import { useAlert } from 'react-alert'
import Link from 'next/link'

import BottomMenuBar from "../components/BottomMenuBar"
import MangaCard from "../components/MangaCard"
import animapuApi from "../apis/AnimapuApi"
import Manga from "../models/Manga"

export default function Popular() {
  const alert = useAlert()
  let router = useRouter()
  const query = router.query

  const [activeSource, setActiveSource] = useState("")
  const [mangas, setMangas] = useState([
    {id: "dummy-1", shimmer: true},
    {id: "dummy-2", shimmer: true},
  ])

  async function GetPopularMangas() {
    try {
      const response = await animapuApi.GetPopularMangas({})
      const body = await response.json()

      if (response.status == 200) {
        setMangas(body.data)
      } else {
        alert.error(body.error.message)
      }

    } catch (e) {
      alert.error(e.message)
    }
    setActiveSource(animapuApi.GetActiveMangaSource())
  }

  useEffect(() => {
    if (!query) {return}
    GetPopularMangas()
  // eslint-disable-next-line
  }, [query])

  return (
    <Fragment>
      <div className="bg-[#d6e0ef]">
        <div className="bg-[#2b2d42] h-[140px] mb-[-100px]">
          <div className="container mx-auto max-w-[1040px] pt-2">
            <div className="flex justify-between">
              <span className="px-4 mb-4 text-white"><i className="fa fa-globe"></i> <span className="text-[#3db3f2] font-bold">{activeSource}</span></span>
              <span className="px-4 mb-4 text-white">
                <Link href="/home"><a className="mx-2 hover:text-[#3db3f2]"><i className="fa fa-home"></i> Home</a></Link>
                <Link href="/popular"><a className="mx-2 text-[#3db3f2]"><i className="fa fa-star"></i> Popular</a></Link>
              </span>
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

            <div className="px-4">
              <button
                className={`border block w-full bg-[#2b2d42] hover:bg-[#3db3f2] text-white rounded mb-2 p-2 text-center ${mangas.length > 0 ? "hidden" : "block"}`}
                onClick={() => GetLatestManga(false)}
              >
                <i className='fa fa-rotate'></i> Retry
              </button>
            </div>
          </div>
        </div>

        <BottomMenuBar />
      </div>
    </Fragment>
  )
}
