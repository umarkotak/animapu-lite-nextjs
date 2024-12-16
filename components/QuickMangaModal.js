import { useState, useRef, useEffect } from 'react'
import { useRouter } from "next/router"
import Link from 'next/link'

import animapuApi from "../apis/AnimapuApi"
import Manga from "../models/Manga"
import { BookIcon, Eye, EyeIcon, Heart, HeartIcon, PlayIcon, Share2Icon, StarIcon, XIcon } from 'lucide-react'
import { toast } from 'react-toastify'

export default function QuickMangaModal(props) {
  let router = useRouter()
  const query = router.query

  const [show, setShow] = useState(false)
  const [manga, setManga] = useState(initManga(props.manga))

  function initManga(initialManga) {
    initialManga.chapters = []
    return initialManga
  }

  async function GetMangaDetail() {
    try {
      const response = await animapuApi.GetMangaDetail({
        manga_source: props.manga.source,
        manga_id: props.manga.source_id,
        secondary_source_id: props.manga.secondary_source_id
      })
      const body = await response.json()
      if (response.status == 200) {
        setManga(body.data)
        return
      }

    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    setShow(props.showModal)
  }, [props])

  useEffect(() => {
    if (show) { GetMangaDetail() }

    props.setShowModal(show)
  }, [show])

  var historyDetailKey = `ANIMAPU_LITE:HISTORY:LOCAL:DETAIL:${manga.source}:${manga.source_id}:${manga.secondary_source_id}`
  var listKey = `ANIMAPU_LITE:FOLLOW:LOCAL:LIST`
  var detailKey = `ANIMAPU_LITE:FOLLOW:LOCAL:DETAIL:${manga.source}:${manga.source_id}:${manga.secondary_source_id}`
  const [chapters, setChapters] = useState([{id: 1}])
  const [continueManga, setContinueManga] = useState({last_link: "#", last_chapter_read: 0})

  const [followed, setFollowed] = useState(false)

  function isContinuePossible() {
    try {
      var mangaObj = new Manga(props.manga, localStorage.getItem("ANIMAPU_LITE:USER:UNIQUE_SHA"))

      if (typeof window !== "undefined" && localStorage.getItem("ANIMAPU_LITE:USER:LOGGED_IN") === "true") {
        if (localStorage.getItem(mangaObj.GetOnlineHistoryKey())) {
          var onlineManga = JSON.parse(localStorage.getItem(mangaObj.GetOnlineHistoryKey()))
          setContinueManga(onlineManga)
        }
      }

      if (typeof window !== "undefined") {
        if (localStorage.getItem(mangaObj.GetLocalHistoryKey())) {
          var localManga = JSON.parse(mangaObj.GetLocalHistoryKey())
          setContinueManga(localManga)
        }
      }
    } catch (e) {
    }
  }

  function isInLibrary() {
    try {
      if (typeof window !== "undefined" && localStorage.getItem(detailKey)) { return true }
    } catch (e) {}
    return false
  }

  useEffect(() => {
    setChapters(manga.chapters)
    setFollowed(isInLibrary())
    isContinuePossible()
  }, [manga])

  async function handleFollow() {
    if (!manga.source_id) { return }

    var libraryArrayString = localStorage.getItem(listKey)

    var libraryArray
    if (libraryArrayString) {
      libraryArray = JSON.parse(libraryArrayString)
    } else {
      libraryArray = []
    }

    libraryArray = libraryArray.filter(arrManga => !(`${arrManga.source}-${arrManga.source_id}` === `${manga.source}-${manga.source_id}`))

    if (followed) {
      localStorage.setItem(listKey, JSON.stringify(libraryArray))
      localStorage.removeItem(detailKey)
      setFollowed(isInLibrary())
      return
    }

    var tempManga = manga
    libraryArray.unshift(tempManga)

    localStorage.setItem(listKey, JSON.stringify(libraryArray))
    localStorage.setItem(detailKey, JSON.stringify(tempManga))
    setFollowed(isInLibrary())

    // API CALL
    try {
      const response = await animapuApi.PostFollowManga({uid: localStorage.getItem("ANIMAPU_LITE:USER:UNIQUE_SHA")}, manga)
      const body = await response.json()
      if (response.status !== 200) {
        console.log(`${body.error.error_code} || ${body.error.message}`)
        return
      }
    } catch (e) {
      console.log(e.message)
    }

    toast.info("Info || Manga ini udah masuk library kamu!")
  }

  async function handleUpvote() {
    if (!manga.source_id) { return }

    try {
      manga.star = true
      const response = await animapuApi.PostUpvoteManga(manga)
      const body = await response.json()
      if (response.status !== 200) {
        toast.error(`${body.error.error_code} || ${body.error.message}`)
        return
      }
      toast.info("Info || Upvote sukses!")

    } catch (e) {
      toast.error(e.message)
    }
  }

  function startReadDecider(chapters) {
    try {
      if (!chapters) { return 1 }
      if (!chapters.at(-1)) { return 1 }
      if (!chapters.at(-1).id) { return 1 }
      return chapters.at(-1).id
    } catch {
      return 1
    }
  }

  function changeUrl(manga) {
    if (typeof window !== "undefined" && (window.location.pathname === "/")) {
      router.push({
        pathname: window.location.pathname,
        query: {
          selected: manga.source_id,
          page: query.page || 1
        }
      }, undefined, { shallow: true })
    }
  }

  return(
    <div>
      <div className="absolute top-1 right-1 p-1 rounded-lg text-black hover:text-[#ec294b] z-10" onClick={() => handleFollow()}>
        <button className="drop-shadow-sm bg-white bg-opacity-50 backdrop-blur rounded-full p-1">
          <span className={`${followed ? "text-[#ec294b]": ""}`}><HeartIcon size={20} /></span>
        </button>
      </div>
      {
        show &&
        <div className='z-10'>
          <div className="fixed top-0 right-0 left-0 bg-black bg-opacity-70 h-screen w-full z-20 backdrop-blur-sm" onClick={()=>setShow(!show)}></div>
          <div className="fixed mx-auto inset-x-0 top-[40px] p-4 w-full max-w-md z-20">
            <div className="relative bg-white rounded-xl shadow dark:bg-gray-700 z-10 overflow-hidden">
              <div className={`h-[100px] z-0 ${manga.title ? "" : "animate-pulse"} rounded-xl`} style={{
                backgroundImage: `url(${(manga?.cover_image && manga?.cover_image[0]?.image_urls[0]) || "/images/default-book.png"})`,
                backgroundColor: "#d6e0ef",
                backgroundPosition: "50% 35%",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
              }}>
                <div className="backdrop-blur-md h-full"></div>
              </div>
              <button
                type="button"
                className="absolute z-10 top-3 right-2.5 bg-[#ec294b] hover:bg-[#B11F38] text-white rounded-full text-xs py-1.5 px-2 inline-flex"
                onClick={()=>setShow(!show)}
              >
                <XIcon size={14} />
              </button>
              <button
                className="absolute z-10 top-3 right-[46px] text-xs text-white float-right bg-[#3db3f2] hover:bg-[#318FC2] p-1 rounded-full flex items-center gap-1"
                onClick={(e)=>{
                  navigator.clipboard.writeText(`Read *${manga.title}* for free at https://animapu-lite.vercel.app/mangas/${manga.source}/${manga.source_id}?secondary_source_id=${manga.secondary_source_id}`)
                  toast.info("Info || Link berhasil dicopy!")
                }}
              ><Share2Icon size={14} /> Share</button>
              <button
                className="absolute z-10 top-3 right-[110px] text-xs text-white float-right bg-[#ebb62d] hover:bg-[#A57F1F] p-1 rounded-full flex items-center gap-1"
                onClick={() => handleUpvote()}
              ><StarIcon size={14} /> Upvote</button>

              <div className="bg-[#fafafa]">
                <div className="container mx-auto py-4 px-[20px] max-w-[768px]">
                  <div className="backdrop-blur-sm grid grid-cols-5 sm:grid-cols-5">
                    <div className="col-span-2 h-full z-5 p-2 mt-[-100px]">
                      <div className="grid justify-items-center">
                        {/* <Link href={`/mangas/${manga.source}/${manga.source_id}?secondary_source_id=${manga.secondary_source_id}`}> */}
                          <a>
                            <img
                              className={`rounded-lg h-50 w-30 shadow-md ${manga.title ? "" : "animate-pulse"}`}
                              src={(props.manga.cover_image && props.manga.cover_image[0].image_urls[0]) || "/images/default-book.png"}
                            />
                          </a>
                        {/* </Link> */}
                      </div>
                      <div className=''>
                        <small>
                          <button className="block w-full bg-[#ec294b] hover:bg-[#B11F38] text-white mt-2 p-1 text-center rounded-full" onClick={() => handleFollow()}>
                            <span className='text-xs flex gap-1 items-center justify-center'><HeartIcon size={14} /> {followed ? "Un-Follow" : "Follow"}</span>
                          </button>
                        </small>
                        <small>
                          <Link
                            href={`/mangas/${manga.source}/${manga.source_id}?secondary_source_id=${manga.secondary_source_id}`}
                            className="block w-full bg-[#3db3f2] hover:bg-[#333d43] text-white mt-2 p-1 text-center rounded-full"
                          >
                            <span className='text-xs flex gap-1 items-center justify-center'><EyeIcon size={14} /> Detail</span>
                          </Link>
                        </small>
                        <small>
                          <Link
                            href={`/mangas/${manga.source}/${manga.source_id}/read/${startReadDecider(chapters)}?secondary_source_id=${manga.secondary_source_id}`}
                            className="block w-full bg-[#3db3f2] hover:bg-[#318FC2] text-white mt-2 p-1 text-center rounded-full"
                          >
                            <span className='text-xs flex gap-1 items-center justify-center'><BookIcon size={14} /> Start Read</span>
                          </Link>
                        </small>
                        {continueManga.title && <div onClick={()=>changeUrl(props.manga)}>
                          <small>
                            <Link
                              href={continueManga.last_link || "#"}
                              className={`${continueManga.title ? "block" : "hidden"} w-full bg-[#3db3f2] hover:bg-[#318FC2] text-white p-1 text-center mt-2 rounded-full`}
                            >
                              <span className='text-xs flex gap-1 items-center justify-center'>
                                <PlayIcon size={14} />
                                Continue Ch {continueManga.last_chapter_read}
                              </span>
                            </Link>
                          </small>
                        </div>}
                      </div>
                    </div>
                    <div className="col-span-3 p-2">
                      <div className='max-h-[100px] overflow-auto mt-[-10px]'>
                        <span className='px-2 text-xs bg-gray-500 mb-1 text-white rounded-full'>{manga.source}</span>
                        <h1 className="text-[#5c728a] text-md">
                          { manga.title ? manga.title : <div className="h-3 bg-gray-600 rounded animate-pulse w-1/2"></div> }
                        </h1>
                      </div>
                      <hr/>
                      {
                        manga.description ?
                        <p className="text-xs text-[#7a858f] text-justify max-h-32 overflow-hidden overflow-y-scroll text-gray-500 mt-1">
                          {manga.description}
                        </p>
                        :
                        <div></div>
                      }
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="container mx-auto py-4 px-[20px] max-w-[768px] bg-gray-700 rounded-b-xl">
                  <div className="grid grid-cols-1">
                    <div className="p-2 max-h-48 overflow-hidden overflow-y-scroll">
                      {manga.chapters.map((chapter, idx) => (
                        <div className="" key={chapter.title} onClick={()=>changeUrl(props.manga)}>
                          <Link
                            href={`/mangas/${manga.source}/${manga.source_id}/read/${chapter.id}?secondary_source_id=${chapter.secondary_source_id}`}
                            className="bg-white hover:bg-gray-300 rounded-full mb-2 py-1 px-2 text-[#5c728a] text-center block w-full"
                          >
                            {chapter.title}
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* <div className="absolute bg-black bg-opacity-0 z-0 w-full top-0 h-screen" onClick={()=>setShow(!show)}></div> */}
          </div>
        </div>
      }
    </div>
  )
}
