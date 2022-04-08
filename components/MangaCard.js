import { useRouter } from "next/router"
import Link from 'next/link'

import animapuApi from "../apis/AnimapuApi"

export default function MangaCard(props) {
  let router = useRouter()

  var hist = {}
  var unsupportedTitles = []
  function handleImageFallback(manga, e) {
    if (!hist[manga.id]) { hist[manga.id] = {} }

    var found = false
    var selectedImageUrl = ""
    manga.cover_image[0].image_urls.map((imageUrl) => {
      if (!hist[manga.id][imageUrl]) {
        hist[manga.id][imageUrl] = true
        found = true
        selectedImageUrl = imageUrl
        return
      }
    })

    if (found) {
      e.target.src = selectedImageUrl
      return
    } else {
      if (manga.cover_image[0].image_urls.length > 1) {
        e.target.src = "/images/default-book.png"
        localStorage.setItem(`unsupported-title-${manga.source}-${manga.source_id}-${manga.secondary_source_id}`, "true")
      }
    }
  }

  function goToManga(manga) {
    if (!router) {return "#"}
    if (manga.last_link) {
      return manga.last_link
    }
    return `/mangas/${animapuApi.GetActiveMangaSource()}/${manga.source_id}?secondary_source_id=${manga.secondary_source_id}`
  }

  if (props.manga.shimmer) {
    return(
      <div
        className={`
          flex
          justify-center
          px-1
          mb-4
        `}
        key={`${props.idx}-${props.manga.id}`}
      >
        <div className="w-[175px] h-[265px]">
          <div className="flex flex-col justify-end relative z-10 animate-pulse shadow-xl">
            <div className="w-full h-[265px] rounded bg-slate-500">
            </div>

            <div className="absolute bg-black bg-opacity-75 p-2 text-white z-3 rounded w-full">
              <div className="h-2 bg-slate-500 rounded mb-2"></div>
              <div className="h-2 bg-slate-500 rounded mb-2"></div>
              <div className="h-3 w-12 bg-blue-500 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  return(
    <div
      className={`
        flex
        justify-center
        px-1
        mb-4
        ${localStorage.getItem(`unsupported-title-${props.manga.source}-${props.manga.source_id}-${props.manga.secondary_source_id}`) ? "hidden" : "block"}
      `}
      key={`${props.idx}-${props.manga.id}`}
    >
      <div className="w-[175px] h-[265px]">
        <div className="flex flex-col justify-end relative z-10 shadow-xl">
          <img
            className="w-full h-[265px] rounded"
            src={props.manga.cover_image[0].image_urls[0]}
            onError={(e) => handleImageFallback(props.manga, e)}
            alt="thumb"
          />
          <Link href={goToManga(props.manga)}>
            <a className="absolute p-2 text-white z-3 rounded w-full bg-gradient-to-t from-black">
              <span className="text-sm font-sans">{props.manga.title.slice(0, 50)}</span>
              <div className="text-sm text-[#75b5f0]"><b>
                {props.manga.last_link ? "Continue Read" : "Ch"} {props.manga.last_link ? "" : props.manga.latest_chapter_number}
              </b></div>
            </a>
          </Link>
        </div>
      </div>
    </div>
  )
}
