'use client'

import { useRef, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {Img} from 'react-image'
import ReactPlayer from 'react-player'
const ReactPlayerCsr = dynamic(() => import('../ReactPlayerCsr'), { ssr: false })
import screenfull from 'screenfull'

import AnimapuApi from '@/models/AnimapuApi'
import AnimeCardRelationV3 from '../AnimeCardRelationV3'
import * as Cronitor from "@cronitorio/cronitor-rum"
import Utils from '@/models/Utils'

var mobileModeLimit = 470
var smallWebLimit = 1015

export default function WatchV3() {
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
    GetAnimeDetail(params.anime_id)
    GetEpisodeStream()
    setShowPlayer(true)
  }, [searchParams])

  var calling = false
  async function GetAnimeDetail(id) {
    if (calling) { return }
    calling = true

    if (anime.id && anime.id !== "") { return }

    try {
      const response = await AnimapuApi.GetAnimeDetail({
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
            setPreviousLink(`/animes/${params.anime_source}/detail/${tmpAnime.id}/watch/${tmpAnime.episodes[idx-1].id}`)
          } else { setPreviousLink(`#`) }
          if (tmpAnime.episodes[idx+1]) {
            setNextLink(`/animes/${params.anime_source}/detail/${tmpAnime.id}/watch/${tmpAnime.episodes[idx+1].id}`)
          } else { setNextLink(`#`) }
        }
      })

    } catch (e) {
      alert(e.message)
    }

    calling = false
  }

  async function GetOnlyAnimeDetail(id) {
    try {
      const response = await AnimapuApi.GetAnimeDetail({
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
      alert(e.message)
    }
  }

  async function GetEpisodeStream() {
    if (params.episode_id === "undefined") { return }
    setLoadingStream(true)
    try {
      const response = await AnimapuApi.GetAnimeWatch({
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
      alert(e.message)
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

  // HISTORY
  useEffect(() => {
    if (!localStorage) { return }
    if (!episode.id || episode.id === "" || episode.id === "undefined") { return }
    if (!anime.id || anime.id === "") { return }

    var keyHistoryList = "ANIMEHUB-LITE:HISTORY_LIST:V2"

    if (!localStorage.getItem(keyHistoryList)) {
      localStorage.setItem(keyHistoryList, JSON.stringify([]))
    }

    var historyList = JSON.parse(localStorage.getItem(keyHistoryList))

    var tmpEpisode = {...episode}
    tmpEpisode.title = anime.title
    tmpEpisode.cover_url = anime.cover_urls[0]
    tmpEpisode.cover_urls = anime.cover_urls
    tmpEpisode.pathname = window.location.pathname
    tmpEpisode.last_read_at = Utils.GetTodayDate()
    tmpEpisode.log_anime_id = anime.id

    if (historyList.length === 0) {
      historyList.unshift(tmpEpisode)
    } else if (historyList[0].id !== episode.id) {
      historyList.unshift(tmpEpisode)
    } else {
      // Do nothing
    }

    localStorage.setItem(keyHistoryList, JSON.stringify(historyList.slice(0, 100)))

    var keyHistoryDetailEp = `ANIMEHUB-LITE:HISTORY_DETAIL:EP:V2:${anime.id}:${tmpEpisode.id}`
    localStorage.setItem(keyHistoryDetailEp, JSON.stringify(tmpEpisode))

    var keyHistoryDetailAnime = `ANIMEHUB-LITE:HISTORY_DETAIL:ANIME:V2:${anime.id}`
    localStorage.setItem(keyHistoryDetailAnime, JSON.stringify({
      title: anime.title,
      cover_url: anime.cover_urls[0],
      pathname: window.location.pathname,
      episode_number: tmpEpisode.number,
      last_read_at: Utils.GetTodayDate(),
      log_anime_id: anime.id,
    }))

  }, [episode])

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
      {params.episode_id === "undefined" ? <div>
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

      <div className={pageModeClass(mobileMode, smallWebMode)}>
        {/* Main content */}
        <div className='w-full mr-4 mb-4'>
          {/* VIDEO PLAYER */}
          <div ref={videoPlayerDivRef} id="video-content" className={videoContainerClass(mobileMode, smallWebMode)}>
            <div className='relative shadow-2xl shadow-gray-900'>
              <div className={`w-full h-full bg-black rounded-xl ${mobileMode ? "" : "overflow-hidden"}`}>
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
                  <div style={{height: videoPlayerHeight}} className={`rounded-xl overflow-hidden ${(episodeStream.stream_type === "iframe") ? "block" : "hidden"}`}>
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
            <div className='flex'>
              <Link
                href={episodeStream.original_url ? `${episodeStream.original_url}` : `${anime.original_link}`}
                className='py-1 px-2 rounded-xl text-black bg-gray-200 hover:bg-gray-300 items-center'
              >
                Go to source
              </Link>
              {/* <button
                className='py-1 px-2 rounded-xl text-black bg-gray-200 hover:bg-gray-300 items-center ml-2'
                onClick={()=>{screenfull.request(document.querySelector('.react-player'))}}
              >
                Full Screen
              </button> */}
            </div>
            <div className='flex justify-end'>
              <Link
                className='py-1 px-2 rounded-xl text-black bg-gray-200 hover:bg-gray-300 items-center'
                href={previousLink}
              >
                <i className="fa-solid fa-circle-arrow-left"></i> Prev
              </Link>
              <Link
                className='py-1 px-2 rounded-xl text-black bg-gray-200 hover:bg-gray-300 ml-2'
                href={nextLink}
              >
                <i className="fa-solid fa-circle-arrow-right"></i> Next
              </Link>
            </div>
          </div>
          <div className={`flex justify-between mt-2 items-center text-xs ${mobileMode ? "mx-2" : ""}`}>
            <div>
              <div className={`flex items-center ${episodeStream.stream_type === "hls" ? "block" : "hidden"}`}>
                {/* <button
                  className='py-1 px-2 rounded-xl text-black bg-gray-200 hover:bg-gray-300 items-center'
                >
                  <i className="fa-solid fa-bookmark"></i> Bookmark
                </button> */}
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
          <div className={`flex flex-wrap w-full gap-2 ${mobileMode ? "px-2" : ""}`}>
            <div>Server:</div>

            {episodeStream?.iframe_urls && Object.keys(episodeStream?.iframe_urls).map((k) => (
              <button
                className={`
                  px-2 py-0.5 hover:bg-gray-700 rounded-full text-sm
                  ${episodeStream.iframe_url === episodeStream?.iframe_urls[k] ? "bg-blue-800" : "bg-gray-800"}
                `}
                onClick={(e)=>{setEpisodeStream({...episodeStream, iframe_url: episodeStream?.iframe_urls[k]})}}
              >{k}</button>
            ))}

            {episodeStream?.stream_options && episodeStream?.stream_options.length > 0 && episodeStream?.stream_options.map((stream_opt) => (
              <button
                className={`
                  px-2 py-0.5 hover:bg-gray-700 rounded-full text-sm
                  ${(episodeStream.resolution === stream_opt.resolution && episodeStream.stream_idx === stream_opt.index) || stream_opt.used ? "bg-blue-800" : "bg-gray-800"}`}
                onClick={()=>{changeServer(stream_opt.index, stream_opt.name, "360p")}}
              >
                {stream_opt.resolution} {stream_opt.name}
              </button>
            ))}
          </div>
          <div className='grid grid-cols-1 xl:grid-cols-2'>
            <div className={`flex flex-col mt-4 gap-2 ${mobileMode ? "px-2" : ""}`}>
              <div className={`flex flex-col gap-2 w-full text-left bg-gray-800 rounded-xl p-3 text-xs`}>
                <div className='flex flex-wrap'>
                  Release: {anime.release_year + " " +anime.release_season}
                </div>
                <div className='flex flex-wrap'>
                  {anime.genres && anime.genres.map((oneGenre)=>(
                    <div className='flex-none p-1 rounded-xl bg-gray-600 mr-1 mb-1' key={oneGenre}>{oneGenre}</div>
                  ))}
                </div>
                <div className='mt-1 max-h-20 overflow-auto text-justify '>
                  {anime.description}
                </div>
              </div>
            </div>

            <div className={`p-3 bg-gray-800 mt-4 rounded-xl text-xs ${mobileMode ? "mx-2" : "xl:ml-2"}`}>
              <div>Watch Log:</div>
              <div className='flex flex-col pt-2'>
                {watchLogs.map((oneWatchLog =>(
                  <Link href={oneWatchLog.pathname} key={oneWatchLog.pathname}>
                    <div className='flex items-center justify-between bg-gray-500 hover:bg-gray-600 px-1 py-0.5 rounded mb-2'>
                      <div>
                        <span>Episode {oneWatchLog.number}</span>
                        <span className='text-xs'> - {oneWatchLog.last_read_at}</span>
                      </div>

                      <div className='py-1 px-2 rounded-lg'>
                        <i className='fa-solid fa-play'></i>
                      </div>
                    </div>
                  </Link>
                )))}
              </div>
            </div>
          </div>
        </div>

        {/* Side content */}
        <div id="suggestion-content" className={`${mobileMode || smallWebMode ? "" : "min-w-[402px] max-w-[402px]"}`}>
          {anime.relations && anime.relations.length > 0 && <>
            <div className={`mb-0 pb-2 pr-4 ${mobileMode || smallWebMode ? "mx-2" : ""}`}>Relations</div>
            <div className={`mb-2 flex overflow-x-auto w-full pb-2 pr-4 ${mobileMode || smallWebMode ? "mx-2" : ""}`}>
              <div
                className={`w-32 ${episodeActiveAnime.id === anime.id ? "border-solid border-2 border-sky-500 rounded-xl" : null}`}
                onClick={()=>{changeEpisodeByAnimeID(anime.id)}}
              >
                <AnimeCardRelationV3 id={anime.id} relation={anime} />
              </div>
              {anime.relations.map((oneRelation) => (
                <div
                  className={`w-32 ml-3 ${episodeActiveAnime.id === oneRelation.id ? "border-solid border-2 border-sky-500 rounded-xl" : null}`}
                  onClick={()=>{changeEpisodeByAnimeID(oneRelation.id)}}
                  key={"relation-"+oneRelation.id}>
                  <AnimeCardRelationV3 relation={oneRelation} key={oneRelation.id} />
                </div>
              ))}
            </div>
          </>}

          <div className={`mb-2 pb-2 ${mobileMode || smallWebMode ? "mx-2" : ""}`}>
            <input
              type="text" placeholder="Search episode" className='w-full rounded-xl p-2 text-black'
              onChange={(e) => setSearchEpisode(e.target.value)}
            />
          </div>

          <div className=''>
            {episodes && episodes.map((oneEpisode)=>(
              <Link
                key={`${oneEpisode.source}-${oneEpisode.anime_id}-${oneEpisode.id}`}
                className={
                  `mb-3 flex rounded-xl p-2 hover:bg-gray-700
                  ${params.episode_id === oneEpisode.id ? "bg-gray-800" : "bg-gray-950"}
                  ${mobileMode || smallWebMode ? "mx-2" : "min-w-[402px] max-w-[402px]"}`
                }
                href={`/animes/${params.anime_source}/detail/${oneEpisode.anime_id}/watch/${oneEpisode.id}`}
              >
                <div className='min-w-[168px] max-w-[168px] h-[94px]'>
                  <div className='relative overflow-clip rounded-xl'>
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
