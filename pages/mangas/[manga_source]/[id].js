import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from "next/router"
import Link from 'next/link'

import BottomMenuBar from "../../../components/BottomMenuBar"
import animapuApi from "../../../apis/AnimapuApi"

export default function MangaDetail() {
  let router = useRouter()

  const query = router.query
  var manga_source = query.manga_source
  var manga_id = query.id
  var secondary_source_id = query.secondary_source_id
  const [manga, setManga] = useState({
    cover_image:[{image_urls:["/images/default-book.png"]}], chapters:[{id: 1}]
  })

  async function GetMangaDetail() {
    try {
      const response = await animapuApi.GetMangaDetail({
        manga_source: manga_source,
        manga_id: manga_id,
        secondary_source_id: secondary_source_id
      })
      const body = await response.json()
      if (response.status == 200) {
        setManga(body.data)
      }
      console.log(body)

    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    if (!query) { return }
    GetMangaDetail()
  // eslint-disable-next-line
  }, [query])

  return (
    <div className="bg-[#d6e0ef]">
      <Head>
        <title>Animapu - Lite</title>
        <link rel="icon" href="/favicon.ico" />

        <meta name="description" property="description" key="description" content="Tempat baca komik gratis tanpa iklan" />
        <meta name="og:title" property="og:title" key="og:title" content="Animapu - Lite" />
        <meta name="og:type" property="og:type" key="og:type" content="book" />
        <meta name="og:url" property="og:url" key="og:url" content="https://animapu-lite.vercel.app/" />
        <meta name="og:image" property="og:image" key="og:image" content="/images/cover.jpeg" />
        <meta name="og:description" property="og:description" key="og:description" content="Tempat baca komik gratis tanpa iklan" />
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
              <img className={`rounded w-full ${manga.title ? "" : "animate-pulse"}`} src={manga.cover_image[0].image_urls[0]}/>
              <Link
                href={`/mangas/${manga_source}/${manga_id}/read/${manga.chapters[0].id || 1}?secondary_source_id=${secondary_source_id}`}
              >
                <a className="block w-full bg-[#3db3f2] text-white rounded mt-2 p-2 text-center">
                  Read
                </a>
              </Link>
            </div>
            <div className="col-span-2 p-2">
              <h1 className="text-[#5c728a] text-xl mb-1">
                { manga.title ? manga.title : <div className="h-3 bg-slate-500 rounded mb-4 animate-pulse w-1/2"></div> }
              </h1>
              {manga.description ? <p className="text-sm text-[#7a858f] text-justify">{manga.description}</p> : <div className="animate-pulse">
                <div className="h-2 bg-slate-500 rounded mb-4"></div>
                <div className="h-2 bg-slate-500 rounded mb-4"></div>
                <div className="h-2 bg-slate-500 rounded mb-4"></div>
                <div className="h-2 bg-slate-500 rounded mb-4"></div>
                <div className="h-2 bg-slate-500 rounded mb-4 w-2/3"></div>
              </div>}
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="container mx-auto py-4 px-[50px] max-w-[1040px]">
          <div className="grid grid-cols-1 sm:grid-cols-3">
            <div></div>
            <div className="col-span-2 p-2">
              {manga.chapters.map((chapter, idx) => (
                <div className="" key={chapter.title}>
                  <Link href={`/mangas/${manga_source}/${manga_id}/read/${chapter.id}?secondary_source_id=${secondary_source_id}`}>
                    <a className="bg-white w-full rounded mb-2 p-2 text-[#5c728a] text-center block w-full">
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
