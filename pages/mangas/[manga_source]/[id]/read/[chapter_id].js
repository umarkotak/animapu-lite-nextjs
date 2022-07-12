import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from "next/router"
import { useAlert } from 'react-alert'
import { Img } from 'react-image'

import BottomMenuBar from "../../../../../components/BottomMenuBar"
import animapuApi from "../../../../../apis/AnimapuApi"

// var BreakException = {}
export default function ReadManga(props) {
  const alert = useAlert()
  let router = useRouter()

  const query = router.query
  var manga_source = query.manga_source
  var manga_id = query.id
  var secondary_source_id = query.secondary_source_id
  var chapter_id = query.chapter_id
  const [manga, setManga] = useState({
    cover_image:[{image_urls:["/images/default-book.png"]}], chapters:[]
  })
  const [chapter, setChapter] = useState({chapter_images:[]})
  const [successRender, setSuccessRender] = useState(false)

  useEffect(() => {
    if (!query) {return}
    setManga(props.manga)
    setChapter(props.chapter)
  // eslint-disable-next-line
  }, [query])

  // var hist = {}
  // function handleImageFallback(imageObj, e) {
  //   try {
  //     var found = false
  //     var selectedImageUrl = ""

  //     try {
  //       imageObj.image_urls.forEach((imageUrl,idx) => {
  //         if (!hist[`${imageUrl}-${idx}`]) {
  //           hist[`${imageUrl}-${idx}`] = true
  //           found = true
  //           selectedImageUrl = imageUrl
  //           throw BreakException
  //         }
  //       })
  //     } catch(err) {
  //       if (err !== BreakException) throw err

  //       if (found) {
  //         e.target.src = selectedImageUrl
  //         return
  //       } else {
  //         e.target.style.display = "none"
  //       }
  //     }
  //     e.target.style.display = "none"
  //   } catch(err) {
  //     alert(err)
  //   }
  // }

  function recordLocalHistory() {
    try {
      var listKey = `ANIMAPU_LITE:HISTORY:LOCAL:LIST`
      var historyArrayString = localStorage.getItem(listKey)

      var historyArray
      if (historyArrayString) {
        historyArray = JSON.parse(historyArrayString)
      } else {
        historyArray = []
      }

      historyArray = historyArray.filter(arrManga => !(`${arrManga.source}-${arrManga.source_id}` === `${manga.source}-${manga.source_id}`))

      var tempManga = manga
      tempManga.last_link = `/mangas/${manga_source}/${manga_id}/read/${chapter_id}?secondary_source_id=${secondary_source_id}`
      tempManga.last_chapter_read = chapter.number
      historyArray.unshift(tempManga)

      historyArray = historyArray.slice(0,40)

      historyArray = historyArray.map((val, idx) => {
        val.chapters = []
        val.description = ""
        return val
      })

      localStorage.setItem(listKey, JSON.stringify(historyArray))

      var detailKey = `ANIMAPU_LITE:HISTORY:LOCAL:DETAIL:${manga.source}:${manga.source_id}:${manga.secondary_source_id}`
      localStorage.setItem(detailKey, JSON.stringify(tempManga))
    } catch(e) {
      alert(e)
    }
  }
  useEffect(() => {
    if (!query) {return}
    if (!manga.title) {return}
    recordLocalHistory()
  }, [manga])

  async function handleUpvote() {
    if (!manga.source_id) { return }

    try {
      const response = await animapuApi.PostUpvoteManga(manga)
      const body = await response.json()
      console.log(body)
      if (response.status !== 200) {
        alert.error(`${body.error.error_code} || ${body.error.message}`)
        return
      }
      alert.info("Info || Upvote sukses!")

    } catch (e) {
      alert.error(e.message)
      setMangas([])
    }
  }

  return (
    <div className="bg-[#d6e0ef]">
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
            <button className="bg-white rounded-lg p-1">Chapter {chapter.number}</button>
            <button className="bg-[#ebb62d] rounded-lg ml-2 p-1" onClick={() => handleUpvote()}><i className="fa-solid fa-star"></i> Upvote</button>
            <button
              className="bg-white rounded-lg ml-2 p-1 height-[27px]"
              onClick={(e)=>{
                navigator.clipboard.writeText(`Read *${manga.title}* Chapter *${chapter.number}* for free at https://animapu-lite.vercel.app/mangas/${props.manga.source}/${props.manga.source_id}/read/${props.chapter.id}?secondary_source_id=${manga.secondary_source_id}`)
                alert.info("Info || Link berhasil dicopy!")
              }}
            ><i className="fa-solid fa-share-nodes"></i> Share</button>
          </div>
          {chapter.chapter_images.map((imageObj, idx) => (
            <div key={`${chapter.id}-${idx}`}>
              {/* <img
                className="w-full mb-1 bg-gray-600"
                src={imageObj.image_urls[0]}
                onError={(e) => handleImageFallback(imageObj, e)}
                alt="thumb"
              /> */}
              <Img
                className="w-full mb-1 bg-gray-600"
                src={imageObj.image_urls}
                onLoad={()=>{setSuccessRender(true)}}
              />
            </div>
          ))}
          {successRender ? null : <p className="text-center">please wait for 1 minute, or the image might be broken. sorry for the inconvenience.</p>}
        </div>
      </div>

      <BottomMenuBar isPaginateNavOn={true} isRead={true} manga={manga} chapter_id={chapter_id} />
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
