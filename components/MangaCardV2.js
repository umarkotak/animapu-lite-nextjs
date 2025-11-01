import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/router"
import { BookIcon, BookmarkIcon, DownloadIcon, Eye, EyeIcon, Heart, HeartIcon, PlayIcon, Share2Icon, StarIcon, XIcon } from 'lucide-react'
import { toast } from 'react-toastify'
import Link from 'next/link'

import animapuApi from "../apis/AnimapuApi"
import QuickMangaModal from "./QuickMangaModal"
import Manga from "../models/Manga"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import utils from "@/models/Utils"

export default function MangaCardV2(props) {
  const [showModal, setShowModal] = useState(false)

  function lastReadChapter() {
    if (props.manga.last_link) {
      return(`continue: ch ${props.manga.last_chapter_read}`)
    }
  }

  if (props.manga.shimmer) {
    return(
      <div
        className={`w-full max-w-[175px] h-[265px] mx-auto rounded-xl`}
        key={`card-${props.manga.source}-${props.manga.source_id}`}
      >
        <div className="w-[175px] h-[265px] rounded-xl">
          <div className="flex flex-col justify-end relative z-10 animate-pulse shadow-xl">
            <div className="w-full h-[265px] rounded-xl bg-slate-500">
            </div>

            <div className="absolute bg-black bg-opacity-75 p-2 text-white z-10 rounded-b-xl w-full">
              <div className="h-2 bg-slate-500 rounded mb-2"></div>
              <div className="h-2 bg-slate-500 rounded mb-2"></div>
              <div className="h-3 w-12 bg-blue-500 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return(
    <div
      className={`w-full max-w-[175px] h-[265px] mx-auto group`}
      key={`${props.manga.source}-${props.manga.source_id}`}
      id={`${props.manga.source}-${props.manga.source_id}`}
    >
      <div className="flex flex-col relative shadow-xl rounded-xl">
        <MangaCardModal manga={props.manga} showModal={showModal} setShowModal={setShowModal} />

        <div className="overflow-hidden rounded-xl">
          <div className="bg-black rounded-xl" onClick={()=>setShowModal(!showModal)}>
            <img
              className={`w-full object-cover h-[265px] rounded-xl group-hover:scale-105 transition z-0 cursor-pointer`}
              src={
                (props.manga.cover_image && props.manga.cover_image[0] && props.manga.cover_image[0].image_urls && props.manga.cover_image[0].image_urls[0])
                  || "/images/default-book.png"
              }
              alt="thumb"
            />
          </div>
        </div>

        <div>
          {props.show_hover_source && <div className="absolute bottom-16 left-1 px-2 py-1 leading-none bg-black bg-opacity-90 text-[12px]">
            <small>{props.manga.source}</small>
          </div>}
          {props.show_updated_at && <div className="absolute bottom-16 left-1 px-2 py-1 leading-none bg-black bg-opacity-90 text-[12px]">
            <small>last update: {utils.GetTimeElapsed(props.manga.updated_at)}</small>
          </div>}
          <div
            className="absolute bottom-0 p-2 text-white rounded-b-xl w-full bg-black/80 backdrop-blur-sm cursor-pointer"
            onClick={()=>setShowModal(!showModal)}
          >
            <p className="text-sm line-clamp-2 group-hover:text-blue-400">
              {props.manga.title}
            </p>
            <div className={`flex justify-between items-center text-sm text-[#75b5f0] mt-1`}>
              <span>{props.manga.latest_chapter_number !== 0 ? `Ch ${props.manga.latest_chapter_number}` : "Read"}</span>
              <span className="text-[12px]">{lastReadChapter()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function MangaCardModal(props) {
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

  const [chapters, setChapters] = useState([{id: 1}])
  const [continueManga, setContinueManga] = useState({last_link: "#", last_chapter_read: 0})
  const [followed, setFollowed] = useState(props.manga.is_in_library)

  function isContinuePossible() {
    try {
      var mangaObj = new Manga(props.manga, localStorage.getItem("ANIMAPU_LITE:USER:UNIQUE_SHA"))

      if (props.manga.last_chapter_read) {
        setContinueManga({last_link: props.manga.last_link, last_chapter_read: props.manga.last_chapter_read})
      }
    } catch (e) {
    }
  }

  useEffect(() => {
    setChapters(manga.chapters)
    isContinuePossible()
  }, [manga])

  async function HandleBookmark() {
    if (!manga.source_id) { return }

    if (followed) {
      setFollowed(false)
    } else {
      setFollowed(true)
    }

    // API CALL
    try {
      var callParams = {source: manga.source, source_id: manga.source_id}
      if (followed) {
        const response = await animapuApi.PostRemoveMangaFromLibrary(callParams)
        const body = await response.json()
        if (response.status !== 200) {
          toast.error(`${body.error.error_code} || ${body.error.message}`)
          return
        }
      } else {
        const response = await animapuApi.PostAddMangaToLibrary(callParams)
        const body = await response.json()
        if (response.status !== 200) {
          toast.error(`${body.error.error_code} || ${body.error.message}`)
          return
        }
      }
    } catch (e) {
      toast.error(`Error: ${e}`)
    }

    if (followed) {
      toast.info("Manga ini udah dihapus dari library kamu!")
    } else {
      toast.info("Manga ini udah disimpen ke library kamu!")
    }
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
      toast.info("Upvote sukses!")

    } catch (e) {
      toast.error(e.message)
    }
  }

  function startReadDecider(chapters) {
    try {
      return chapters.at(-1).id
    } catch {
      return 1
    }
  }

  useEffect(() => {
    if (show) {
      router.push({
        pathname: window.location.pathname,
        query: {
          ...query,
          back_page: query.page,
          selected: `${props.manga.source}-${props.manga.source_id}`,
        },
      }, undefined, { shallow: true })
      return
    }

  }, [show])

  return(
    <div>
      {!props.disableBookmarkIcon && <div className="absolute top-1 right-1 p-1 rounded-lg text-black hover:text-[#ec294b] z-10" onClick={() => HandleBookmark()}>
        <button className="drop-shadow-sm bg-white bg-opacity-50 backdrop-blur rounded-full p-1">
          <span className={`${followed ? "text-[#ec294b]": ""}`}><BookmarkIcon strokeWidth={3} size={20} /></span>
        </button>
      </div>}
      {
        show &&
        <div className='z-10'>
          <div className="fixed top-0 right-0 left-0 bg-black bg-opacity-70 h-screen w-full z-20 backdrop-blur-sm" onClick={()=>setShow(!show)}></div>
          <div className="fixed mx-auto inset-x-0 top-[40px] p-4 w-full max-w-md z-20">
            <div className="relative bg-white rounded-xl shadow dark:bg-gray-700 z-10 overflow-hidden border border-primary">
              <div className={`h-[100px] z-0 ${manga.title ? "" : "animate-pulse"} rounded-xl`} style={{
                backgroundImage: `url(${(manga?.cover_image && manga?.cover_image[0]?.image_urls[0]) || "/images/default-book.png"})`,
                backgroundColor: "#d6e0ef",
                backgroundPosition: "50% 35%",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
              }}>
                <div className="backdrop-blur-md h-full"></div>
              </div>
              <div className="absolute z-10 top-3 right-2.5 flex flex-row gap-2 items-center">
                <Button
                  size="sm"
                  onClick={(e)=>{
                    navigator.clipboard.writeText(`Read *${manga.title}* for free at https://animapu.vercel.app/mangas/${manga.source}/${manga.source_id}?secondary_source_id=${manga.secondary_source_id}`)
                    toast.info("Link berhasil dicopy!")
                  }}
                ><Share2Icon size={14} /> Share</Button>
                <Button
                  size="sm"
                  onClick={()=>setShow(!show)}
                >
                  <XIcon size={14} />
                </Button>
              </div>

              <div className="bg-accent">
                <div className="container mx-auto py-4 px-[20px] max-w-[768px]">
                  <div className="backdrop-blur-sm grid grid-cols-5 sm:grid-cols-5">
                    <div className="col-span-2 h-full z-5 p-2 mt-[-100px]">
                      <div className="grid justify-items-center">
                        <img
                          className={`rounded-lg h-50 w-30 shadow-md ${manga.title ? "" : "animate-pulse"}`}
                          src={(manga.cover_image && manga.cover_image[0].image_urls[0]) || "/images/default-book.png"}
                        />
                      </div>
                      <div className=''>
                        <small>
                          <button className="block w-full bg-[#ec294b] hover:bg-[#B11F38] text-white mt-2 p-1 text-center rounded-full" onClick={() => HandleBookmark()}>
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
                        {continueManga.last_link && continueManga.last_link !== "#" && <div>
                          <small>
                            <Link
                              href={continueManga.last_link || "#"}
                              className={`block w-full bg-[#3db3f2] hover:bg-[#318FC2] text-white p-1 text-center mt-2 rounded-full`}
                            >
                              <span className='text-xs flex gap-1 items-center justify-center'>
                                <PlayIcon size={14} />
                                Cont Ch {continueManga.last_chapter_read}
                              </span>
                            </Link>
                          </small>
                        </div>}
                      </div>
                    </div>
                    <div className="col-span-3 p-2">
                      <div className='max-h-[100px] overflow-auto mt-[-10px]'>
                        <Badge>{manga.source}</Badge>
                        <h1 className="text-md">
                          { manga.title ? manga.title : <div className="h-3 bg-gray-600 rounded animate-pulse w-1/2"></div> }
                        </h1>
                      </div>
                      <hr/>
                      {
                        manga.description ?
                        <p className="text-xs text-justify max-h-32 overflow-hidden overflow-y-scroll  mt-1">
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
                <div className="container mx-auto py-4 px-[20px] max-w-[768px] bg-background rounded-b-xl">
                  <div className="grid grid-cols-1">
                    <div className="p-2 flex flex-col gap-2 max-h-48 overflow-hidden overflow-y-scroll">
                      {manga.chapters.map((chapter, idx) => (
                        <div className="flex flex-row items-center gap-2" key={chapter.title}>
                          <a
                            href={animapuApi.DownloadMangaChapterPdfUri({
                              manga_source: manga.source,
                              manga_id: manga.source_id,
                              chapter_id: chapter.id,
                            })}
                            onClick={()=>{toast.info("we are preparing your file, just wait...")}}
                          >
                            <Button size="sm" className="w-full"><DownloadIcon /></Button>
                          </a>
                          <div className="w-full">
                            <Link
                              href={`/mangas/${manga.source}/${manga.source_id}/read/${chapter.id}`}
                            >
                              <Button size="sm" className="w-full">{chapter.title}</Button>
                            </Link>
                          </div>
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