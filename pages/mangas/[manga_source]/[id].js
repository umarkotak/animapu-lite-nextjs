import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from "next/router"
import Link from 'next/link'

import BottomMenuBar from "../../../components/BottomMenuBar"
import animapuApi from "../../../apis/AnimapuApi"
import Manga from "../../../models/Manga"

export default function MangaDetail(props) {
  const [darkMode, setDarkMode] = useState(true)
  useEffect(() => {
    if (!localStorage) {return}
    if (localStorage.getItem("ANIMAPU_LITE:DARK_MODE") === "true") {
      setDarkMode(true)
    } else { setDarkMode(false) }
  }, [])

  let router = useRouter()
  const query = router.query

  var manga_source = query.manga_source
  var manga_id = query.id
  var secondary_source_id = query.secondary_source_id
  const manga = props.manga
  const [chapters, setChapters] = useState([{id: 1}])

  var historyDetailKey = `ANIMAPU_LITE:HISTORY:LOCAL:DETAIL:${manga.source}:${manga.source_id}:${manga.secondary_source_id}`
  var listKey = `ANIMAPU_LITE:FOLLOW:LOCAL:LIST`
  var detailKey = `ANIMAPU_LITE:FOLLOW:LOCAL:DETAIL:${manga.source}:${manga.source_id}:${manga.secondary_source_id}`
  const [continueManga, setContinueManga] = useState({last_link: "#", last_chapter_read: 0})

  const [followed, setFollowed] = useState(false)

  function isContinuePossible() {
    try {
      var mangaObj = new Manga(props.manga, localStorage.getItem("ANIMAPU_LITE:USER:UNIQUE_SHA"))

      if (typeof window !== "undefined" && localStorage.getItem("ANIMAPU_LITE:USER:LOGGED_IN") === "true") {
        if (localStorage.getItem(mangaObj.GetOnlineHistoryKey())) {
          var onlineManga = JSON.parse(localStorage.getItem(mangaObj.GetOnlineHistoryKey()))
          setContinueManga(onlineManga)
        }
      }

      if (typeof window !== "undefined") {
        if (localStorage.getItem(mangaObj.GetLocalHistoryKey())) {
          var localManga = JSON.parse(mangaObj.GetLocalHistoryKey())
          setContinueManga(localManga)
        }
      }
    } catch (e) {
    }
  }

  function isInLibrary() {
    try {
      if (typeof window !== "undefined" && localStorage.getItem(detailKey)) { return true }
    } catch (e) {}
    return false
  }

  useEffect(() => {
    setChapters(manga.chapters)
    setFollowed(isInLibrary())
    isContinuePossible()
  }, [manga])

  function handleFollow() {
    if (!manga.source_id) { return }

    var libraryArrayString = localStorage.getItem(listKey)

    var libraryArray
    if (libraryArrayString) {
      libraryArray = JSON.parse(libraryArrayString)
    } else {
      libraryArray = []
    }

    libraryArray = libraryArray.filter(arrManga => !(`${arrManga.source}-${arrManga.source_id}` === `${manga.source}-${manga.source_id}`))

    if (followed) {
      localStorage.setItem(listKey, JSON.stringify(libraryArray))
      localStorage.removeItem(detailKey)
      setFollowed(isInLibrary())
      return
    }

    var tempManga = manga
    libraryArray.unshift(tempManga)

    localStorage.setItem(listKey, JSON.stringify(libraryArray))
    localStorage.setItem(detailKey, JSON.stringify(tempManga))
    setFollowed(isInLibrary())

    alert.info("Info || Manga ini udah masuk library kamu!")
  }

  async function handleUpvote() {
    if (!manga.source_id) { return }

    try {
      manga.star = true
      const response = await animapuApi.PostUpvoteManga(manga)
      const body = await response.json()
      if (response.status !== 200) {
        alert.error(`${body.error.error_code} || ${body.error.message}`)
        return
      }
      alert.info("Info || Upvote sukses!")

    } catch (e) {
      alert.error(e.message)
    }
  }

  function startReadDecider(chapters) {
    try {
      if (!chapters) { return 1 }
      if (!chapters.at(-1)) { return 1 }
      if (!chapters.at(-1).id) { return 1 }
      return chapters.at(-1).id
    } catch {
      return 1
    }
  }

  return (
    <div className={`${darkMode ? "dark bg-stone-900" : "bg-[#d6e0ef]"} min-h-screen pb-60`}>
      <Head>
        <meta itemProp="description" content={`${manga.title}`} />
        <meta itemProp="image" content={`${manga?.cover_image[0]?.image_urls[0] || "#"}`} />

        <meta name="og:description" content={`${manga.title}`} />
        <meta name="og:image" content={`${manga?.cover_image[0]?.image_urls[0] || "#"}`} />

        <meta name="twitter:description" content={`${manga.title}`} />
        <meta name="twitter:image" content={`${manga?.cover_image[0]?.image_urls[0] || "#"}`} />
      </Head>

      <div className={`h-[200px] z-0 ${manga.title ? "" : "animate-pulse"}`} style={{
        backgroundImage: `url(${manga?.cover_image[0]?.image_urls[0] || "#"})`,
        backgroundColor: "#d6e0ef",
        backgroundPosition: "50% 35%",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        marginTop: "-60px"
      }}>
        <div className="backdrop-blur-md h-full"></div>
      </div>
      <div className="bg-[#fafafa]">
        <div className="container mx-auto py-4 px-[50px] max-w-[768px]">
          <div className="backdrop-blur-sm grid grid-cols-1 sm:grid-cols-3">
            <div className="h-full z-5 p-2 mt-[-125px]">
              <img
                className={`rounded w-full shadow-md ${manga.title ? "" : "animate-pulse"}`}
                src={manga?.cover_image[0]?.image_urls[0] || "#"}
              />
              <div className='flex'>
                <button className="block w-full bg-[#ebb62d] hover:bg-[#A57F1F] text-white mt-2 p-2 text-center rounded-full mr-1" onClick={() => handleUpvote()}>
                  <i className="fa-solid fa-star"></i> Upvote
                </button>
                <button className="block w-full bg-[#ec294b] hover:bg-[#B11F38] text-white mt-2 p-2 text-center rounded-full ml-1" onClick={() => handleFollow()}>
                  <i className="fa-solid fa-heart"></i> {followed ? "Un-Follow" : "Follow"}
                </button>
              </div>
              <Link
                href={`/mangas/${manga_source}/${manga_id}/read/${startReadDecider(chapters)}?secondary_source_id=${secondary_source_id}`}
                className="block w-full bg-[#3db3f2] hover:bg-[#318FC2] text-white mt-2 p-2 text-center rounded-full"
              >
                <i className="fa-solid fa-book"></i> Start Read
              </Link>
              <Link
                href={continueManga.last_link || "#"}
                className={`${continueManga.title ? "block" : "hidden"} w-full bg-[#3db3f2] hover:bg-[#318FC2] text-white p-2 text-center mt-2 rounded-full`}
              >
                <i className="fa-solid fa-play"></i> {
                  continueManga.last_chapter_read ? `Cont Ch ${continueManga.last_chapter_read}` : "Continue"
                }
              </Link>
            </div>
            <div className="col-span-2 p-2">
              <button
                className="text-sm text-white float-right bg-[#3db3f2] hover:bg-[#318FC2] p-1 rounded-full"
                onClick={(e)=>{
                  navigator.clipboard.writeText(`Read *${manga.title}* for free at https://animapu-lite.vercel.app/mangas/${manga.source}/${manga.source_id}?secondary_source_id=${manga.secondary_source_id}`)
                  alert.info("Info || Link berhasil dicopy!")
                }}
              ><i className="fa-solid fa-share-nodes"></i> Share</button>
              <h1 className="text-[#5c728a] text-xl mb-1">
                <b>{manga.source}</b> - { manga.title ? manga.title : <div className="h-3 bg-slate-500 rounded mb-4 animate-pulse w-1/2"></div> }
              </h1>
              {manga.description ? <p className="text-sm text-[#7a858f] text-justify max-h-80 overflow-hidden overflow-y-scroll">{manga.description}</p> : <div className="animate-pulse">
                <div className="h-2 bg-slate-500 rounded mb-4"></div>
                <div className="h-2 bg-slate-500 rounded mb-4"></div>
                <div className="h-2 bg-slate-500 rounded mb-4"></div>
                <div className="h-2 bg-slate-500 rounded mb-4"></div>
                <div className="h-2 bg-slate-500 rounded mb-4 w-2/3"></div>
              </div>}
              <div className="mt-2 overflow-x-clip">
                {manga.genres && manga.genres.map((genre, idx) => (
                  <span className="text-sm text-[#26394a] text-center px-2 mt-1 rounded-full bg-[#bee3f9] mr-1" key={genre + idx}>{genre}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="container mx-auto py-4 px-[50px] max-w-[768px]">
          <div className="grid grid-cols-1 sm:grid-cols-3">
            <div className="p-2 rounded">
              <div className="bg-white p-2 rounded">
              </div>
            </div>

            <div className="col-span-2 p-2">
              {manga.chapters.map((chapter, idx) => (
                <div className="" key={chapter.title}>
                  <Link
                    href={`/mangas/${manga_source}/${manga_id}/read/${chapter.id}?secondary_source_id=${chapter.secondary_source_id}`}
                    className="bg-white hover:bg-[#eeeeee] rounded mb-2 p-2 text-[#5c728a] text-center block w-full"
                  >
                    {chapter.title}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BottomMenuBar />
    </div>
  )
}

export async function getServerSideProps(context) {
  var query = context.query

  try {
    const response = await animapuApi.GetMangaDetail({
      manga_source: query.manga_source,
      manga_id: query.id,
      secondary_source_id: query.secondary_source_id
    })
    const body = await response.json()
    if (response.status == 200) {
      return {props:{manga:body.data}}
    }

  } catch (e) {
    console.error(e)
  }

  return {
    props:{
      manga: {cover_image:[{image_urls:["/images/default-book.png"]}], chapters:[{id: 1}]}
    }
  }
}
