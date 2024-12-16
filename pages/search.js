import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from "next/router"

import BottomMenuBar from "../components/BottomMenuBar"
import MangaCard from "../components/MangaCard"
import animapuApi from "../apis/AnimapuApi"
import ChangeSourceModalOnly from "../components/ChangeSourceModalOnly"
import { toast } from 'react-toastify'

var onApiCall = false
export default function Home() {
  const [darkMode, setDarkMode] = useState(true)
  useEffect(() => {
    if (!localStorage) {return}
    if (localStorage.getItem("ANIMAPU_LITE:DARK_MODE") === "true") {
      setDarkMode(true)
    } else { setDarkMode(false) }
  }, [])

  let router = useRouter()
  const query = router.query

  const [mangas, setMangas] = useState([])
  const [title, setTitle] = useState("")
  const [activeSource, setActiveSource] = useState("")
  const [isLoadMoreLoading, setIsLoadMoreLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const closeModal = () => {
    setShowModal(false)
  }
  const [mangaSourcesData, setMangaSourcesData] = useState([])
  const [searchMode, setSearchMode] = useState("global")

  useEffect(() => {
    setActiveSource(animapuApi.GetActiveMangaSource())
  }, [])

  async function SearchManga() {
    if (onApiCall) {return}
    onApiCall = true
    try {
      setIsLoadMoreLoading(true)
      if (mangaSourcesData.length > 0 && searchMode === "global") {
        // console.log(mangaSourcesData)

        var tmpSearchData = []

        await Promise.all(mangaSourcesData.map(async (oneMangaSourceData) => {
          const response = await animapuApi.SearchManga({
            manga_source: oneMangaSourceData.value,
            title: title
          })
          const body = await response.json()
          if (response.status == 200) {
            tmpSearchData = tmpSearchData.concat(body.data)
          }
        }))

        setMangas(tmpSearchData)

      } else {
        const response = await animapuApi.SearchManga({
          manga_source: animapuApi.GetActiveMangaSource(),
          title: title
        })
        const body = await response.json()

        if (response.status == 200) {
          setMangas(body.data)
        } else {
          toast.error(body.error.message)
          console.error("FAIL", body)
        }
      }
      onApiCall = false

      setIsLoadMoreLoading(false)

    } catch (e) {
      console.error(e)
      onApiCall = false
      toast.error(e.message)
      setIsLoadMoreLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") SearchManga()
  }

  return (
    <div className={`${darkMode ? "dark bg-stone-900" : "bg-[#d6e0ef]"} min-h-screen pb-60`}>
      <div className="bg-[#2b2d42] h-[140px] mb-[-100px]">
        <div className="container mx-auto max-w-[768px] pt-2">
          <h1 className='text-white text-xl mx-2 pt-2'><i className='fa fa-search'></i> Search</h1>

          <div className='flex pt-2 mx-2 rounded-lg bg-[#2b2d42] text-white items-center justify-between'>
            <h1 className='text-2xl'>{activeSource}</h1>
            <button
              className='bg-blue-100 p-1 text-black hover:bg-blue-300 rounded-lg text-sm'
              onClick={()=>{setShowModal(true)}}
            ><i className='fa fa-repeat'></i> Change</button>
          </div>
        </div>
      </div>

      <div className="pt-10">
        <div className="container mx-auto max-w-[768px]">
          <div className="bg-[#2b2d42] rounded m-2">
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="Search"
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e)}
            />
          </div>

          <div className='m-2 flex gap-2'>
            <button className='bg-blue-100 p-1 text-black hover:bg-blue-300 rounded-lg text-sm'>
              Search Mode:
            </button>
            <button
              className={`${searchMode === "global" ? "bg-green-400" : "bg-blue-100" } bg-blue-100 p-1 text-black hover:bg-blue-300 rounded-lg text-sm`}
              onClick={()=>setSearchMode("global")}
            >
              global
            </button>
            <button
              className={`${searchMode === "single" ? "bg-green-400" : "bg-blue-100" } p-1 text-black hover:bg-blue-300 rounded-lg text-sm`}
              onClick={()=>setSearchMode("single")}
            >
              single
            </button>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <div className="container mx-auto max-w-[768px]">
          {
            isLoadMoreLoading ? <svg role="status" className="mx-auto w-8 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg> : <></>
          }
          <div className="grid grid-rows-1 grid-flow-col">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
              {mangas.map((manga, idx) => (
                <MangaCard manga={manga} idx={idx} key={`${idx}-${manga.id}`} show_hover_source={true} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <ChangeSourceModalOnly show={showModal} onClose={closeModal} setMangaSourcesData={setMangaSourcesData} />

      <BottomMenuBar />
    </div>
  )
}
