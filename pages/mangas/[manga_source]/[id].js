import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from "next/router"
import Link from 'next/link'

import BottomMenuBar from "../../../components/BottomMenuBar"
import animapuApi from "../../../apis/AnimapuApi"

export default function MangaDetail(props) {
  let router = useRouter()
  const query = router.query

  var manga_source = query.manga_source
  var manga_id = query.id
  var secondary_source_id = query.secondary_source_id
  const manga = props.manga
  const [chapters, setChapters] = useState([{id: 1}])

  var detailKey = `ANIMAPU_LITE:FOLLOW:LOCAL:DETAIL:${manga.source}:${manga.source_id}:${manga.secondary_source_id}`
  var continueManga = {last_link: "#"}

  const [followed, setFollowed] = useState(false)

  try {
    if (typeof window !== "undefined") {
      if (localStorage.getItem(detailKey)) {
        continueManga = JSON.parse(localStorage.getItem(detailKey))
      }
    }
  } catch (e) {
  }

  function isInLibrary() {
    try {
      console.log(typeof window, localStorage.getItem(detailKey))
      if (typeof window !== "undefined" && localStorage.getItem(detailKey)) { return true }
    } catch (e) {}
    return false
  }

  useEffect(() => {
    setChapters(manga.chapters)
    setFollowed(isInLibrary())
  }, [manga])

  function handleFollow() {
    var listKey = `ANIMAPU_LITE:FOLLOW:LOCAL:LIST`
    var detailKey = `ANIMAPU_LITE:FOLLOW:LOCAL:DETAIL:${manga.source}:${manga.source_id}:${manga.secondary_source_id}`

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
  }

  return (
    <div className="bg-[#d6e0ef]">
      <Head>
        <title>Animapu - Lite</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="description" content="Baca komik gratis tanpa iklan" />

        <meta itemProp="name" content="Animapu - Lite" />
        <meta itemProp="description" content={`${manga.title}`} />
        <meta itemProp="image" content={`${manga.cover_image[0].image_urls[0]}`} />

        <meta name="og:url" content="https://animapu-lite.vercel.app/" />
        <meta name="og:type" content="website" />
        <meta name="og:title" content="Animapu - Lite" />
        <meta name="og:description" content={`${manga.title}`} />
        <meta name="og:image" content={`${manga.cover_image[0].image_urls[0]}`} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Animapu - Lite" />
        <meta name="twitter:description" content={`${manga.title}`} />
        <meta name="twitter:image" content={`${manga.cover_image[0].image_urls[0]}`} />
      </Head>

      <div className={`h-[200px] z-0 ${manga.title ? "" : "animate-pulse"}`} style={{
        backgroundImage: `url(${manga.cover_image[0].image_urls[0]})`,
        backgroundColor: "#d6e0ef",
        backgroundPosition: "50% 35%",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        marginTop: "-60px"
      }}>
        <div className="backdrop-blur-md h-full"></div>
      </div>
      <div className="bg-[#fafafa]">
        <div className="container mx-auto py-4 px-[50px] max-w-[1040px]">
          <div className="backdrop-blur-sm grid grid-cols-1 sm:grid-cols-3">
            <div className="h-full z-5 p-2 mt-[-125px]">
              <img className={`rounded w-full shadow-md ${manga.title ? "" : "animate-pulse"}`} src={manga.cover_image[0].image_urls[0]}/>
              <button className="block w-full bg-[#ec294b] hover:bg-[#B11F38] text-white mt-2 p-2 text-center rounded-full" onClick={() => handleFollow()}>
                <i className="fi fi-rr-heart"></i> {followed ? "Un-Follow" : "Follow"}
              </button>
              <Link
                href={`/mangas/${manga_source}/${manga_id}/read/${chapters.at(-1) ? chapters.at(-1).id : 1}?secondary_source_id=${secondary_source_id}`}
              >
                <a className="block w-full bg-[#3db3f2] hover:bg-[#318FC2] text-white mt-2 p-2 text-center rounded-full">
                  <i className="fi fi-rr-book-alt"></i> Start Read
                </a>
              </Link>
              <Link href={continueManga.last_link || "#"}>
                <a className={`${continueManga.title ? "block" : "hidden"} w-full bg-[#3db3f2] hover:bg-[#318FC2] text-white p-2 text-center mt-2 rounded-full`}>
                  <i className="fi fi-rr-play"></i> Continue
                </a>
              </Link>
            </div>
            <div className="col-span-2 p-2">
              <button className="text-sm text-white float-right bg-[#3db3f2] hover:bg-[#318FC2] p-1 rounded-full"><i className="fi fi-rr-share"></i> | Share</button>
              <h1 className="text-[#5c728a] text-xl mb-1">
                { manga.title ? manga.title : <div className="h-3 bg-slate-500 rounded mb-4 animate-pulse w-1/2"></div> }
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
        <div className="container mx-auto py-4 px-[50px] max-w-[1040px]">
          <div className="grid grid-cols-1 sm:grid-cols-3">
            <div className="p-2 rounded">
              <div className="bg-white p-2 rounded">
              </div>
            </div>

            <div className="col-span-2 p-2">
              {manga.chapters.map((chapter, idx) => (
                <div className="" key={chapter.title}>
                  <Link href={`/mangas/${manga_source}/${manga_id}/read/${chapter.id}?secondary_source_id=${secondary_source_id}`}>
                    <a className="bg-white hover:bg-[#eeeeee] w-full rounded mb-2 p-2 text-[#5c728a] text-center block w-full">
                      {chapter.title}
                    </a>
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
    console.log(body)

  } catch (e) {
    console.log(e)
  }

  return {
    props:{
      manga: {cover_image:[{image_urls:["/images/default-book.png"]}], chapters:[{id: 1}]}
    }
  }
}
