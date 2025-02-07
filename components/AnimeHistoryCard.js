'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import {Img} from 'react-image'

export default function AnimeHistoryCard(props) {
  const [toggleMenu, setToggleMenu] = useState(false)

  return (
    <div className='relative h-full max-h-[360px] rounded-xl overflow-clip'>
      <Link className='h-full overflow-clip' href={props.oneAnimeEpisodeData.pathname}>
        <Img
          className="rounded-xl shadow-2xl w-full object-cover h-full shadow-gray-900 hover:scale-110 transition duration-500 cursor-pointer overflow-clip"
          src={props.oneAnimeEpisodeData?.cover_urls} alt="thumb"
        />
      </Link>
      <Link
        className='absolute bg-black bg-opacity-70 bottom-0 left-0 z-0 h-1/4 px-2 w-full hover:bg-blue-800 hover:bg-opacity-70 rounded-b-xl'
        href={props.oneAnimeEpisodeData.pathname}
      >
        <span className='absolute text-xs p-1 ml-[-8px] mt-[-24px] bg-black bg-opacity-70 rounded-t-lg'>
          Cont Ep {props.oneAnimeEpisodeData.number}
        </span>
        <span className="text-xs break-words text-pretty line-clamp-3 mt-1">
          {`${props.oneAnimeEpisodeData.title}`.replaceAll("Judul: ", "").replaceAll("&#039;", "'").replaceAll("&quot;", "\"")}
        </span>
      </Link>
    </div>
  )
}
