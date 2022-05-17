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
        // localStorage.setItem(`unsupported-title-${manga.source}-${manga.source_id}-${manga.secondary_source_id}`, "true")
      }
    }
  }

  function goToManga(manga) {
    if (!router) {return "#"}
    if (manga.last_link) {
      return manga.last_link
    }

    var mangaSource = manga.source
    if (!mangaSource || mangaSource == "") {
      mangaSource = animapuApi.GetActiveMangaSource()
    }
    return `/mangas/${mangaSource}/${manga.source_id}?secondary_source_id=${manga.secondary_source_id}`
  }

  function showMark(manga) {
    var detailKey = `ANIMAPU_LITE:HISTORY:LOCAL:DETAIL:${manga.source}:${manga.source_id}:${manga.secondary_source_id}`
    if (typeof window !== "undefined" && localStorage.getItem(detailKey)) { return true }

    detailKey = `ANIMAPU_LITE:FOLLOW:LOCAL:DETAIL:${manga.source}:${manga.source_id}:${manga.secondary_source_id}`
    if (typeof window !== "undefined" && localStorage.getItem(detailKey)) { return true }

    return false
  }

  function formatTitle(manga) {
    try {
      if (!manga.title) { return manga.title }
      return manga.title.slice(0, 50)
    } catch {
      return "Untitled"
    }
  }

  function showLatestChapter(manga) {
    var latestChapter = manga.latest_chapter_number
    if (latestChapter <= 0) {
      if (manga.chapters && manga.chapters.length > 0) {
        latestChapter = manga.chapters[0].number
      }
    }
    return latestChapter
  }

  function subTextDecider(manga) {
    if (manga.last_link) { return "Continue Read" }

    var latestChapter = showLatestChapter(manga)

    if (latestChapter <= 0) {
      return "Read"
    }

    return `Ch ${latestChapter}`
  }

  if (props.manga.shimmer) {
    return(
      <div
        className={`flex justify-center px-1 mb-4`}
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
          <Link href={goToManga(props.manga)}>
            <a className="bg-gray-600 rounded">
              <img
                className={`w-full h-[265px] rounded ${props.manga.unavailable ? "grayscale" : ""}`}
                src={props.manga.cover_image[0].image_urls[0]}
                onError={(e) => handleImageFallback(props.manga, e)}
                alt="thumb"
              />
            </a>
          </Link>
          <Link href={goToManga(props.manga)}>
            <a className="absolute p-2 text-white z-3 rounded w-full bg-black bg-opacity-70">
              <p className="rounded text-sm leading-5 font-sans pb-1">{formatTitle(props.manga)}</p>
              <div className={`text-sm ${showMark(props.manga) ? "text-[#ec294b]" : "text-[#75b5f0]"}`}><b>
                {subTextDecider(props.manga)}
              </b></div>
            </a>
          </Link>
        </div>
      </div>
    </div>
  )
}
