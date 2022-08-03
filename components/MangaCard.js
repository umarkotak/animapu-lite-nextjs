import { useRouter } from "next/router"
import Link from 'next/link'

import animapuApi from "../apis/AnimapuApi"
import QuickMangaModal from "./QuickMangaModal"

export default function MangaCard(props) {
  let router = useRouter()
  const query = router.query

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

  function changeUrl(manga) {
    if (typeof window !== "undefined") {
      router.push({
        pathname: window.location.pathname,
        query: {
          page: query.page,
          selected: manga.source_id,
        }
      }, undefined, { shallow: true })
    }
  }

  function showMark(manga) {
    var detailKey = `ANIMAPU_LITE:HISTORY:LOCAL:DETAIL:${manga.source}:${manga.source_id}:${manga.secondary_source_id}`
    if (typeof window !== "undefined" && localStorage.getItem(detailKey)) { return true }

    detailKey = `ANIMAPU_LITE:FOLLOW:LOCAL:DETAIL:${manga.source}:${manga.source_id}:${manga.secondary_source_id}`
    if (typeof window !== "undefined" && localStorage.getItem(detailKey)) { return true }

    return false
  }

  function followed(manga) {
    var detailKey = `ANIMAPU_LITE:FOLLOW:LOCAL:DETAIL:${manga.source}:${manga.source_id}:${manga.secondary_source_id}`
    if (typeof window !== "undefined" && localStorage.getItem(detailKey)) { return true }

    return false
  }

  function formatTitle(manga) {
    try {
      var maxLength = 40
      if (!manga.title) { return manga.title }
      if (manga.title.length > maxLength) { return manga.title.slice(0, maxLength-3) +  " ..." }
      return manga.title
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
    if (manga.popularity_point) {
      return(<span className="text-[#F0E68C]"><i className="fa fa-star"></i> {manga.popularity_point}</span>)
    }

    var latestChapter = showLatestChapter(manga)

    if (manga.last_link) {
      // if (manga.last_chapter_read) {
      //   // return `Cont Ch ${manga.last_chapter_read}`
      //   // return `Latest Ch ${latestChapter}`
      // }
      if (latestChapter <= 0) {
        return "Continue Read"
      } else {
        return `Latest Ch ${latestChapter}`
      }
    }

    if (latestChapter <= 0) {
      return "Read"
    }

    return `Ch ${latestChapter}`
  }

  function smallTextDecider(manga) {
    try {
      var continueManga = {last_link: "#", last_chapter_read: null}
      if (typeof window !== "undefined") {
        var historyDetailKey = `ANIMAPU_LITE:HISTORY:LOCAL:DETAIL:${manga.source}:${manga.source_id}:${manga.secondary_source_id}`
        if (localStorage.getItem(historyDetailKey)) {
          continueManga = JSON.parse(localStorage.getItem(historyDetailKey))
        }
      }

      if (!continueManga.last_chapter_read) { return }
      return(<>
        last read: ch {continueManga.last_chapter_read}
      </>)
    } catch (e) {
      return
    }
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
      className={`flex justify-center px-1 mb-4 ${localStorage.getItem(`unsupported-title-${props.manga.source}-${props.manga.source_id}-${props.manga.secondary_source_id}`) ? "hidden" : "block"}`}
      key={`${props.idx}-${props.manga.id}`}
    >
      <div className="w-[175px] h-[265px]" id={props.manga.source_id}>
        <div className="flex flex-col relative shadow-xl rounded-lg">
          <QuickMangaModal manga={props.manga} />

          {
            followed(props.manga) &&
            <div className="absolute top-6 right-0 p-1 rounded-lg text-[#ec294b]">
              <button className="shadow-sm bg-white bg-opacity-75 rounded-full w-[18px] h-[18px] leading-none"><i className="text-sm fa-solid fa-heart"></i></button>
            </div>
          }

          <div onClick={()=>changeUrl(props.manga)}>
            <Link href={goToManga(props.manga)}>
              <a className="bg-gray-600 rounded-lg">
                <img
                  className={`w-full h-[265px] rounded-lg ${props.manga.unavailable ? "grayscale" : ""}`}
                  src={props.manga.cover_image[0].image_urls[0]}
                  alt="thumb"
                />
              </a>
            </Link>
          </div>

          <div onClick={()=>changeUrl(props.manga)}>
            <Link href={goToManga(props.manga)}>
              <a className="absolute bottom-0 p-2 text-white z-3 rounded-b-lg w-full bg-black bg-opacity-75">
                <p className="rounded-lg text-sm leading-5 font-sans pb-1 overflow-hidden">{formatTitle(props.manga)}</p>
                <div className={`flex flex-col text-sm ${showMark(props.manga) ? "text-[#ec294b]" : "text-[#75b5f0]"}`}>
                  <b>{subTextDecider(props.manga)}</b>
                  <small className="mt-[-5px]">{smallTextDecider(props.manga)}</small>
                </div>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
