'use client'

import { useState } from 'react'
import utils from '@/models/Utils'
import HistoryDrawer from '@/components/HistoryDrawer'

export default function AnimeCardBar(props) {
  const [showModal, setShowModal] = useState(false)
  const history = {
    ...props.anime,
    media_type: "anime",
    source_id: props.anime.id,
    cover_urls: Array.isArray(props.anime.cover_urls) ? props.anime.cover_urls : [props.anime.cover_urls],
    latest_number: props.anime.latest_episode,
    progress: props.anime.last_episode_watch,
  }

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
      <HistoryDrawer history={history} open={showModal} onOpenChange={setShowModal} />

      <div
        className="flex flex-row gap-2 h-full"
        onClick={()=>setShowModal(true)}
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
