'use client'

import { useState } from 'react'
import { AnimeCardModal } from './AnimeCard'
import utils from '@/models/Utils'

export default function AnimeCardBar(props) {
  const [showModal, setShowModal] = useState(false)

  function lastReadChapter() {
    if (props.anime.last_link) {
      return(`continue: ep ${props.anime.last_episode_watch}`)
    }
  }

  return (
    <div
      className={`flex-none w-[220px] h-[100px] cursor-pointer hover:border hover:border-primary`}
      key={`${props.anime.source}-${props.anime.id}`}
      id={`${props.anime.source}-${props.anime.id}`}
    >
      <AnimeCardModal anime={props.anime} showModal={showModal} setShowModal={setShowModal} disableBookmarkIcon={true} />

      <div
        className="flex flex-row gap-2 h-full"
        onClick={()=>setShowModal(!showModal)}
      >
        <div className="relative flex-none">
          <img
            className={`flex-none object-contain h-full w-[100px]`}
            src={(props?.anime?.cover_urls) || "/images/default-book.png"}
            alt="thumb"
          />
          {props.show_last_access && <div className="absolute bottom-0 w-full bg-black bg-opacity-50 text-[10px] p-0.5">
            {utils.GetTimeElapsed(props.anime.last_watch_at)}
          </div>}
        </div>
        <div className="flex flex-col justify-between">
          <p className="text-xs line-clamp-2">{props.anime.title}</p>

          <div className="flex flex-col pb-4">
            <span className="text-xs">{props.anime.latest_episode !== 0 ? `ep ${props.anime.latest_episode}` : "Read"}</span>
            <span className="text-xs">{lastReadChapter()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
