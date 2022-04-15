import { useState, useEffect, Fragment } from 'react'
import { useRouter } from "next/router"

import BottomMenuBar from "../components/BottomMenuBar"
import MangaCard from "../components/MangaCard"
import animapuApi from "../apis/AnimapuApi"

var page
var targetPage
var onApiCall = false
export default function Home({}) {
  let router = useRouter()
  const query = router.query

  const [activeSource, setActiveSource] = useState(animapuApi.GetActiveMangaSource())
  const [mangas, setMangas] = useState([
    {id: "dummy-1", shimmer: true},
    {id: "dummy-2", shimmer: true},
  ])
  const [isLoadMoreLoading, setIsLoadMoreLoading] = useState(false)

  async function GetLatestManga(append) {
    if (onApiCall) {return}
    onApiCall = true
    if (append) {
      page = page + 1
    } else {
      page = 1
    }

    try {
      setIsLoadMoreLoading(true)
      const response = await animapuApi.GetLatestManga({
        manga_source: animapuApi.GetActiveMangaSource(),
        page: page
      })
      const body = await response.json()
      console.log(body)
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

    onApiCall = false
    setIsLoadMoreLoading(false)
  }

  useEffect(() => {
    if (!query) {return}
    targetPage = query.page
    GetLatestManga(false)
  // eslint-disable-next-line
  }, [query])

  useEffect(() => {
    if (page === 1) {
      if (typeof window !== "undefined") { window.scrollTo(0, 0) }
    }
    if (page < targetPage) {
      GetLatestManga(true)
    }
  // eslint-disable-next-line
  }, [mangas])

  function GetLatestMangaNextPage() {
    GetLatestManga(true)
    router.push({
      pathname: '/',
      query: { page: page }
    },
    undefined, { shallow: true })
  }

  return (
    <Fragment>
      <div className="bg-[#d6e0ef]">
        <div className="bg-[#2b2d42] h-[140px] mb-[-100px]">
          <div className="container mx-auto max-w-[1040px] pt-2">
            <span className="px-4 mb-4 text-white">Current Source: <span className="text-[#3db3f2] font-bold">{activeSource}</span></span>
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
                className="block w-full bg-[#2b2d42] hover:bg-[#3db3f2] text-white rounded mb-2 p-2 text-center  m"
                onClick={() => GetLatestMangaNextPage()}
              >
                {
                  isLoadMoreLoading ? <svg role="status" className="mx-auto w-8 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                      <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                  </svg> : "Load More"
                }
              </button>
            </div>
          </div>
        </div>

        <BottomMenuBar />
      </div>
    </Fragment>
  )
}
