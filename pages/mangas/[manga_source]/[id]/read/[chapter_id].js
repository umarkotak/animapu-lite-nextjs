import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from "next/router"

import BottomMenuBar from "../../../../../components/BottomMenuBar"
import animapuApi from "../../../../../apis/AnimapuApi"

var BreakException = {}
export default function ReadManga() {
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
  async function GetReadManga() {
    try {
      const response = await animapuApi.GetReadManga({
        manga_source: animapuApi.GetActiveMangaSource(),
        manga_id: manga_id,
        chapter_id: chapter_id,
        secondary_source_id: secondary_source_id
      })
      const body = await response.json()
      if (response.status == 200) {
        setChapter(body.data)
      }
      console.log(body)

    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    if (!query) {return}
    GetMangaDetail()
    GetReadManga()
  // eslint-disable-next-line
  }, [query])

  var hist = {}
  function handleImageFallback(imageObj, e) {
    var found = false
    var selectedImageUrl = ""

    try {
      imageObj.image_urls.forEach((imageUrl,idx) => {
        if (!hist[`${imageUrl}-${idx}`]) {
          hist[`${imageUrl}-${idx}`] = true
          found = true
          selectedImageUrl = imageUrl
          throw BreakException
        }
      })
    } catch(err) {
      if (err !== BreakException) throw err

      if (found) {
        e.target.src = selectedImageUrl
        return
      } else {
        e.target.style.display = "none"
      }
    }
    e.target.style.display = "none"

  }

  function recordLocalHistory() {
    // var detailKey = `HISTORY:LOCAL:${manga.source}:${manga.source_id}:${manga.secondary_source_id}`
    // localStorage.setItem(detailKey, "")

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
    historyArray.unshift(tempManga)

    historyArray = historyArray.slice(0,40)

    localStorage.setItem(listKey, JSON.stringify(historyArray))
  }
  useEffect(() => {
    if (!query) {return}
    if (!manga.title) {return}
    recordLocalHistory()
  }, [manga])

  return (
    <div className="bg-[#d6e0ef]">
      <div>
        <div className="container mx-auto pt-1 px-1 max-w-[1040px]">
          <div className="mb-2">
            <span className="bg-white rounded p-1">Chapter {chapter.number}</span>
          </div>
          {chapter.chapter_images.map((imageObj, idx) => (
            <div key={`${chapter.id}-${idx}`}>
              <img
                className="w-full mb-1 bg-gray-600"
                src={imageObj.image_urls[0]}
                onError={(e) => handleImageFallback(imageObj, e)}
                alt="thumb"
              />
            </div>
          ))}
        </div>
      </div>

      <BottomMenuBar isPaginateNavOn={true} manga={manga} chapter_id={chapter_id} />
    </div>
  )
}
