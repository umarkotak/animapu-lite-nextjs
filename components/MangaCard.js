import { useRouter } from "next/router"

import animapuApi from "../apis/AnimapuApi"
import QuickMangaModal from "./QuickMangaModal"
import Manga from "../models/Manga"
import { useState } from "react"
import { EyeIcon, StarIcon, UserIcon } from "lucide-react"

export default function MangaCard(props) {
  let router = useRouter()
  const query = router.query
  const [showModal, setShowModal] = useState(false)

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

  function followed(manga) {
    var libraryDetailKey = `ANIMAPU_LITE:FOLLOW:LOCAL:DETAIL:${manga.source}:${manga.source_id}:${manga.secondary_source_id}`
    if (typeof window !== "undefined" && localStorage.getItem(libraryDetailKey)) { return true }

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
    if (manga.latest_chapter_number && manga.latest_chapter_number > 0) {
      return manga.latest_chapter_number
    }

    if (manga.chapters && manga.chapters.length > 0) {
      return manga.chapters[0].number
    }

    return 0
  }

  function subTextDecider(manga) {
    if (props.card_type === "popular") {
      return(
        <span className="text-[#F0E68C]"><StarIcon size={18} />{manga.popularity_point || 0}</span>
      )
    }

    var latestChapter = showLatestChapter(manga)
    if (latestChapter > 0) { return `Ch ${latestChapter}` }

    return "Read"
  }

  // This will add text on the most right after chapter number
  function extraSubTextDecider(manga) {
    if (props.card_type === "popular") {
      return(
        <span className="text-[#F0E68C] flex gap-1"><EyeIcon size={16} /> {manga.read_count || 0}</span>
      )
    }

    // return `face count: ${manga.face_count}`
    return null
  }

  function midExtraSubTextDecider(manga) {
    if (props.card_type === "popular") {
      return(
        <span className="text-[#F0E68C] flex gap-1"><UserIcon size={16} /> {manga.follow_count || 0}</span>
      )
    }

    return null
  }

  function smallTextDecider(manga) {
    try {
      var mangaObj = new Manga(manga, localStorage.getItem("ANIMAPU_LITE:USER:UNIQUE_SHA"))

      if (manga.last_chapter_read) {
        return(<>last read: ch {manga.last_chapter_read}</>)
      }

      if (typeof window !== "undefined" && localStorage.getItem("ANIMAPU_LITE:USER:LOGGED_IN") === "true") {
        if (localStorage.getItem(mangaObj.GetOnlineHistoryKey())) {
          var onlineManga = JSON.parse(localStorage.getItem(mangaObj.GetOnlineHistoryKey()))

          if (onlineManga && onlineManga.last_chapter_read >= 0) {
            return(<>last read: <i className="fa-solid fa-cloud"></i> ch {onlineManga.last_chapter_read}</>)
          }
        }
      }

      if (typeof window !== "undefined") {
        var localHistoryDetailKey = `ANIMAPU_LITE:HISTORY:LOCAL:DETAIL:${manga.source}:${manga.source_id}:${manga.secondary_source_id}`
        if (localStorage.getItem(localHistoryDetailKey)) {
          var localManga = JSON.parse(localStorage.getItem(localHistoryDetailKey))

          if (localManga && localManga.last_chapter_read) {
            return(<>last read: ch {localManga.last_chapter_read}</>)
          }
        }
      }

      return null

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

            <div className="absolute bg-black bg-opacity-75 p-2 text-white z-10 rounded w-full">
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
        flex justify-center
        ${props.remove_margination ? "" : "px-1 mb-4"}
        ${localStorage.getItem(`unsupported-title-${props.manga.source}-${props.manga.source_id}-${props.manga.secondary_source_id}`) ? "hidden" : "block"}
      `}
      key={`${props.idx}-${props.manga.id}`}
    >
      <div className={`${props.remove_margination ? "w-full" : ""} max-w-[175px] h-[265px]`} id={props.manga.source_id}>
        <div className="flex flex-col relative shadow-xl rounded-lg">
          <QuickMangaModal manga={props.manga} showModal={showModal} setShowModal={setShowModal} />

          <div onClick={()=>changeUrl(props.manga)} className="overflow-hidden rounded-lg">
            <div className="bg-black rounded-lg" onClick={()=>setShowModal(!showModal)}>
              <img
                className={`w-full object-cover h-[265px] rounded-lg hover:scale-105 transition z-0 cursor-pointer`}
                src={
                  (props.manga.cover_image && props.manga.cover_image[0] && props.manga.cover_image[0].image_urls && props.manga.cover_image[0].image_urls[0])
                    || "/images/default-book.png"
                }
                alt="thumb"
              />
            </div>
          </div>

          <div onClick={()=>changeUrl(props.manga)}>
            <div
              className="absolute bottom-0 p-2 text-white rounded-b-lg w-full bg-black bg-opacity-75 hover:bg-opacity-90 cursor-pointer"
              onClick={()=>setShowModal(!showModal)}
            >
              {props.show_hover_source && <div className="absolute mt-[-35px] px-2 py-1 leading-none rounded-full bg-black bg-opacity-75">
                <small>{props.manga.source}</small>
              </div>}

              <p className="rounded-lg text-sm leading-5 font-sans pb-1 overflow-hidden">
                {formatTitle(props.manga)}
              </p>
              <div className={`flex flex-col text-sm text-[#75b5f0]`}>
                <div className="flex justify-between">
                  <b>{subTextDecider(props.manga)}</b>
                  <b>{midExtraSubTextDecider(props.manga)}</b>
                  <b>{extraSubTextDecider(props.manga)}</b>
                </div>
                <small className="mt-[-3px]">{smallTextDecider(props.manga)}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
