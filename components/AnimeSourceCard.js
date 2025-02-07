'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {Img} from 'react-image'
import animapuApi from '@/apis/AnimapuApi'

export default function AnimeSourceCard(props) {
  const params = useParams()

  const [toggleMenu, setToggleMenu] = useState(false)
  const [anime, setAnime] = useState({
    cover_urls: ["/images/animehub_cover.jpeg"],
  })
  const [episodes, setEpisodes] = useState([])
  const [searchEpisode, setSearchEpisode] = useState("")
  const [continueWatchUrl, setContinueWatchUrl] = useState("#")
  const [continueWatchNumber, setContinueWatchNumber] = useState(0)

  var source = props.oneAnimeData.source
  var detailLink = `/animes/${source}/detail/${props.oneAnimeData.id}/watch/undefined`

  useEffect(() => {
    if (!toggleMenu) { return }
    GetAnimeDetail(props.oneAnimeData.id)
  }, [toggleMenu])

  useEffect(() => {
    if (!props.oneAnimeData.id) { return }

    var keyHistoryDetailAnime = `ANIMEHUB-LITE:HISTORY_DETAIL:ANIME:V2:${props.oneAnimeData.id}`
    if (localStorage && localStorage.getItem(keyHistoryDetailAnime)) {
      var animeHistory = JSON.parse(localStorage.getItem(keyHistoryDetailAnime))
      setContinueWatchUrl(animeHistory.pathname)
      setContinueWatchNumber(animeHistory.episode_number)
    }
  }, [])

  async function GetAnimeDetail(id) {
    if (anime.id && anime.id !== "") { return }

    try {
      const response = await animapuApi.GetAnimeDetail({
        anime_source: source,
        anime_id: id
      })
      const body = await response.json()

      if (response.status !== 200) {
        console.log("error", body)
        return
      }

      console.log("DETAIL RESP:", body.data)

      setAnime(body.data)
      setEpisodes(body.data.episodes.reverse())

    } catch (e) {
      alert(e.message)
    }
  }

  useEffect(() => {
    if (!anime.episodes) { return }

    setEpisodes(
      anime.episodes.filter((ep) => {
        return `${ep.number}`.toLowerCase().includes(searchEpisode.toLowerCase())
      })
    )
  }, [searchEpisode])

  return (
    <div className='relative h-full max-h-[360px] rounded-xl overflow-clip'>
      <div className='h-full overflow-clip' onClick={()=>{setToggleMenu(true)}}>
        <Img
          className="rounded-xl shadow-2xl w-full object-cover min-h-max h-full shadow-gray-900 hover:scale-110 transition duration-500 cursor-pointer overflow-clip"
          src={props?.oneAnimeData?.cover_urls} alt="thumb"
        />
      </div>
      {
        toggleMenu &&
        <div className='fixed bg-black bg-opacity-60 backdrop-blur h-screen w-full left-0 top-0 z-50'>
          <div className='w-full h-screen absolute left-0 top-0 z-0' onClick={()=>setToggleMenu(false)}></div>
          <div className='relative mt-20 mx-auto max-w-md oveflow-hidden rounded-xl z-30'>
            <div className="relative bg-gray-500 rounded-xl shadow z-10 overflow-hidden mx-4">
              <div className={`h-[100px] z-0 ${anime.title ? "" : "animate-pulse"} rounded-xl`} style={{
                backgroundImage: `url(${(anime?.cover_urls && anime?.cover_urls[0]) || "/images/default-book.png"})`,
                backgroundColor: "#d6e0ef",
                backgroundPosition: "50% 35%",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
              }}>
                <div className="backdrop-blur-md h-full"></div>
              </div>
              <div className='flex bg-gray-700 p-3 z-30 text-white'>
                <div className='w-36 flex-none flex flex-col text-center'>
                  <Img
                    className='rounded-xl w-full mt-[-60px] z-30 border backdrop-blur'
                    src={anime?.cover_urls}
                  />
                  <button
                    className='mt-2 w-full py-2 rounded-lg border shadow-md hover:bg-gray-950 text-xs'
                    onClick={()=>{alert("Sorry this feature is not yet implemented :(")}}
                  >Add To Library</button>
                </div>
                <div className='ml-2'>
                  <div className='text-lg text-pretty line-clamp-3'>{anime.title}</div>
                  <div className='mt-2 flex flex-wrap'>
                    {anime.genres && anime.genres.map((oneGenre)=>(
                      <div className='text-[9px] flex-none py-1 px-2 rounded-xl bg-gray-600 mr-1 mb-1' key={oneGenre}>{oneGenre}</div>
                    ))}
                  </div>
                  <div className='text-xs mt-2'>{anime.release_year} - {anime.release_season}</div>
                  <div className='text-xs text-pretty line-clamp-6 mt-2'>{anime.description}</div>
                </div>
              </div>
              <div className='flex bg-gray-800 px-3 w-full py-2'>
                <div className='w-36 flex-none'>
                </div>
                <input
                  type="text" placeholder="Search episode" className='w-full rounded-lg p-2 text-black text-xs'
                  onChange={(e) => setSearchEpisode(e.target.value)}
                />
              </div>
              <div className='flex bg-gray-800 px-3 h-[200px] w-full pb-6'>
                <div className='w-36 flex-none flex flex-col pr-2 text-center'>
                  {continueWatchUrl !== "#" && <Link
                    className='mb-2 w-full py-2 rounded-lg border shadow-md bg-gray-600 hover:bg-gray-950 text-xs'
                    href={continueWatchUrl}
                  >Continue Ep {continueWatchNumber}</Link>}
                  <Link
                    className='mb-2 w-full py-2 rounded-lg border shadow-md hover:bg-gray-950 text-xs'
                    href={`/animes/${source}/detail/${anime.id}/watch/${(anime.episodes && anime.episodes[0] ? anime.episodes[0].id : "undefined")}`}
                  >Latest Ep</Link>
                  <Link
                    className='w-full py-2 rounded-lg border shadow-md hover:bg-gray-950 text-xs'
                    href={`/animes/${source}/detail/${anime.id}/watch/${(anime.episodes && anime.episodes[anime.episodes.length-1] ? anime.episodes[anime.episodes.length-1].id : "undefined")}`}
                  >First Ep</Link>
                </div>
                <div className='w-full overflow-auto'>
                  {episodes.map((oneEpisode) => (
                    <div key={`episode-${oneEpisode.id}`} className='w-full mb-2'>
                      <Link href={`/animes/${source}/detail/${anime.id}/watch/${oneEpisode.id}`}>
                        <div className='hover:bg-gray-950 border px-3 py-2 rounded-lg text-center text-xs'>
                          <span className='w-full'>{oneEpisode.title}</span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      }
      {continueWatchUrl !== "#" && <Link
        className='absolute bg-black bg-opacity-70 top-2 right-2 z-20 rounded-md hover:bg-blue-800 hover:bg-opacity-70'
        href={continueWatchUrl}
      >
        <div className='text-[9px] p-1 rounded-md'>Cont Ep. {continueWatchNumber}</div>
      </Link>}
      <div
        className='absolute bg-black bg-opacity-70 backdrop-blur-sm bottom-0 left-0 z-0 h-1/4 px-2 w-full hover:bg-blue-800 hover:bg-opacity-70 rounded-b-xl'
        onClick={()=>{setToggleMenu(true)}}
      >
        {props.oneAnimeData.latest_episode && props.oneAnimeData.latest_episode > 0 ? <>
          <span className='absolute text-xs p-1 ml-[-8px] mt-[-24px] bg-black bg-opacity-70 rounded-t-lg'>
            {props.oneAnimeData.latest_episode && props.oneAnimeData.latest_episode !== 0 ? `New Ep. ${props.oneAnimeData.latest_episode}` : null}
          </span>
        </> : null}
        <span className="text-xs break-words text-pretty line-clamp-3 mt-1">
          {`${props.oneAnimeData.title}`.replaceAll("Judul: ", "").replaceAll("&#039;", "'").replaceAll("&quot;", "\"")}
        </span>
      </div>
      {props.src_label && <span className='absolute bg-black bg-opacity-70 top-2 left-2 z-20 rounded-md'>
        <div className='text-[9px] p-1 rounded-md'>{props.oneAnimeData.source}</div>
      </span>}
    </div>
  )
}
