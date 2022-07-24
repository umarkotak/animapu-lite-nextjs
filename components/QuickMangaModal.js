import { useState, useRef, useEffect } from 'react'
import { useRouter } from "next/router"
import Link from 'next/link'
import { useAlert } from 'react-alert'

import animapuApi from "../apis/AnimapuApi"

export default function QuickMangaModal(props) {
  const alert = useAlert()
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
      console.log(e)
    }
  }

  useEffect(() => {
    if (show) { GetMangaDetail() }
  // eslint-disable-next-line
  }, [show])

  var historyDetailKey = `ANIMAPU_LITE:HISTORY:LOCAL:DETAIL:${manga.source}:${manga.source_id}:${manga.secondary_source_id}`
  var listKey = `ANIMAPU_LITE:FOLLOW:LOCAL:LIST`
  var detailKey = `ANIMAPU_LITE:FOLLOW:LOCAL:DETAIL:${manga.source}:${manga.source_id}:${manga.secondary_source_id}`
  const [chapters, setChapters] = useState([{id: 1}])
  const [continueManga, setContinueManga] = useState({last_link: "#", last_chapter_read: 0})

  const [followed, setFollowed] = useState(false)

  function isContinuePossible() {
    try {
      if (typeof window !== "undefined") {
        if (localStorage.getItem(historyDetailKey)) {
          setContinueManga(JSON.parse(localStorage.getItem(historyDetailKey)))
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

  function handleFollow() {
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

    alert.info("Info || Manga ini udah masuk library kamu!")
  }

  async function handleUpvote() {
    if (!manga.source_id) { return }

    try {
      const response = await animapuApi.PostUpvoteManga(manga)
      const body = await response.json()
      console.log(body)
      if (response.status !== 200) {
        alert.error(`${body.error.error_code} || ${body.error.message}`)
        return
      }
      alert.info("Info || Upvote sukses!")

    } catch (e) {
      alert.error(e.message)
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
    if (typeof window !== "undefined") {
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
      <div className="absolute top-0 right-0 p-1 rounded-lg text-black hover:text-[#ec294b]" onClick={()=>setShow(!show)}>
        <button className="drop-shadow-md"><i className="fa-solid fa-ellipsis"></i></button>
      </div>
      {
        show &&
        <div>
          <div className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-screen justify-center items-center flex block bg-black bg-opacity-70" aria-modal="true">
            <div className="relative p-4 w-full max-w-md h-full">
              <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                <div className={`h-[100px] z-0 ${manga.title ? "" : "animate-pulse"}`} style={{
                  backgroundImage: `url(${manga.cover_image[0].image_urls[0]})`,
                  backgroundColor: "#d6e0ef",
                  backgroundPosition: "50% 35%",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover",
                }}>
                  <div className="backdrop-blur-md h-full"></div>
                </div>
                <button type="button" className="absolute z-10 top-3 right-2.5 bg-[#ec294b] text-white rounded-full text-sm py-1.5 px-2 inline-flex" onClick={()=>setShow(!show)}>
                  <i className="fa fa-xmark"></i>
                </button>
                <div className="bg-[#fafafa]">
                  <div className="container mx-auto py-4 px-[20px] max-w-[1040px]">
                    <div className="backdrop-blur-sm grid grid-cols-1">
                      <div className="h-full z-5 p-2 mt-[-100px]">
                        <div className="grid justify-items-center">
                          {/* <Link href={`/mangas/${manga.source}/${manga.source_id}?secondary_source_id=${manga.secondary_source_id}`}> */}
                            <a>
                              <img
                                className={`rounded-lg h-50 w-30 shadow-md ${manga.title ? "" : "animate-pulse"}`}
                                src={manga.cover_image[0].image_urls[0]}
                              />
                            </a>
                          {/* </Link> */}
                        </div>
                        <div className='flex'>
                          <button className="block w-full bg-[#ebb62d] hover:bg-[#A57F1F] text-white mt-2 p-2 text-center rounded-full mr-1" onClick={() => handleUpvote()}>
                            <i className="fa-solid fa-star"></i> Upvote
                          </button>
                          <button className="block w-full bg-[#ec294b] hover:bg-[#B11F38] text-white mt-2 p-2 text-center rounded-full ml-1" onClick={() => handleFollow()}>
                            <i className="fa-solid fa-heart"></i> {followed ? "Un-Follow" : "Follow"}
                          </button>
                        </div>
                        <div onClick={()=>changeUrl(props.manga)}>
                          <Link
                            href={`/mangas/${manga.source}/${manga.source_id}/read/${startReadDecider(chapters)}?secondary_source_id=${manga.secondary_source_id}`}
                          >
                            <a className="block w-full bg-[#3db3f2] hover:bg-[#318FC2] text-white mt-2 p-2 text-center rounded-full">
                              <i className="fa-solid fa-book"></i> Start Read
                            </a>
                          </Link>
                          <Link href={continueManga.last_link || "#"}>
                            <a className={`${continueManga.title ? "block" : "hidden"} w-full bg-[#3db3f2] hover:bg-[#318FC2] text-white p-2 text-center mt-2 rounded-full`}>
                              <i className="fa-solid fa-play"></i> {
                                continueManga.last_chapter_read ? `Cont Ch ${continueManga.last_chapter_read}` : "Continue"
                              }
                            </a>
                          </Link>
                        </div>
                      </div>
                      <div className="col-span-2 p-2">
                        <button
                          className="text-sm text-white float-right bg-[#3db3f2] hover:bg-[#318FC2] p-1 rounded-full"
                          onClick={(e)=>{
                            navigator.clipboard.writeText(`Read *${manga.title}* for free at https://animapu-lite.vercel.app/mangas/${manga.source}/${manga.source_id}?secondary_source_id=${manga.secondary_source_id}`)
                            alert.info("Info || Link berhasil dicopy!")
                          }}
                        ><i className="fa-solid fa-share-nodes"></i> Share</button>
                        <h1 className="text-[#5c728a] text-xl mb-1">
                          { manga.title ? manga.title : <div className="h-3 bg-slate-500 rounded mb-4 animate-pulse w-1/2"></div> }
                        </h1>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="container mx-auto py-4 px-[20px] max-w-[1040px]">
                    <div className="grid grid-cols-1">
                      <div className="p-2 max-h-60 overflow-hidden overflow-y-scroll">
                        {manga.chapters.map((chapter, idx) => (
                          <div className="" key={chapter.title} onClick={()=>changeUrl(props.manga)}>
                            <Link href={`/mangas/${manga.source}/${manga.source_id}/read/${chapter.id}?secondary_source_id=${manga.secondary_source_id}`}>
                              <a className="bg-white hover:bg-[#eeeeee] rounded mb-2 p-2 text-[#5c728a] text-center block w-full">
                                {chapter.title}
                              </a>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  )
}
