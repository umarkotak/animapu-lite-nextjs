'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {Img} from 'react-image'

export default function AnimeSeasonCard(props) {
  const params = useParams()

  const [toggleMenu, setToggleMenu] = useState(false)
  const [anime, setAnime] = useState({
    cover_urls: ["/images/animehub_cover.jpeg"],
    alt_titles: [],
  })

  useEffect(() => {
    if (!toggleMenu) { return }
    setAnime(props.oneAnimeData)
  }, [toggleMenu])

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
                  <Link
                    className='mt-2 w-full py-2 rounded-lg border shadow-md hover:bg-gray-950 text-xs'
                    href={`/anime/search?title=${anime.search_title !== "" ? anime.search_title : anime.title}`}
                  >Search</Link>
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
                  <div className='text-xs mt-2'>
                    <div>Alternative Titles:</div>
                    {anime.alt_titles.map((oneTitle) => (<div>
                      - {oneTitle}
                    </div>))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
      <div
        className='absolute bg-black bg-opacity-70 bottom-0 left-0 z-0 h-1/4 px-2 w-full hover:bg-blue-800 hover:bg-opacity-70 rounded-b-xl'
        onClick={()=>{setToggleMenu(true)}}
      >
        {props.oneAnimeData.latest_episode && props.oneAnimeData.latest_episode > 0 ? <>
          <span className='absolute text-xs p-1 ml-[-8px] mt-[-24px] bg-black bg-opacity-70 rounded-t-lg'>
            {props.oneAnimeData.latest_episode && props.oneAnimeData.latest_episode !== 0 ? `${props.oneAnimeData.latest_episode} Eps` : null}
          </span>
        </> : null}
        <span className="text-xs break-words text-pretty line-clamp-3 mt-1">
          {`${props.oneAnimeData.title}`.replaceAll("Judul: ", "").replaceAll("&#039;", "'").replaceAll("&quot;", "\"")}
        </span>
      </div>
    </div>
  )
}
