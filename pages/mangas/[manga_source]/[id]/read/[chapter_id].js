import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from "next/router"
import { useAlert } from 'react-alert'
import { Img } from 'react-image'
import Link from 'next/link'

import BottomMenuBar from "../../../../../components/BottomMenuBar"
import animapuApi from "../../../../../apis/AnimapuApi"
import Manga from "../../../../../models/Manga"

export default function ReadManga(props) {
  const alert = useAlert()
  let router = useRouter()
  const query = router.query

  var manga = props.manga
  var chapter = props.chapter

  const [successRender, setSuccessRender] = useState(false)
  const [historySaved, setHistorySaved] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") { return }
    if (!query.chapter_id) { return }

    recordLocalHistory()
    recordOnlineHistory()
    handleUpvote(false)
  }, [query])

  function recordLocalHistory() {
    try {
      var historyListKey = `ANIMAPU_LITE:HISTORY:LOCAL:LIST`
      var historyArrayString = localStorage.getItem(historyListKey)

      var historyArray
      if (historyArrayString) {
        historyArray = JSON.parse(historyArrayString)
      } else {
        historyArray = []
      }

      historyArray = historyArray.filter(arrManga => !(`${arrManga.source}-${arrManga.source_id}` === `${props.manga.source}-${props.manga.source_id}`))

      var tempManga = props.manga
      tempManga.last_link = `/mangas/${manga.source}/${manga.source_id}/read/${chapter.id}?secondary_source_id=${manga.secondary_source_id}`
      tempManga.last_chapter_read = chapter.number
      historyArray.unshift(tempManga)

      historyArray = historyArray.slice(0,80)

      historyArray = historyArray.map((val, idx) => {
        val.chapters = []
        val.description = ""
        return val
      })

      localStorage.setItem(historyListKey, JSON.stringify(historyArray))

      var historyDetailKey = `ANIMAPU_LITE:HISTORY:LOCAL:DETAIL:${manga.source}:${manga.source_id}:${manga.secondary_source_id}`
      localStorage.setItem(historyDetailKey, JSON.stringify(tempManga))

      setHistorySaved(true)
      console.warn("HISTORY SAVED", tempManga)
    } catch(e) {
      alert(e)
    }
  }

  async function recordOnlineHistory() {
    try {
      if (chapter && chapter.chapter_images.length <= 0) { return }

      if (typeof window !== "undefined" && localStorage.getItem("ANIMAPU_LITE:USER:LOGGED_IN") !== "true") { return }

      var tempManga = props.manga
      tempManga.last_link = `/mangas/${manga.source}/${manga.source_id}/read/${chapter.id}?secondary_source_id=${manga.secondary_source_id}`
      tempManga.last_chapter_read = chapter.number

      var postUserHistoryParams = {
        "manga": tempManga
      }

      const response = await animapuApi.PostUserHistories({uid: localStorage.getItem("ANIMAPU_LITE:USER:UNIQUE_SHA")}, postUserHistoryParams)

      if (response.status === 200) {
        var mangaObj = new Manga(tempManga, localStorage.getItem("ANIMAPU_LITE:USER:UNIQUE_SHA"))
        localStorage.setItem(mangaObj.GetOnlineHistoryKey(), JSON.stringify(tempManga))
      }

    } catch (e)  {
      alert.error(e.message)
    }
  }

  async function handleUpvote(star) {
    if (!manga.source_id) { return }

    try {
      manga.star = star
      const response = await animapuApi.PostUpvoteManga(manga)
      const body = await response.json()
      if (response.status !== 200) {
        alert.error(`${body.error.error_code} || ${body.error.message}`)
        return
      }

      if (star) {
        alert.info("Info || Upvote sukses!")
      }

    } catch (e) {
      alert.error(e.message)
    }
  }

  function handleFollow() {
    if (!manga.source_id) { return }

    var followListKey = `ANIMAPU_LITE:FOLLOW:LOCAL:LIST`
    var libraryArrayString = localStorage.getItem(followListKey)

    var libraryArray
    if (libraryArrayString) {
      libraryArray = JSON.parse(libraryArrayString)
    } else {
      libraryArray = []
    }

    libraryArray = libraryArray.filter(arrManga => !(`${arrManga.source}-${arrManga.source_id}` === `${manga.source}-${manga.source_id}`))

    var tempManga = manga
    libraryArray.unshift(tempManga)

    localStorage.setItem(followListKey, JSON.stringify(libraryArray))

    var followDetailKey = `ANIMAPU_LITE:FOLLOW:LOCAL:DETAIL:${manga.source}:${manga.source_id}:${manga.secondary_source_id}`
    localStorage.setItem(followDetailKey, JSON.stringify(tempManga))
    alert.info("Info || Manga ini udah masuk library kamu!")
  }

  return (
    <div className="min-h-screen pb-60 bg-[#d6e0ef]">
      <Head>
        <meta itemProp="description" content={`${props.manga.title}`} />
        <meta itemProp="image" content={`${props.manga.cover_image[0].image_urls[0]}`} />

        <meta name="og:title" content={`${props.manga.title}`} />
        <meta name="og:description" content={`Read chapter ${props.chapter.number}`} />
        <meta name="og:image" content={`${props.manga.cover_image[0].image_urls[0]}`} />

        <meta name="twitter:title" content={`${props.manga.title}`} />
        <meta name="twitter:description" content={`Read chapter ${props.chapter.number}`} />
        <meta name="twitter:image" content={`${props.manga.cover_image[0].image_urls[0]}`} />
      </Head>

      <div>
        <div className="container mx-auto pt-1 px-1 max-w-[1040px]">
          <div className="mt-1 mb-2">
            <div className="flex justify-between">
              <div>
                <Link href={chapter.source_link || "#"}><a target="_blank" className="bg-white rounded-lg p-1">
                  <i className="fa fa-globe"></i> Chapter {chapter.number}
                </a></Link>
                <button className="bg-[#ebb62d] rounded-lg ml-2 p-1" onClick={() => handleFollow()}><i className="fa-solid fa-heart"></i> Follow</button>
                <button className="bg-[#ebb62d] rounded-lg ml-2 p-1" onClick={() => handleUpvote(true)}><i className="fa-solid fa-star"></i> Upvote</button>
                <button
                  className="bg-white rounded-lg ml-2 p-1 height-[27px]"
                  onClick={(e)=>{
                    navigator.clipboard.writeText(`Read *${manga.title}* Chapter *${chapter.number}* for free at https://animapu-lite.vercel.app/mangas/${props.manga.source}/${props.manga.source_id}/read/${props.chapter.id}?secondary_source_id=${manga.secondary_source_id}`)
                    alert.info("Info || Link berhasil dicopy!")
                  }}
                ><i className="fa-solid fa-share-nodes"></i> Share</button>
              </div>
              <div>
                {historySaved && <i className="fa-solid fa-circle-check"></i>}
              </div>
            </div>
          </div>
          <div>
            {chapter.chapter_images.map((imageObj, idx) => (
              <div key={`${chapter.id}-${idx}`}>
                <Img
                  className="w-full mb-1 bg-gray-600"
                  src={imageObj.image_urls}
                  onLoad={()=>{setSuccessRender(true)}}
                  loader={
                    <div className="my-1">
                      <svg role="status" className="mx-auto w-8 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-red-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                      </svg>
                    </div>
                  }
                />
              </div>
            ))}
          </div>
          <p className="text-center"><Link href={chapter.source_link || "#"}>
            <a target="_blank" className="hover:text-[#3db3f2]"><b><i className="fa fa-globe"></i> Read from original source</b></a>
          </Link></p>
          {successRender ? null : <div>
            <p className="text-center">please wait for at most 1 minute, or the image might be broken. sorry for the inconvenience.</p>
          </div>}
        </div>
      </div>

      <BottomMenuBar isPaginateNavOn={true} isRead={true} manga={manga} chapter_id={chapter.id} />
    </div>
  )
}

export async function getServerSideProps(context) {
  var query = context.query

  var manga = {}
  var chapter = {}

  try {
    const response = await animapuApi.GetMangaDetail({
      manga_source: query.manga_source,
      manga_id: query.id,
      secondary_source_id: query.secondary_source_id
    })
    const body = await response.json()
    if (response.status == 200) {
      manga = body.data
    }

  } catch (e) {
    console.log(e)
  }

  try {
    const response = await animapuApi.GetReadManga({
      manga_source: query.manga_source,
      manga_id: query.id,
      chapter_id: query.chapter_id,
      secondary_source_id: query.secondary_source_id
    })
    const body = await response.json()
    if (response.status == 200) {
      chapter = body.data
    }

  } catch (e) {
    console.log(e)
  }

  return { props: { manga: manga, chapter: chapter } }
}
