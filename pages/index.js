import { useState, useEffect, Fragment } from 'react'
import { useRouter } from "next/router"
import { useAlert } from 'react-alert'
import Link from 'next/link'

import BottomMenuBar from "../components/BottomMenuBar"
import MangaCard from "../components/MangaCard"
import ChangeSourceModal from "../components/ChangeSourceModal"
import ChangeSourceModalOnly from "../components/ChangeSourceModalOnly"
import animapuApi from "../apis/AnimapuApi"
import uuid from 'react-uuid'

var onApiCall = false
var page = 1
var targetPage = 1
export default function Home() {
  const [darkMode, setDarkMode] = useState(true)
  useEffect(() => {
    if (!localStorage) {return}
    if (localStorage.getItem("ANIMAPU_LITE:DARK_MODE") === "true") {
      setDarkMode(true)
    } else { setDarkMode(false) }
  // eslint-disable-next-line
  }, [])

  const alert = useAlert()
  let router = useRouter()
  const query = router.query

  const [activeSource, setActiveSource] = useState("")
  const [mangas, setMangas] = useState([{id: "dummy-1", shimmer: true}, {id: "dummy-2", shimmer: true}])
  const [isLoadMoreLoading, setIsLoadMoreLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState({})

  function LoginCheck() {
    if (typeof window !== "undefined") {
      if (localStorage.getItem("ANIMAPU_LITE:USER:LOGGED_IN") === "true") {
        setLoggedInUser({
          email: localStorage.getItem("ANIMAPU_LITE:USER:EMAIL"),
        })
      }
    }
  }
  useEffect(() => {
    LoginCheck()
  // eslint-disable-next-line
  }, [])

  async function GetLatestManga(append) {
    if (onApiCall) {return}
    onApiCall = true
    if (append) {
      page = page + 1
    } else {
      setActiveSource(animapuApi.GetActiveMangaSource())
      page = 1
    }

    try {
      setIsLoadMoreLoading(true)
      const response = await animapuApi.GetLatestManga({
        manga_source: animapuApi.GetActiveMangaSource(),
        page: page
      })
      const body = await response.json()
      if (response.status !== 200) {
        alert.error(`${body.error.error_code} || ${body.error.message}`)
        setIsLoadMoreLoading(false)
        onApiCall = false
        return
      }
      if (append) {
        setMangas(mangas.concat(body.data))
      } else {
        setMangas(body.data)
      }

      query.page = page
      router.push({
        pathname: '/',
        query: query
      },
      undefined, { shallow: true })

    } catch (e) {
      alert.error(e.message)
    }

    onApiCall = false
    setIsLoadMoreLoading(false)
  }

  useEffect(() => {
    if (!query) {return}
    targetPage = query.page
    GetLatestManga(false)
  // eslint-disable-next-line
  }, [])

  useEffect(() => {
    if (page === 1 && mangas.length <= 2) {
      if (typeof window !== "undefined") { window.scrollTo(0, 0) }
    }
    if (page < targetPage) {
      GetLatestManga(true)
    }
    if (typeof window !== "undefined" && query.selected && query.selected !== "") {
      try {
        const section = document.querySelector(`#${query.selected}`)
        if (section) {
          query.selected = ""
          section.scrollIntoView( { behavior: 'smooth', block: 'start' } )
          // section.scrollIntoView( { block: 'start' } )
        }
      } catch(e) {}
    }
  // eslint-disable-next-line
  }, [mangas])

  function GetLatestMangaNextPage() {
    GetLatestManga(true)
  }

  const [triggerNextPage, setTriggerNextPage] = useState(0)
  const handleScroll = () => {
    var position = window.pageYOffset
    var maxPosition = document.documentElement.scrollHeight - document.documentElement.clientHeight

    if (maxPosition-position <= 1200) {
      if (onApiCall) {return}
      setTriggerNextPage(position)
    }
  }
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])
  useEffect(() => {
    GetLatestMangaNextPage()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerNextPage])

  if (typeof window !== "undefined" && !localStorage.getItem("ANIMAPU_LITE:VISITOR_ID")) {
    localStorage.setItem("ANIMAPU_LITE:VISITOR_ID", `VISITOR_ID:${uuid()}`)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  return (
    <Fragment>
      <div className={`${darkMode ? "dark bg-stone-900" : "bg-[#d6e0ef]"} min-h-screen pb-60`}>
        <div className="bg-[#2b2d42] h-[140px] mb-[-100px]">
          <div className="container mx-auto max-w-[1040px] pt-2">
            <div className="flex justify-between">
              <span className="px-4 mb-4 text-white">
                {/* <ChangeSourceModal text={activeSource} /> */}
              </span>
              <span className="px-4 mb-4 text-white">
                {
                  loggedInUser.email ? <>
                    <Link href="/setting"><a className="text-[#3db3f2]">Hello, {loggedInUser.email}</a></Link>
                  </> : <>
                    <Link href="/setting"><a className="text-[#3db3f2]"><i className="fa fa-right-to-bracket"></i> Login</a></Link>
                  </>
                }
                {/* <Link href="/home"><a className="mx-2 text-[#3db3f2]"><i className="fa fa-home"></i> Home</a></Link>
                <Link href="/popular"><a className="mx-2 hover:text-[#3db3f2]"><i className="fa fa-star"></i> Popular</a></Link> */}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <div className="container mx-auto max-w-[1040px]">
            <div className='p-2 bg-white bg-opacity-10 backdrop-blur-lg mb-4 mx-4 rounded-lg grid grid-cols-2 gap-2'>
              <div className='relative overflow-hidden rounded-lg'>
                <Link href="https://animehub-lite.vercel.app/">
                  <a><img src="/images/animehub_cover.jpeg" className='h-full w-full object-cover rounded-lg hover:scale-105 transition' /></a>
                </Link>
                <div className='bottom-2 right-2 absolute z-10'>
                  <Link href="https://animehub-lite.vercel.app/">
                    <a className='py-1 px-2 rounded-full bg-white hover:bg-gray-300 hover:text-blue-600 bg-opacity-70'>
                      Watch Anime
                    </a>
                  </Link>
                </div>
              </div>
              <div className='relative'>
                {/* <button
                  className='w-full bg-gray-200 text-sm p-1 rounded-lg hover:bg-gray-400 text-center z-50 mb-2'
                  onClick={()=>{setShowModal(true)}}
                >
                  <div><i className="fa fa-globe mr-1"></i><br/>Change Source</div>
                </button> */}
                <div className='grid grid-cols-2 gap-2'>
                  <a
                    href="https://trakteer.id/marumaru" target="_blank" rel="noreferrer"
                    className='w-full text-sm p-1 rounded-lg text-center bg-red-300 hover:bg-red-400'
                  >
                    <i className="fa fa-coffee"></i><br/>Traktir
                  </a>
                  <Link href="/popular"><a className="w-full  text-sm p-1 rounded-lg bg-yellow-200 hover:bg-yellow-300 text-center">
                    <i className="fa fa-star"></i><br/>Popular
                  </a></Link>
                  <button
                    className="w-full text-sm p-1 rounded-lg bg-gray-100 hover:bg-gray-300 text-center text-gray-900"
                    onClick={()=>{
                      localStorage.setItem("ANIMAPU_LITE:DARK_MODE", "false")
                      setDarkMode(false)
                    }}
                  >
                    <i className="fa fa-sun"></i><br/>Light
                  </button>
                  <button
                    className="w-full text-sm p-1 rounded-lg bg-gray-950 hover:bg-gray-800 text-center text-gray-100"
                    onClick={()=>{
                      localStorage.setItem("ANIMAPU_LITE:DARK_MODE", "true")
                      setDarkMode(true)
                    }}
                  >
                    <i className="fa fa-moon"></i><br/>Dark
                  </button>
                </div>
              </div>
            </div>

            <div className='flex p-2 mb-4 mx-4 rounded-lg bg-[#2b2d42] text-white items-center justify-between'>
              <h1 className='text-2xl'>{activeSource}</h1>
              <button
                className='bg-blue-100 p-1 text-black hover:bg-blue-300 rounded-lg text-sm'
                onClick={()=>{setShowModal(true)}}
              ><i className='fa fa-repeat'></i> Change</button>
            </div>

            <div className="relative grid grid-rows-1 grid-flow-col mx-4 z-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 z-0">
                {mangas.map((manga, idx) => (
                  <MangaCard manga={manga} idx={idx} key={`${idx}-${manga.id}`} remove_margination={true} />
                ))}
              </div>
            </div>

            <div className="px-4">
              <button
                className="border block w-full bg-[#2b2d42] hover:bg-[#3db3f2] text-white rounded mb-2 p-2 text-center"
                onClick={() => GetLatestMangaNextPage()}
              >
                {
                  isLoadMoreLoading ? <svg role="status" className="mx-auto w-8 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                      <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                  </svg> : "Load More"
                }
              </button>
              <button
                className={`border block w-full bg-[#2b2d42] hover:bg-[#3db3f2] text-white rounded mb-2 p-2 text-center ${mangas.length > 0 ? "hidden" : "block"}`}
                onClick={() => GetLatestManga(false)}
              >
                <i className='fa fa-rotate'></i> Retry
              </button>
            </div>
          </div>
        </div>

        <ChangeSourceModalOnly show={showModal} onClose={closeModal} />

        <BottomMenuBar />
      </div>
    </Fragment>
  )
}
