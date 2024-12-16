import { useState, useEffect, Fragment } from 'react'
import { useRouter } from "next/router"
import Link from 'next/link'

import BottomMenuBar from "../components/BottomMenuBar"
import MangaCard from "../components/MangaCard"
import ChangeSourceModalOnly from "../components/ChangeSourceModalOnly"
import animapuApi from "../apis/AnimapuApi"
import uuid from 'react-uuid'
import { CoffeeIcon, GlobeIcon, LogInIcon, MoonIcon, RotateCwIcon, StarIcon, SunIcon, TvIcon } from 'lucide-react'
import { toast } from 'react-toastify'

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
  }, [])

  let router = useRouter()
  const query = router.query

  const [activeSource, setActiveSource] = useState("")
  const [mangas, setMangas] = useState([{id: "dummy-1", shimmer: true}, {id: "dummy-2", shimmer: true}])
  const [isLoadMoreLoading, setIsLoadMoreLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState({})

  const [prayerTimes, setPrayerTimes] = useState({})

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
        toast.error(`${body.error.error_code} || ${body.error.message}`)
        setIsLoadMoreLoading(false)
        onApiCall = false

        GetLatestManga()

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
      toast.error(e.message)
    }

    onApiCall = false
    setIsLoadMoreLoading(false)
  }

  useEffect(() => {
    if (!query) {return}
    targetPage = query.page
    GetLatestManga(false)
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
  }, [triggerNextPage])

  if (typeof window !== "undefined" && !localStorage.getItem("ANIMAPU_LITE:VISITOR_ID")) {
    localStorage.setItem("ANIMAPU_LITE:VISITOR_ID", `VISITOR_ID:${uuid()}`)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch('https://api.aladhan.com/v1/calendarByCity?city=Jakarta&country=Indonesia&method=2&month=12&year=2024');
        const data = await response.json(); // Parse the response as JSON
        setPrayerTimes(data.data[0].timings);
      } catch (err) {
        console.error(err)
      }
    };

    fetchPrayerTimes();
  }, [])

  return (
    <div>
      <div className={`${darkMode ? "dark bg-stone-900" : "bg-[#d6e0ef]"} min-h-screen pb-60`}>
        <div className="bg-[#2b2d42] h-[140px] mb-[-100px]">
          <div className="container mx-auto max-w-[768px] pt-2">
            <div className="flex justify-between">
              <span className="px-4 mb-4 text-white text-xl">
                Animapu Lite
              </span>
              <span className="px-4 mb-4 text-white">
                {
                  loggedInUser.email ? <>
                    <Link href="/setting" className="text-[#3db3f2]">Hello, {loggedInUser.email}</Link>
                  </> : <>
                    <Link href="/setting" className="text-[#3db3f2] flex items-center ga-1"><LogInIcon size={14} /> Login</Link>
                  </>
                }
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 flex">
          <div className="container mx-auto max-w-[768px]">
            <div className='fixed z-0 hidden 2xl:flex mt-[110px] text-white'>
              <div className='ml-[-280px] w-[280px] flex flex-col gap-2'>
                <div className='bg-[#2b2d42] p-2 rounded'>
                  Your Ads Here
                </div>
                <Link href=".">
                  <img className='cursor-pointer rounded' src="https://placehold.co/280" />
                </Link>
                <Link href=".">
                  <img className='cursor-pointer rounded' src="https://placehold.co/280" />
                </Link>
              </div>
              <div className='ml-[770px] w-[280px] flex flex-col gap-2'>
                <div className='bg-[#2b2d42] p-2 rounded'>
                  Jadwal Sholat
                </div>
                <div className='bg-[#3b3e5a] flex justify-between p-2 rounded text-xs'>
                  <span>Subuh</span>
                  <span>{prayerTimes.Fajr}</span>
                </div>
                <div className='bg-[#3b3e5a] flex justify-between p-2 rounded text-xs'>
                  <span>Sunrise</span>
                  <span>{prayerTimes.Sunrise}</span>
                </div>
                <div className='bg-[#3b3e5a] flex justify-between p-2 rounded text-xs'>
                  <span>Dhuhr</span>
                  <span>{prayerTimes.Dhuhr}</span>
                </div>
                <div className='bg-[#3b3e5a] flex justify-between p-2 rounded text-xs'>
                  <span>Asr</span>
                  <span>{prayerTimes.Asr}</span>
                </div>
                <div className='bg-[#3b3e5a] flex justify-between p-2 rounded text-xs'>
                  <span>Maghrib</span>
                  <span>{prayerTimes.Maghrib}</span>
                </div>
                <div className='bg-[#3b3e5a] flex justify-between p-2 rounded text-xs'>
                  <span>Isha</span>
                  <span>{prayerTimes.Isha}</span>
                </div>

                <Link href=".">
                  <img className='cursor-pointer rounded' src="https://placehold.co/280" />
                </Link>
              </div>
            </div>

            <div className='p-2 bg-white bg-opacity-10 backdrop-blur-lg mb-4 mx-4 rounded-lg grid grid-cols-2 gap-2'>
              <div className='relative overflow-hidden rounded-lg'>
                <Link href="https://animehub-lite.vercel.app/">
                  <img src="/images/animehub_cover.jpeg" className='h-full w-full object-cover rounded-lg hover:scale-105 transition' />
                </Link>
                <div className='bottom-2 right-2 absolute z-10'>
                  <Link
                    href="https://animehub-lite.vercel.app/"
                    className='py-1 px-2 rounded-full bg-white hover:bg-gray-300 hover:text-blue-600 bg-opacity-70 flex items-center'
                  >
                    <TvIcon size={18} className='mr-2' /> Watch Anime
                  </Link>
                </div>
              </div>
              <div className=''>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
                  <a
                    href="https://trakteer.id/marumaru" target="_blank" rel="noreferrer"
                    className="w-full text-sm p-1 rounded-lg text-center bg-zinc-100 hover:bg-red-400 flex flex-col items-center justify-center"
                  >
                    <CoffeeIcon size={22} />
                    Traktir
                  </a>
                  <Link
                    href="/popular"
                    className="w-full text-sm p-1 rounded-lg text-center bg-zinc-100 hover:bg-red-400 flex flex-col items-center justify-center"
                  >
                    <StarIcon size={22} />
                    Popular
                  </Link>
                  <button
                    className="w-full text-sm p-1 rounded-lg text-center bg-zinc-100 hover:bg-red-400 flex flex-col items-center justify-center"
                    onClick={()=>{
                      localStorage.setItem("ANIMAPU_LITE:DARK_MODE", "false")
                      setDarkMode(false)
                    }}
                  >
                    <SunIcon size={22} />
                    Light
                  </button>
                  <button
                    className="w-full text-sm p-1 rounded-lg text-center bg-zinc-100 hover:bg-red-400 flex flex-col items-center justify-center"
                    onClick={()=>{
                      localStorage.setItem("ANIMAPU_LITE:DARK_MODE", "true")
                      setDarkMode(true)
                    }}
                  >
                    <MoonIcon size={22} />
                    Dark
                  </button>
                </div>
              </div>
            </div>

            <div className='flex p-2 mb-4 mx-4 rounded-lg bg-[#2b2d42] text-white items-center justify-between z-20'>
              <h1 className='text-2xl'>{activeSource}</h1>
              <button
                className='bg-blue-100 p-1 text-black hover:bg-blue-300 rounded-lg text-sm z-0 flex items-center gap-2'
                onClick={()=>{setShowModal(true)}}
              ><GlobeIcon size={22} /> Change</button>
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
                className={`border w-full bg-[#2b2d42] hover:bg-[#3db3f2] text-white rounded mb-2 p-2 text-center flex items-center gap-1 ${mangas.length > 0 ? "hidden" : "block"}`}
                onClick={() => GetLatestManga(false)}
              >
                <RotateCwIcon size={18} /> Retry
              </button>
            </div>
          </div>
        </div>

        <ChangeSourceModalOnly show={showModal} onClose={closeModal} />

        <BottomMenuBar />
      </div>
    </div>
  )
}
