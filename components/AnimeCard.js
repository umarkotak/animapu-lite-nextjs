'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {Img} from 'react-image'
import animapuApi from '@/apis/AnimapuApi'
import { Button } from './ui/button'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import { BookIcon, BookmarkIcon, EyeIcon, HeartIcon, PlayIcon, Share2Icon, XIcon } from 'lucide-react'
import { Badge } from './ui/badge'

export default function AnimeCard(props) {
  const [showModal, setShowModal] = useState(false)

  function lastReadChapter() {
    if (props.anime.last_link) {
      return(`continue: ep ${props.anime.last_episode_watch}`)
    }
  }

  if (props.anime.shimmer) {
    return(
      <div
        className={`w-full max-w-[175px] h-[265px] mx-auto rounded-xl`}
        key={`card-${props.anime.source}-${props.anime.id}`}
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

  return (
    <div
      className={`w-full max-w-[175px] h-[265px] mx-auto`}
      key={`${props.anime.source}-${props.anime.id}`}
      id={`${props.anime.source}-${props.anime.id}`}
    >
      <div className="flex flex-col relative shadow-xl rounded-xl">
        <AnimeCardModal anime={props.anime} showModal={showModal} setShowModal={setShowModal} />

        <div className="overflow-hidden rounded-xl">
          <div className="bg-black rounded-xl" onClick={()=>setShowModal(!showModal)}>
            <img
              className={`w-full object-cover h-[265px] rounded-xl hover:scale-105 transition z-0 cursor-pointer`}
              src={(props?.anime?.cover_urls) || "/images/default-book.png"}
              alt="thumb"
            />
          </div>
        </div>

        <div>
          {props.show_hover_source && <div className="absolute bottom-16 left-1 px-2 py-1 leading-none bg-black bg-opacity-90 text-[12px]">
            <small>{props.anime.source}</small>
          </div>}
          <div
            className="absolute bottom-0 p-2 text-white rounded-b-xl w-full bg-black bg-opacity-75 hover:bg-opacity-90 backdrop-blur-sm cursor-pointer"
            onClick={()=>setShowModal(!showModal)}
          >
            <p className="text-sm leading-1 line-clamp-1">
              {props.anime.title}
            </p>
            <div className={`flex justify-between items-center text-sm text-[#75b5f0] mt-1`}>
              <span>{props.anime.latest_episode !== 0 ? `Ep ${props.anime.latest_episode}` : "Watch"}</span>
              <span className="text-[12px]">{lastReadChapter()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AnimeCardModal(props) {
  let router = useRouter()
  const query = router.query

  const [show, setShow] = useState(false)
  const [anime, setAnime] = useState({
    cover_urls: ["/images/animehub_cover.jpeg"], episodes: []
  })
  const [episodes, setEpisodes] = useState([])
  const [searchEpisode, setSearchEpisode] = useState("")
  const [continueWatchUrl, setContinueWatchUrl] = useState("#")
  const [continueWatchNumber, setContinueWatchNumber] = useState(0)

  async function GetAnimeDetail() {
    if (anime.id && anime.id !== "") { return }

    try {
      const response = await animapuApi.GetAnimeDetail({
        anime_source: props.anime.source,
        anime_id: props.anime.id
      })
      const body = await response.json()

      if (response.status !== 200) {
        console.log("error", body)
        return
      }

      // console.log("DETAIL RESP:", body.data)

      setAnime(body.data)
      setEpisodes(body.data.episodes.reverse())

    } catch (e) {
      alert(e.message)
    }
  }

  useEffect(() => {
    setShow(props.showModal)
  }, [props])

  useEffect(() => {
    if (show) { GetAnimeDetail() }

    props.setShowModal(show)
  }, [show])

  const [chapters, setChapters] = useState([{id: 1}])
  const [continueManga, setContinueManga] = useState({last_link: "#", last_episode_watch: 0})
  const [followed, setFollowed] = useState(props.anime.is_in_library)

  function isContinuePossible() {
    try {
      if (props.anime.last_episode_watch) {
        setContinueManga({last_link: props.anime.last_link, last_episode_watch: props.anime.last_episode_watch})
      }
    } catch (e) {
    }
  }

  useEffect(() => {
    // setEpisodes(anime.episodes.reverse())
    isContinuePossible()
  }, [anime])

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

  function startReadDecider(episodes) {
    try {
      return episodes.at(-1).id
    } catch {
      return 1
    }
  }

  useEffect(() => {
    if (show) {
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
              <div className={`h-[100px] z-0 ${anime.title ? "" : "animate-pulse"} rounded-xl`} style={{
                backgroundImage: `url(${(anime?.cover_urls && anime?.cover_urls[0]) || "/images/default-book.png"})`,
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
                    navigator.clipboard.writeText(`Watch *${anime.title}* for free at https://animapu.vercel.app/anime/${anime.source}/detail/${anime.id}/watch/undefined`)
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
                          className={`rounded-lg h-50 w-30 shadow-md ${anime.title ? "" : "animate-pulse"}`}
                          src={(anime?.cover_urls[0]) || "/images/default-book.png"}
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
                            href={`/anime/${anime.source}/detail/${anime.id}/watch/${startReadDecider(episodes)}?secondary_source_id=${anime.secondary_source_id}`}
                            className="block w-full bg-[#3db3f2] hover:bg-[#318FC2] text-white mt-2 p-1 text-center rounded-full"
                          >
                            <span className='text-xs flex gap-1 items-center justify-center'><BookIcon size={14} /> Start Watch</span>
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
                                Cont Ch {continueManga.last_episode_watch}
                              </span>
                            </Link>
                          </small>
                        </div>}
                      </div>
                    </div>
                    <div className="col-span-3 p-2">
                      <div className='max-h-[100px] overflow-auto mt-[-10px]'>
                        <Badge>{anime.source}</Badge>
                        <h1 className="text-md">
                          { anime.title ? anime.title : <div className="h-3 bg-gray-600 rounded animate-pulse w-1/2"></div> }
                        </h1>
                      </div>
                      <hr/>
                      {
                        anime.description ?
                        <p className="text-xs text-justify max-h-32 overflow-hidden overflow-y-scroll  mt-1">
                          {anime.description}
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
                      {episodes.map((episode, idx) => (
                        <div className="flex flex-row items-center gap-2" key={episode.id}>
                          <div className="w-full">
                            <Link href={`/anime/${anime.source}/detail/${anime.id}/watch/${episode.id}`}>
                              {/* <Button size="sm" className="w-full">{episode.title}</Button> */}
                              <Button size="sm" className="w-full">Episode {episode.number}</Button>
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
