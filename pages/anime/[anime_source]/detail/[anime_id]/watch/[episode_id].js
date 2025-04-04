'use client'

import { useRef, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {Img} from 'react-image'
import ReactPlayer from 'react-player'
// const ReactPlayerCsr = dynamic(() => import('../ReactPlayerCsr'), { ssr: false })
// import screenfull from 'screenfull'

import animapuApi from '@/apis/AnimapuApi'
// import AnimeCardRelationV3 from '../AnimeCardRelationV3'
import * as Cronitor from "@cronitorio/cronitor-rum"
import Utils from '@/models/Utils'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { ChevronDownIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'

var mobileModeLimit = 470
var smallWebLimit = 1015

export default function WatchAnime() {
  let router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  var rPlayerRef = useRef(null)

  const [anime, setAnime] = useState({})
  const [episodes, setEpisodes] = useState([])
  const [episode, setEpisode] = useState({})
  const [episodeStream, setEpisodeStream] = useState({
    raw_stream_url: "", stream_options: [],
  })

  const [searchEpisode, setSearchEpisode] = useState('')
  const [episodeActiveAnime, setEpisodeActiveAnime] = useState({})
  const [nextLink, setNextLink] = useState('#')
  const [previousLink, setPreviousLink] = useState('#')

  const [videoPlayerHeight, setVideoPlayerHeight] = useState(0)
  const [streamState, setStreamState] = useState("")
  const [showPlayer, setShowPlayer] = useState(false)
  const [loadingStream, setLoadingStream] = useState(false)
  const [showServersModal, setShowServersModal] = useState(false)

  // WINDOW SIZE
  const [mobileMode, setMobileMode] = useState(true)
  const [smallWebMode, setSmallWebMode] = useState(true)
  useEffect(() => {
    if (typeof(window) === "undefined") { return }

    if (window.innerWidth <= mobileModeLimit) {
      setMobileMode(true)
      setSmallWebMode(true)
    } else if (window.innerWidth <= smallWebLimit) {
      setMobileMode(false)
      setSmallWebMode(true)
    } else {
      setMobileMode(false)
      setSmallWebMode(false)
    }

    const onResize = () => {
      if (window.innerWidth <= mobileModeLimit) {
        setMobileMode(true)
        setSmallWebMode(true)
      } else if (window.innerWidth <= smallWebLimit) {
        setMobileMode(false)
        setSmallWebMode(true)
      } else {
        setMobileMode(false)
        setSmallWebMode(false)
      }
    }

    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("resize", onResize)
    }
  }, [])

  // VIDEO PLAYER SIZE
  const videoPlayerDivRef = useRef()
  useEffect(() => {
    if (!videoPlayerDivRef.current) return
    const resizeObserver = new ResizeObserver(() => {
      if (!videoPlayerDivRef.current) return
      var res = Math.floor(videoPlayerDivRef.current.offsetWidth / (16 / 9))
      setVideoPlayerHeight(res)
    })
    resizeObserver.observe(videoPlayerDivRef.current)
    return () => resizeObserver.disconnect() // clean up
  }, [])

  useEffect(() => {
    if (window) { window.scrollTo(0, 0) }

    if (!params) { return }

    if (animapuApi.GetUserLogin().logged_in === "") {
      toast.error("Please login first to start watching")
      router.push("/login")
    }

    GetAnimeDetail(params.anime_id)

    GetEpisodeStream()

    setShowPlayer(true)

    episodes && episodes.length > 0 && episodes.map((ep, idx) => {
      if (`${ep.id}` === `${params.episode_id}`) {
        setEpisode(ep)

        var trackData = `W_${removeSpecialCharacters(`${anime.title}`.substring(0,20))}_${removeSpecialCharacters(ep.number)}`
        console.log("TRACKING", trackData)
        Cronitor.track(trackData)
      }

      if (params.episode_id === ep.id) {
        if (episodes[idx-1]) {
          setPreviousLink(`/anime/${anime.source}/detail/${anime.id}/watch/${episodes[idx-1].id}`)
        } else { setPreviousLink(`#`) }
        if (episodes[idx+1]) {
          setNextLink(`/anime/${anime.source}/detail/${anime.id}/watch/${episodes[idx+1].id}`)
        } else { setNextLink(`#`) }
      }
    })

  }, [searchParams, params])

  var calling = false
  async function GetAnimeDetail(id) {
    if (calling) { return }
    calling = true

    if (anime.id && anime.id !== "") { return }

    try {
      const response = await animapuApi.GetAnimeDetail({
        anime_source: params.anime_source,
        anime_id: id
      })
      const body = await response.json()
      if (response.status !== 200) {
        console.log("error", body)
        return
      }

      var tmpAnime = body.data

      setAnime(tmpAnime)
      setEpisodeActiveAnime(tmpAnime)
      setEpisodes(tmpAnime.episodes)

      tmpAnime.episodes && tmpAnime.episodes.length > 0 && tmpAnime.episodes.map((ep) => {
        if (`${ep.id}` === `${params.episode_id}`) {
          setEpisode(ep)

          var trackData = `W_${removeSpecialCharacters(`${tmpAnime.title}`.substring(0,20))}_${removeSpecialCharacters(ep.number)}`
          console.log("TRACKING", trackData)
          Cronitor.track(trackData)
        }
      })

      tmpAnime.episodes.forEach((oneEpisode, idx) => {
        if (params.episode_id === oneEpisode.id) {
          if (tmpAnime.episodes[idx-1]) {
            setPreviousLink(`/anime/${params.anime_source}/detail/${tmpAnime.id}/watch/${tmpAnime.episodes[idx-1].id}`)
          } else { setPreviousLink(`#`) }
          if (tmpAnime.episodes[idx+1]) {
            setNextLink(`/anime/${params.anime_source}/detail/${tmpAnime.id}/watch/${tmpAnime.episodes[idx+1].id}`)
          } else { setNextLink(`#`) }
        }
      })

    } catch (e) {
      alert(`GetAnimeDetail ${e.message}`)
    }

    calling = false
  }

  async function GetOnlyAnimeDetail(id) {
    try {
      const response = await animapuApi.GetAnimeDetail({
        anime_source: params.anime_source,
        anime_id: id
      })
      const body = await response.json()
      if (response.status !== 200) {
        console.log("error", body)
        return
      }

      setEpisodeActiveAnime(body.data)
      setEpisodes(body.data.episodes)

    } catch (e) {
      alert(`GetOnlyAnimeDetail ${e.message}`)
    }
  }

  async function GetEpisodeStream() {
    if (!params.episode_id || params.episode_id === "undefined") { return }
    setLoadingStream(true)
    try {
      const response = await animapuApi.GetAnimeWatch({
        anime_source: params.anime_source,
        anime_id: params.anime_id,
        episode_id: params.episode_id,
        resolution: searchParams.get("resolution") || "",
        stream_idx: searchParams.get("stream_idx") || "",
      })
      const body = await response.json()
      if (response.status !== 200) {
        setStreamState("error")
        console.log("error", body)
        return
      }
      setEpisodeStream(body.data)

    } catch (e) {
      alert(`GetEpisodeStream ${e.message}`)
    }
    setLoadingStream(false)
  }

  useEffect(() => {
    if (!episodeActiveAnime.episodes) { return }

    setEpisodes(
      episodeActiveAnime.episodes.filter((ep) => {
        return `${ep.number}`.toLowerCase().includes(searchEpisode.toLowerCase())
      })
    )
  }, [searchEpisode])

  function changeEpisodeByAnimeID(animeID) {
    GetOnlyAnimeDetail(animeID)
  }

  const onChangeBitrate = (event) => {
    try {
      const internalPlayer = rPlayerRef.current?.getInternalPlayer('hls')
      if (internalPlayer) {
        // currentLevel expect to receive an index of the levels array
        internalPlayer.currentLevel = event.target.value
      }
    } catch (error) {
      console.error(error)
    }
  }

  const [hlsLevels, setHlsLevels] = useState([])
  const onReactPlayerReady = () => {
    try {
      var tmpHlsLevels = []
      if (rPlayerRef.current?.getInternalPlayer('hls')?.levels) {
        tmpHlsLevels = rPlayerRef.current?.getInternalPlayer('hls')?.levels
      }

      // console.log("UMAR2", rPlayerRef.current?.getInternalPlayer('hls').levels)

      setHlsLevels(tmpHlsLevels)
    } catch (error) {
      console.error(error)
    }
  }

  const [watchLogs, setWatchLogs] = useState([])
  useEffect(() => {
    GetWatchLog()
  }, [episode])
  function GetWatchLog() {
    if (!localStorage) { return }

    if (!anime || anime.id === "") { return }

    var keyHistoryList = "ANIMEHUB-LITE:HISTORY_LIST:V2"

    if (!localStorage.getItem(keyHistoryList)) { return }

    var tmpWatchLogs = JSON.parse(localStorage.getItem(keyHistoryList))

    var filteredWatchLogs = tmpWatchLogs.filter((oneWatchLog)=>{
      return oneWatchLog.log_anime_id == anime.id
    })

    setWatchLogs(filteredWatchLogs.slice(0, 3))
  }

  function changeServer(streamIdx, streamName, resolution) {
    window.location.replace(`${window.location.pathname}?resolution=${resolution}&stream_idx=${streamIdx}`)
  }

  return (
    <main className={`pb-[100px] min-h-screen ${mobileMode ? "" : "m-6"}`}>
      {!params || params.episode_id === "undefined" ? <div>
        <div className='w-full rounded-lg bg-red-500 p-2 mb-4 flex max-w-[1700px] mx-auto'>
          Please select the episode on the right
        </div>
      </div> : null}

      {streamState === "error" ? <div>
        <div className='w-full rounded-lg bg-red-500 p-2 mb-4 flex max-w-[1700px] mx-auto'>
          Sorry, stream is broken or not available at the moment
        </div>
      </div> : null}

      {loadingStream ? <div>
        <div className='w-full rounded-lg bg-blue-500 p-2 mb-4 flex max-w-[1700px] mx-auto'>
          <span>Please wait, loading stream . . .</span>
        </div>
      </div> : null}

      <Drawer open={showServersModal} onOpenChange={setShowServersModal}>
        <DrawerContent>
          <div className='overflow-auto h-[450px] mx-auto w-full max-w-md'>
            <DrawerHeader className="text-left">
              <DrawerTitle>Select Servers</DrawerTitle>
            </DrawerHeader>
            <div className='flex flex-col gap-2 p-4'>
              {episodeStream?.stream_options && episodeStream?.stream_options.length > 0 && episodeStream?.stream_options.map((stream_opt) => (
                <Button
                  onClick={()=>{changeServer(stream_opt.index, stream_opt.name, stream_opt.resolution)}}
                  size="sm"
                  variant={`${(episodeStream.resolution === stream_opt.resolution && episodeStream.stream_idx === stream_opt.index) || stream_opt.used ? "default" : "outline"}`}
                >
                  {stream_opt.resolution} {stream_opt.name}
                </Button>
              ))}
              {episodeStream?.iframe_urls && Object.keys(episodeStream?.iframe_urls).map((k) => (
                <Button
                  onClick={(e)=>{setEpisodeStream({...episodeStream, iframe_url: episodeStream?.iframe_urls[k]})}}
                  size="sm"
                  variant={`${episodeStream.iframe_url === episodeStream?.iframe_urls[k] ? "default" : "outline"}`}
                >
                  {k}
                </Button>
              ))}
            </div>
            <DrawerFooter className="pt-2">
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      <div className={pageModeClass(mobileMode, smallWebMode)}>
        {/* Main content */}
        <div className='w-full mr-4 mb-4'>
          {/* VIDEO PLAYER */}
          <div ref={videoPlayerDivRef} id="video-content" className={videoContainerClass(mobileMode, smallWebMode)}>
            <div className='relative shadow-2xl shadow-gray-900'>
              <div className={`w-full h-full bg-black ${mobileMode ? "" : "overflow-hidden"}`}>
                {showPlayer ? <>
                  <div style={{height: videoPlayerHeight}} className={`${(episodeStream.stream_type === "hls" || episodeStream.stream_type === "mp4") ? "block" : "hidden"}`}>
                    <ReactPlayer
                      ref={rPlayerRef}
                      url={episodeStream.raw_stream_url}
                      playing={true}
                      controls={true}
                      width={"100%"}
                      height={"100%"}
                      onReady={()=>onReactPlayerReady()}
                    />
                  </div>
                  <div style={{height: videoPlayerHeight}} className={`overflow-hidden ${(episodeStream.stream_type === "iframe") ? "block" : "hidden"}`}>
                    {/* <div>Iframe URL: {episodeStream.stream_type} | {episodeStream.iframe_url}</div> */}
                    <iframe
                      className='h-full w-full'
                      src={episodeStream.iframe_url}
                      allowFullScreen={true}
                    />
                  </div>
                </> : null}
              </div>
            </div>
          </div>

          <div
            className={`flex justify-between items-center ${mobileMode ? "mx-2" : ""} `}
            style={{marginTop: (mobileMode ? `${videoPlayerHeight+16}px` : "16px")}}
          >
            <div className="flex-auto font-semibold text-2xl leading-relaxed max-h-20 overflow-auto">
              {anime.title} {episode.number ? `- Episode ${episode.number}` : null}
            </div>
          </div>
          <div className={`flex justify-between mt-4 items-center text-xs ${mobileMode ? "mx-2" : ""}`}>
            <div className='flex justify-start gap-2'>
              <Link href={episodeStream.original_url ? `${episodeStream.original_url}` : `${anime.original_link}`}>
                <Button size="xs">Watch on source</Button>
              </Link>
              {/* <button
                className='py-1 px-2 rounded-xl text-black bg-gray-200 hover:bg-gray-300 items-center ml-2'
                onClick={()=>{screenfull.request(document.querySelector('.react-player'))}}
              >
                Full Screen
              </button> */}
              <Button size="xs" onClick={()=>setShowServersModal(!showServersModal)}>
                Select server
                <ChevronDownIcon size={14} />
              </Button>
            </div>
            <div className='flex justify-end gap-2'>
              <Link href={previousLink}><Button size="xs">Prev</Button></Link>
              <Link href={nextLink}><Button size="xs">Next</Button></Link>
            </div>
          </div>
          <div className={`flex justify-between mt-2 items-center text-xs ${mobileMode ? "mx-2" : ""}`}>
            <div>
              <div className={`flex items-center ${episodeStream.stream_type === "hls" ? "block" : "hidden"}`}>
                <span className='mr-2'>Res:</span>
                <select onChange={onChangeBitrate} className='text-black p-1 border rounded-xl'>
                  {hlsLevels.map(
                    (level, id) => <option key={id} value={id}>
                      {level.name}
                    </option>
                  )}
                </select>
              </div>
            </div>
            <div className='flex justify-end'>
              <div className={`${episodeStream.stream_type === "hls" ? "block" : "hidden"}`}>
                <button
                  className='py-1 px-2 rounded-xl text-black bg-gray-200 hover:bg-gray-300 items-center'
                  onClick={()=>{rPlayerRef.current?.seekTo(rPlayerRef.current?.getCurrentTime()-5)}}
                >
                  <i className="fa-solid fa-angles-left"></i> -5s
                </button>
                <button
                  className='py-1 px-2 rounded-xl text-black bg-gray-200 hover:bg-gray-300 items-center ml-2'
                  onClick={()=>{rPlayerRef.current?.seekTo(rPlayerRef.current?.getCurrentTime()+5)}}
                >
                  <i className="fa-solid fa-angles-right"></i> +5s
                </button>
                <button
                  className='py-1 px-2 rounded-xl text-black bg-gray-200 hover:bg-gray-300 ml-2'
                  onClick={()=>{rPlayerRef.current?.seekTo(rPlayerRef.current?.getCurrentTime()+30)}}
                >
                  <i className="fa-solid fa-angles-right"></i> +30s
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Side content */}
        <div id="suggestion-content" className={`${mobileMode || smallWebMode ? "" : "min-w-[402px] max-w-[402px]"}`}>
          <div className={`mb-2 pb-2 ${mobileMode || smallWebMode ? "mx-2" : ""}`}>
            <Input
              type="text" placeholder="Search episode"
              onChange={(e) => setSearchEpisode(e.target.value)}
            />
          </div>

          <div className=''>
            {episodes && episodes.map((oneEpisode)=>(
              <Link
                key={`${oneEpisode.source}-${oneEpisode.anime_id}-${oneEpisode.id}`}
                className={
                  `mb-3 flex p-2 hover:bg-gray-700
                  ${params.episode_id === oneEpisode.id ? "bg-gray-800" : "bg-gray-950"}
                  ${mobileMode || smallWebMode ? "mx-2" : "min-w-[402px] max-w-[402px]"}`
                }
                href={`/anime/${params.anime_source}/detail/${oneEpisode.anime_id}/watch/${oneEpisode.id}`}
              >
                <div className='min-w-[168px] max-w-[168px] h-[94px]'>
                  <div className='relative overflow-clip'>
                    <Img
                      className={`shadow-md w-[168px] h-[94px]
                      hover:scale-110 transition duration-500 cursor-pointer overflow-clip object-none`}
                      src={oneEpisode?.cover_urls || "/images/thumb_not_found_1.png"}
                      alt="thumb"
                    />
                    {!oneEpisode.cover_url && !anime.cover_url ? <div
                      className={`flex flex-col justify-center items-center content-center absolute bg-black bg-opacity-50 top-0 left-0 h-full w-full text-white
                      hover:scale-110 transition duration-500 cursor-pointer overflow-clip`}
                    ><span>Episode {oneEpisode.number}</span></div> : null}
                  </div>
                </div>
                <div className='pr-2'>
                  <div className='w-full ml-2 flex flex-col'>
                    {oneEpisode.use_title ? <>
                      <span>{oneEpisode.title}</span>
                      {/* <span>{oneEpisode.id}</span> */}
                    </> : <>
                      <span>Episode {oneEpisode.number}</span>
                      <span className="flex text-sm mt-1 items-center">
                        <span className='w-full'>{episodeActiveAnime.title}</span>
                      </span>
                    </>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  )

  function pageModeClass(tmpMobileMode, tmpSmallWebMode) {
    if (tmpMobileMode) { return "flex flex-col" }
    if (tmpSmallWebMode) { return `flex flex-col` }
    return `flex max-w-[1700px] mx-auto`
  }

  function videoContainerClass(tmpMobileMode, tmpSmallWebMode) {
    if (tmpMobileMode) { return "w-full fixed z-10 top-12" }
    if (tmpSmallWebMode) { return `w-full` }
    return `w-full`
  }

  function removeSpecialCharacters(inputString) {
    // Use a regular expression to remove non-alphanumeric characters
    return `${inputString}`.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  }
}
