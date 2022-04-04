import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from "next/router"

import BottomMenuBar from "../../components/BottomMenuBar"
import animapuApi from "../../apis/AnimapuApi"

var onApiCall = false
export default function MangaDetail() {
  let router = useRouter()

  const query = router.query
  var manga_id = query.id
  var secondary_source_id = query.secondary_source_id
  const [manga, setManga] = useState({
    cover_image:[{image_urls:["/images/default-book.png"]}], chapters:[]
  })

  async function GetMangaDetail() {
    if (onApiCall) {return}
    onApiCall = true
    try {
      const response = await animapuApi.GetMangaDetail({
        manga_source: animapuApi.GetActiveMangaSource(),
        manga_id: manga_id,
        secondary_source_id: secondary_source_id
      })
      const body = await response.json()
      setManga(body.data)
      console.log(body)
      onApiCall = false

    } catch (e) {
      console.log(e)
      onApiCall = false
    }
  }

  useEffect(() => {
    GetMangaDetail()
  // eslint-disable-next-line
  }, [])

  return (
    <div className="bg-[#d6e0ef]">
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={`h-[200px] z-0 ${manga.title ? "" : "animate-pulse"}`} style={{
        backgroundImage: `url(${manga.cover_image[0].image_urls[0]})`,
        backgroundPosition: "50% 35%",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        marginTop: "-58px"
      }}>
        <div className="backdrop-blur-md h-full"></div>
      </div>
      <div className="bg-[#fafafa]">
        <div className="container mx-auto py-4 px-[50px] max-w-[1040px]">
          <div className="backdrop-blur-sm grid grid-cols-1 sm:grid-cols-3">
            <div className="h-full z-5 p-2 mt-[-125px]">
              <img className={`rounded w-full ${manga.title ? "" : "animate-pulse"}`} src={manga.cover_image[0].image_urls[0]}/>
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
                <div key={chapter.title}>
                  <button
                    className="bg-white w-full rounded mb-2 p-2 text-[#5c728a]"
                    onClick={() => router.push(`/mangas/${manga_id}/read/${chapter.id}?secondary_source_id=${secondary_source_id}`)}
                  >
                    {chapter.title}
                  </button>
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
