'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {Img} from 'react-image'
import animapuApi from '@/apis/AnimapuApi'
import { Button } from './ui/button'
import { toast } from 'react-toastify'

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
    <div className={`w-full max-w-[175px] h-[265px] mx-auto`}>
      <div className="flex flex-col relative shadow-xl rounded-xl">
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
                    <Button
                      className="mt-2"
                      onClick={()=>{toast.error("Sorry this feature is not yet implemented :(")}}
                    >Add To Library</Button>
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
                    <Link href={`/anime/${source}/detail/${anime.id}/watch/${(anime.episodes && anime.episodes[0] ? anime.episodes[0].id : "undefined")}`}>
                      <Button className="mb-2 w-full" variant="default">Latest Ep</Button>
                    </Link>
                    <Link href={`/anime/${source}/detail/${anime.id}/watch/${(anime.episodes && anime.episodes[anime.episodes.length-1] ? anime.episodes[anime.episodes.length-1].id : "undefined")}`}>
                      <Button className="mb-2 w-full" variant="default">First Ep</Button>
                    </Link>
                  </div>
                  <div className='w-full overflow-auto'>
                    {episodes.map((oneEpisode) => (
                      <div key={`episode-${oneEpisode.id}`} className='w-full mb-2'>
                        <Link href={`/anime/${source}/detail/${anime.id}/watch/${oneEpisode.id}`}>
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

        <div className="overflow-hidden rounded-xl">
          <div className="bg-black rounded-xl" onClick={()=>setToggleMenu(true)}>
            <img
              className={`w-full object-cover h-[265px] rounded-xl hover:scale-105 transition z-0 cursor-pointer`}
              src={props?.oneAnimeData?.cover_urls} alt="thumb"
            />
          </div>
        </div>

        <div>
          {props.show_hover_source && <div className="absolute bottom-16 left-1 px-2 py-1 leading-none bg-black bg-opacity-90 text-[12px]">
            <small>{props.oneAnimeData.source}</small>
          </div>}
          <div
            className="absolute bottom-0 p-2 text-white rounded-b-xl w-full bg-black bg-opacity-75 hover:bg-opacity-90 backdrop-blur-sm cursor-pointer"
            onClick={()=>setToggleMenu(true)}
          >
            <p className="text-sm leading-1 line-clamp-1">
              {`${props.oneAnimeData.title}`.replaceAll("Judul: ", "").replaceAll("&#039;", "'").replaceAll("&quot;", "\"")}
            </p>
            <div className={`flex justify-between items-center text-sm text-[#75b5f0] mt-1`}>
              <span>{props.oneAnimeData.latest_episode !== 0 ? `Ep ${props.oneAnimeData.latest_episode}` : "Watch"}</span>
            </div>
          </div>
        </div>

        {/* {continueWatchUrl !== "#" && <Link
          className='absolute bg-black bg-opacity-70 top-2 right-2 z-20 rounded-md hover:bg-blue-800 hover:bg-opacity-70'
          href={continueWatchUrl}
        >
          <div className='text-[9px] p-1 rounded-md'>Cont Ep. {continueWatchNumber}</div>
        </Link>} */}
      </div>
    </div>
  )
}
