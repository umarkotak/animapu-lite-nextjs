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
import Utils from '@/models/Utils'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { ArrowLeft, ChevronDownIcon, LoaderCircle, Maximize, Minimize, Pause, Play, RotateCcw, RotateCw, Settings, SkipBack, SkipForward } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'

var mobileModeLimit = 470
var smallWebLimit = 1015

function WatchAnime() {
  let router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const resolution = searchParams.get("resolution") || ""
  const streamIdx = searchParams.get("stream_idx") || ""

  var rPlayerRef = useRef(null)
  const nativeVideoRef = useRef(null)
  const controlsTimerRef = useRef(null)
  const lastTouchRef = useRef(0)

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
  const [showEpisodesModal, setShowEpisodesModal] = useState(false)
  const [immersive, setImmersive] = useState(true)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [playing, setPlaying] = useState(true)
  const [playedSeconds, setPlayedSeconds] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPWA, setIsPWA] = useState(null)
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false)
  const hasServerOptions = episodeStream.stream_options?.length > 0 || Object.keys(episodeStream.iframe_urls || {}).length > 0

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

  useEffect(() => {
    if (!immersive || !mobileMode) { return }
    // Browsers may reject this until a user gesture, so it is also retried on the first tap.
    window.screen?.orientation?.lock?.('landscape').catch(() => {})
    return () => window.screen?.orientation?.unlock?.()
  }, [immersive, mobileMode])

  useEffect(() => {
    setIsPWA(window.matchMedia('(display-mode: fullscreen)').matches || window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true)
    const onFullscreenChange = () => setIsNativeFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  useEffect(() => () => clearTimeout(controlsTimerRef.current), [])

  useEffect(() => {
    clearTimeout(controlsTimerRef.current)
    controlsTimerRef.current = setTimeout(() => setControlsVisible(false), 2500)
    return () => clearTimeout(controlsTimerRef.current)
  }, [immersive])

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

    // if (animapuApi.GetUserLogin().logged_in === "") {
    //   toast.error("Please login first to start watching")
    //   router.push("/login")
    //   return
    // }

    let cancelled = false
    async function loadWatch() {
      const detailLoaded = await GetAnimeDetail(params.anime_id)
      if (!cancelled && detailLoaded) {
        await GetEpisodeStream()
        if (!cancelled) { setShowPlayer(true) }
      }
    }
    loadWatch()

    return () => { cancelled = true }

  }, [params?.anime_source, params?.anime_id, params?.episode_id, resolution, streamIdx])

  async function GetAnimeDetail(id) {
    if (anime.id === id) {
      setEpisode(anime.episodes?.find((ep) => `${ep.id}` === `${params.episode_id}`) || {})
      return true
    }

    try {
      const response = await animapuApi.GetAnimeDetail({
        anime_source: params.anime_source,
        anime_id: id
      })
      const body = await response.json()
      if (response.status !== 200) {
        console.log("error", body)
        return false
      }

      var tmpAnime = body.data

      setAnime(tmpAnime)
      setEpisodeActiveAnime(tmpAnime)
      setEpisodes(tmpAnime.episodes)

      tmpAnime.episodes && tmpAnime.episodes.length > 0 && tmpAnime.episodes.map((ep) => {
        if (`${ep.id}` === `${params.episode_id}`) {
          setEpisode(ep)

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

      return true

    } catch (e) {
      alert(`GetAnimeDetail ${e.message}`)
      return false
    }
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
    if (!params.episode_id || params.episode_id === "undefined") { return false }
    setLoadingStream(true)
    try {
      const response = await animapuApi.GetAnimeWatch({
        anime_source: params.anime_source,
        anime_id: params.anime_id,
        episode_id: params.episode_id,
        resolution,
        stream_idx: streamIdx,
      })
      const body = await response.json()
      if (response.status !== 200) {
        setStreamState("error")
        setLoadingStream(false)
        console.log("error", body)
        return false
      }
      setEpisodeStream(body.data)
      if (body.data.stream_type === 'iframe') setLoadingStream(false)

      return true

    } catch (e) {
      setLoadingStream(false)
      alert(`GetEpisodeStream ${e.message}`)
      return false
    }
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
    } finally {
      setLoadingStream(false)
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

  const isCustomPlayable = ['hls', 'mp4', 'gdrive'].includes(episodeStream.stream_type)
  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) return '0:00'
    const minutes = Math.floor(seconds / 60)
    return `${Math.floor(minutes / 60) ? `${Math.floor(minutes / 60)}:` : ''}${`${minutes % 60}`.padStart(Math.floor(minutes / 60) ? 2 : 1, '0')}:${`${Math.floor(seconds % 60)}`.padStart(2, '0')}`
  }
  const getCurrentTime = () => nativeVideoRef.current?.currentTime ?? rPlayerRef.current?.getCurrentTime?.() ?? 0
  const seekTo = (time) => {
    if (nativeVideoRef.current) nativeVideoRef.current.currentTime = time
    else rPlayerRef.current?.seekTo?.(time)
  }
  const seekBy = (seconds) => seekTo(Math.max(0, Math.min(duration || Infinity, getCurrentTime() + seconds)))
  const togglePlaying = () => {
    if (!isCustomPlayable) return
    if (nativeVideoRef.current) {
      if (nativeVideoRef.current.paused) nativeVideoRef.current.play()
      else nativeVideoRef.current.pause()
    }
    setPlaying((value) => !value)
  }
  const revealControls = () => {
    setControlsVisible(true)
    clearTimeout(controlsTimerRef.current)
    controlsTimerRef.current = setTimeout(() => setControlsVisible(false), 2500)
  }
  const toggleImmersive = () => {
    setImmersive((value) => !value)
    revealControls()
  }
  const toggleNativeFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
        window.screen?.orientation?.unlock?.()
      } else {
        await videoPlayerDivRef.current?.requestFullscreen?.()
        if (mobileMode) await window.screen?.orientation?.lock?.('landscape')
      }
    } catch (_) {}
  }
  useEffect(() => {
    const onKeyDown = (event) => {
      if (!isCustomPlayable || showEpisodesModal || showServersModal || ['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return
      if (event.key === 'ArrowLeft') { event.preventDefault(); seekBy(-10) }
      if (event.key === 'ArrowRight') { event.preventDefault(); seekBy(10) }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isCustomPlayable, duration, showEpisodesModal, showServersModal])

  return (
    <main className={`${immersive ? 'min-h-screen' : 'h-[100dvh] overflow-hidden'} ${mobileMode ? "" : "m-6"}`}>
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

      <Drawer open={showServersModal} onOpenChange={setShowServersModal}>
        <DrawerContent>
          <div className='overflow-auto h-[450px] mx-auto w-full max-w-md'>
            <DrawerHeader className="text-left">
              <DrawerTitle>Select Servers</DrawerTitle>
            </DrawerHeader>
            <div className='flex flex-col gap-2 p-4'>
              {episodeStream.stream_type === 'hls' && hlsLevels.length > 0 && <label className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm">
                Quality
                <select value={undefined} onChange={onChangeBitrate} className="bg-transparent text-white">
                  {hlsLevels.map((level, id) => <option key={id} value={id} className="bg-zinc-900">{level.name}</option>)}
                </select>
              </label>}
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
                  key={k}
                  onClick={() => { setLoadingStream(true); setEpisodeStream({...episodeStream, iframe_url: episodeStream?.iframe_urls[k]}) }}
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

      <Drawer open={showEpisodesModal} onOpenChange={setShowEpisodesModal}>
        <DrawerContent className="mx-auto max-h-[76vh] max-w-6xl bg-zinc-950 text-white">
          <DrawerHeader className="text-left"><DrawerTitle>Episodes</DrawerTitle></DrawerHeader>
          <div className="flex gap-3 overflow-x-auto px-4 pb-8">
            {episodes.map((oneEpisode, index) => (
              <Link
                key={`${oneEpisode.source}-${oneEpisode.anime_id}-${oneEpisode.id}-${index}`}
                className={`w-52 shrink-0 overflow-hidden rounded-md border ${params.episode_id === oneEpisode.id ? 'border-white' : 'border-transparent'} bg-zinc-900`}
                href={`/anime/${params.anime_source}/detail/${oneEpisode.anime_id}/watch/${oneEpisode.id}`}
                onClick={() => setShowEpisodesModal(false)}
              >
                <Img className="h-28 w-full object-cover" src={oneEpisode?.cover_urls?.[0] || oneEpisode?.cover_url || '/images/thumb_not_found_1.png'} alt="" />
                <span className="block truncate p-3 text-sm">{oneEpisode.use_title ? oneEpisode.title : `Episode ${oneEpisode.number}`}</span>
              </Link>
            ))}
          </div>
        </DrawerContent>
      </Drawer>

      <div className={`${pageModeClass(mobileMode, smallWebMode)} ${immersive ? '' : 'h-full overflow-hidden'}`}>
        {/* Main content */}
        <div className='w-full mr-4 mb-4'>
          {/* VIDEO PLAYER */}
          <div ref={videoPlayerDivRef} id="video-content" className={immersive ? 'fixed inset-0 z-40 bg-black' : videoContainerClass(mobileMode, smallWebMode)}>
            <div className={`relative bg-black shadow-2xl shadow-gray-900 ${immersive ? 'h-[100dvh] w-screen' : 'aspect-video'}`} onMouseMove={revealControls} onTouchStart={() => { lastTouchRef.current = Date.now(); revealControls() }} onClick={() => { if (Date.now() - lastTouchRef.current > 500) togglePlaying() }}>
              <div className={`h-full w-full bg-black ${mobileMode ? "" : "overflow-hidden"}`}>
                {showPlayer ? <>
                  {(episodeStream.stream_type === "hls" || episodeStream.stream_type === "mp4") && episodeStream.raw_stream_url ? <div className="h-full w-full">
                    <ReactPlayer
                      ref={rPlayerRef}
                      src={episodeStream.raw_stream_url}
                      playing={playing}
                      controls={false}
                      width={"100%"}
                      height={"100%"}
                      onTimeUpdate={() => setPlayedSeconds(getCurrentTime())}
                      onDurationChange={setDuration}
                      onPlay={() => setPlaying(true)}
                      onPause={() => setPlaying(false)}
                      onEnded={() => nextLink !== '#' && router.push(nextLink)}
                      onReady={() => {
                        if (episodeStream.stream_type === "hls") {
                          onReactPlayerReady()
                        } else {
                          setLoadingStream(false)
                        }
                      }}
                    />
                  </div> : null}
                  {episodeStream.stream_type === "gdrive" ? <div className="h-full w-full">
                    <video
                      ref={nativeVideoRef}
                      className='h-full w-full object-contain'
                      controls={false}
                      autoPlay
                      playsInline
                      preload='metadata'
                      onTimeUpdate={(event) => setPlayedSeconds(event.currentTarget.currentTime)}
                      onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
                      onPlay={() => setPlaying(true)}
                      onPause={() => setPlaying(false)}
                      onEnded={() => nextLink !== '#' && router.push(nextLink)}
                      onCanPlay={() => setLoadingStream(false)}
                      src={`/api/video/${encodeURIComponent(episodeStream.gdrive_conf?.gid || "")}?${new URLSearchParams({access_token: episodeStream.gdrive_conf?.access_token || ""})}`}
                    />
                  </div> : null}
                  {episodeStream.stream_type === "iframe" && <div className="flex h-full w-full items-center justify-center p-6 text-center text-sm text-white/70">Iframe streams are temporarily unavailable.</div>}
                </> : null}
              </div>
              {isCustomPlayable && <>
                <button type="button" className="absolute inset-y-[22%] left-0 z-10 w-[32%] rounded-r-full opacity-0" aria-label="Double click to rewind 10 seconds" onClick={(event) => { event.stopPropagation(); revealControls() }} onDoubleClick={(event) => { event.stopPropagation(); seekBy(-10); revealControls() }} />
                <button type="button" className="absolute inset-y-[22%] right-0 z-10 w-[32%] rounded-l-full opacity-0" aria-label="Double click to forward 10 seconds" onClick={(event) => { event.stopPropagation(); revealControls() }} onDoubleClick={(event) => { event.stopPropagation(); seekBy(10); revealControls() }} />
              </>}
              <div className={`pointer-events-none absolute inset-0 z-20 flex flex-col justify-between bg-gradient-to-b from-black/50 via-transparent to-black/65 p-4 text-white transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}>
                <div className="pointer-events-auto flex items-center justify-between gap-3">
                  <button className="rounded-full p-2 hover:bg-white/15" aria-label="Back to Anime home" onClick={(event) => { event.stopPropagation(); router.push('/home?tab=anime') }}><ArrowLeft /></button>
                  <div className="min-w-0 text-right"><p className="truncate font-medium">{anime.title}</p><p className="text-sm text-white/70">Episode {episode.number}</p></div>
                </div>
                <div className="pointer-events-auto space-y-5 pb-2">
                  {isCustomPlayable && <div className="flex items-center gap-3 text-xs tabular-nums"><span>{formatTime(playedSeconds)}</span><Slider value={[playedSeconds]} min={0} max={duration || 1} step={0.1} onValueChange={([time]) => { seekTo(time); setPlayedSeconds(time) }} /><span>{formatTime(duration)}</span></div>}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      {isCustomPlayable && <>
                        <button className="rounded-full p-4 hover:bg-white/15" aria-label="Back 10 seconds" onClick={(event) => { event.stopPropagation(); seekBy(-10) }}><RotateCcw className="size-5" /></button>
                        <button className="rounded-full bg-white p-5 text-black hover:bg-white/85" aria-label={playing ? 'Pause' : 'Play'} onClick={(event) => { event.stopPropagation(); togglePlaying() }}>{playing ? <Pause className="size-6" fill="currentColor" /> : <Play className="size-6" fill="currentColor" />}</button>
                        <button className="rounded-full p-4 hover:bg-white/15" aria-label="Forward 10 seconds" onClick={(event) => { event.stopPropagation(); seekBy(10) }}><RotateCw className="size-5" /></button>
                      </>}
                      {hasServerOptions && <button className="rounded px-4 py-3 text-base hover:bg-white/15" onClick={(event) => { event.stopPropagation(); setShowServersModal(true) }}><Settings className="mr-1 inline size-5" />Servers</button>}
                    </div>
                    <button type="button" className="mx-2 h-12 flex-1 cursor-default" aria-label="Hide player controls" onClick={(event) => { event.stopPropagation(); clearTimeout(controlsTimerRef.current); setControlsVisible(false) }} />
                    <div className="flex items-center gap-2">
                      <button className="rounded px-4 py-3 text-base hover:bg-white/15" onClick={(event) => { event.stopPropagation(); setShowEpisodesModal(true) }}>Episodes</button>
                      <span className="mx-1 h-8 w-px bg-white/30" aria-hidden="true" />
                      <button disabled={previousLink === '#'} className="rounded p-3 hover:bg-white/15 disabled:opacity-40" aria-label="Previous episode" onClick={(event) => { event.stopPropagation(); previousLink !== '#' && router.push(previousLink) }}><SkipBack className="size-5" /></button>
                      <button disabled={nextLink === '#'} className="rounded p-3 hover:bg-white/15 disabled:opacity-40" aria-label="Next episode" onClick={(event) => { event.stopPropagation(); nextLink !== '#' && router.push(nextLink) }}><SkipForward className="size-5" /></button>
                      {isPWA === true && <button className="rounded p-3 hover:bg-white/15" aria-label={immersive ? 'Minimize player' : 'Expand player'} onClick={(event) => { event.stopPropagation(); toggleImmersive() }}>{immersive ? <Minimize className="size-5" /> : <Maximize className="size-5" />}</button>}
                      {isPWA === false && <button className="rounded p-3 hover:bg-white/15" aria-label={isNativeFullscreen ? 'Exit native fullscreen' : 'Enter native fullscreen'} onClick={(event) => { event.stopPropagation(); toggleNativeFullscreen() }}>{isNativeFullscreen ? <Minimize className="size-5" /> : <Maximize className="size-5" />}</button>}
                    </div>
                  </div>
                </div>
              </div>
              {!streamState && (!showPlayer || loadingStream) && <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/80 text-sm text-white"><LoaderCircle className="h-8 w-8 animate-spin text-primary" /><span>Loading stream…</span></div>}
            </div>
          </div>

          {!immersive && <><div
            className={`flex justify-between items-center ${mobileMode ? "mx-2" : ""} `}
            style={{marginTop: (mobileMode ? `${videoPlayerHeight+16}px` : "16px")}}
          >
            <div className="line-clamp-3 flex-auto text-base font-semibold leading-relaxed">
              {episode.number && <Badge className="mr-2 align-middle" variant="secondary">Episode - {episode.number}</Badge>}
              {anime.title}
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
              {hasServerOptions && <Button size="xs" onClick={()=>setShowServersModal(!showServersModal)}>
                Select server
                <ChevronDownIcon size={14} />
              </Button>}
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
          </div></>}
        </div>

        {/* Side content */}
        {!immersive && <div id="suggestion-content" className={`${mobileMode || smallWebMode ? "" : "min-w-[402px] max-w-[402px]"} flex h-full min-h-0 flex-col`}>
          <div className={`mb-2 pb-2 ${mobileMode || smallWebMode ? "mx-2" : ""}`}>
            <Input
              type="text" placeholder="Search episode"
              onChange={(e) => setSearchEpisode(e.target.value)}
            />
          </div>

          <div className='min-h-0 flex-1 overflow-y-auto'>
            {episodes && episodes.map((oneEpisode, index)=>(
              <Link
                key={`${oneEpisode.source}-${oneEpisode.anime_id}-${oneEpisode.id}-${index}`}
                className={
                  `mb-3 flex p-2 hover:bg-gray-700
                  ${params.episode_id === oneEpisode.id ? "bg-gray-800" : "bg-gray-950"}
                  ${mobileMode || smallWebMode ? "mx-2" : "min-w-[402px] max-w-[402px]"}`
                }
                href={`/anime/${params.anime_source}/detail/${oneEpisode.anime_id}/watch/${oneEpisode.id}`}
              >
                <div className='min-w-[168px] max-w-[168px] h-[94px]'>
                  <div className='relative overflow-clip bg-black'>
                    <Img
                      className={`shadow-md w-[168px] h-[94px]
                      hover:scale-110 transition duration-500 cursor-pointer overflow-clip object-contain`}
                      src={oneEpisode?.cover_urls?.[0] || oneEpisode?.cover_url || "/images/thumb_not_found_1.png"}
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
        </div>}
      </div>
    </main>
  )

  function pageModeClass(tmpMobileMode, tmpSmallWebMode) {
    if (tmpMobileMode) { return "flex flex-col" }
    if (tmpSmallWebMode) { return `flex flex-col` }
    return `flex max-w-[1700px] mx-auto`
  }

  function videoContainerClass(tmpMobileMode, tmpSmallWebMode) {
    if (tmpMobileMode) { return "w-full fixed z-10" }
    if (tmpSmallWebMode) { return `w-full` }
    return `w-full`
  }

  function removeSpecialCharacters(inputString) {
    // Use a regular expression to remove non-alphanumeric characters
    return `${inputString}`.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  }
}

export default dynamic(() => Promise.resolve(WatchAnime), { ssr: false })
