import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/router"
import { BookIcon, BookmarkIcon, Eye, EyeIcon, Heart, HeartIcon, PlayIcon, Share2Icon, StarIcon, XIcon } from 'lucide-react'
import { toast } from 'react-toastify'
import Link from 'next/link'

import animapuApi from "../apis/AnimapuApi"
import Manga from "../models/Manga"
import utils from "@/models/Utils"
import { MangaCardModal } from "./MangaCardV2"

export default function MangaCardBarHistory(props) {
  let router = useRouter()
  const query = router.query
  const [showModal, setShowModal] = useState(false)

  function lastReadChapter() {
    if (props.manga.last_link) {
      return(`cont ch ${props.manga.last_chapter_read}`)
    }
  }

  return(
    <div
      className={`flex-none w-[220px] h-[100px] cursor-pointer hover:border hover:border-primary`}
      key={`manga-card-bar-history-${props.manga.source}-${props.manga.source_id}`}
    >
      <MangaCardModal manga={props.manga} showModal={showModal} setShowModal={setShowModal} disableBookmarkIcon={true} />

      <div
        className="flex flex-row gap-2 h-full"
        onClick={()=>setShowModal(!showModal)}
      >
        <div className="relative flex-none">
          <img
            className={`flex-none object-contain h-full w-[100px]`}
            src={
              (props.manga.cover_image && props.manga.cover_image[0] && props.manga.cover_image[0].image_urls && props.manga.cover_image[0].image_urls[0])
                || "/images/default-book.png"
            }
            alt="thumb"
          />
          {props.show_last_access && <div className="absolute bottom-0 w-full bg-black bg-opacity-50 text-[10px] p-0.5">
            {utils.GetTimeElapsed(props.manga.last_read_at)}
          </div>}
        </div>
        <div className="flex flex-col justify-between">
          <p className="text-xs line-clamp-2">{props.manga.title}</p>

          <div className="flex flex-col pb-4">
            <span className="text-xs">{props.manga.latest_chapter_number !== 0 ? `ch ${props.manga.latest_chapter_number}` : "Read"}</span>
            <span className="text-xs">{lastReadChapter()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
