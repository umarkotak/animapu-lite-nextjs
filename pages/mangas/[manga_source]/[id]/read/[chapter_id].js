import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from "next/router"
import { Img } from 'react-image'
import Link from 'next/link'
import * as Cronitor from "@cronitorio/cronitor-rum";

import BottomMenuBar from "../../../../../components/BottomMenuBar"
import animapuApi from "../../../../../apis/AnimapuApi"
import Manga from "../../../../../models/Manga"
import { toast } from 'react-toastify'
import Utils from '@/models/Utils'
import { DefaultLayout } from '@/components/layouts/DefaultLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

var tempChapters = []
var onApiCall = false
export default function ReadManga(props) {
  let router = useRouter()
  const query = router.query

  const [manga, setManga] = useState(props.manga)
  const [chapters, setChapters] = useState([])
  const [onApiCallSt, setOnApiCallSt] = useState(onApiCall)

  useEffect(() => {
    tempChapters = []

    if (!manga.source_id || manga.source_id === "") {
      GetMangaDetail()
      return
    }

    GetChapter(false, query.chapter_id)
  }, manga)

  async function GetMangaDetail() {
    try {
      const response = await animapuApi.GetMangaDetail({
        manga_source: query.manga_source,
        manga_id: query.id,
      })
      const body = await response.json()
      if (response.status == 200) {
        setManga(body.data)
        return
      }

    } catch (e) {
      console.error(e)
    }
  }

  async function GetChapter(append, chapterID) {
    if (onApiCall) { return }

    try {
      onApiCall = true
      setOnApiCallSt(true)
      const response = await animapuApi.GetReadManga({
        manga_source: query.manga_source,
        manga_id: query.id,
        chapter_id: chapterID,
      })
      const body = await response.json()

      if (response.status == 200) {
        if (append) {
          tempChapters = tempChapters.concat([body.data])
        } else {
          tempChapters = [body.data]
        }
        setChapters(tempChapters)
      }
      onApiCall = false
      setOnApiCallSt(false)

    } catch (e) {
      onApiCall = false
      setOnApiCallSt(false)
      toast.error(`Error fetching chapter: ${e}`)
    }
  }

  const handleScroll = () => {
      var position = window.pageYOffset
      var maxPosition = document.documentElement.scrollHeight - document.documentElement.clientHeight

      if (maxPosition-position <= 900) {
        var targetIdx = 0

        if (!tempChapters || tempChapters.length === 0) {
          return
        }

        manga.chapters.map((tmpChapter, idx) => {
          if (tmpChapter.id === tempChapters[tempChapters.length-1].id) {
            targetIdx = idx - 1
          }
        })

        if (manga.chapters[targetIdx]) {
          GetChapter(true, manga.chapters[targetIdx].id)
        }
      }
    }
    useEffect(() => {
      window.addEventListener("scroll", handleScroll, { passive: true })
      return () => {
        window.removeEventListener("scroll", handleScroll)
      }
    }, [])

  return (
    <DefaultLayout>
      <Head>
        {manga.title && <>
          <meta itemProp="description" content={`${props.manga.title}`} />
          <meta itemProp="image" content={`${props.manga.cover_image[0].image_urls[0]}`} />

          <meta name="og:title" content={`${props.manga.title}`} />
          <meta name="og:description" content={`Read manga with the best experience at animapu`} />
          <meta name="og:image" content={`${props.manga.cover_image[0].image_urls[0]}`} />

          <meta name="twitter:title" content={`${props.manga.title}`} />
          <meta name="twitter:description" content={`Read manga with the best experience at animapu`} />
          <meta name="twitter:image" content={`${props.manga.cover_image[0].image_urls[0]}`} />
        </>}
      </Head>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className='text-2xl tracking-wide'>{manga.title}</CardTitle>
          </CardHeader>
          <CardContent className="px-4 flex justify-start gap-2">
            <Button variant="" size="sm">read on original source</Button>
            <Button variant="" size="sm">bookmark</Button>
            <Button variant="" size="sm">share</Button>
          </CardContent>
        </Card>

        <div>
          {chapters.map((oneChapter) => (
            <div key={`chapter-${oneChapter.id}-${oneChapter.number}`}>
              <Card>
                <CardHeader>
                  <CardTitle className='text-5xl'>
                    Chapter - {oneChapter.number}
                  </CardTitle>
                </CardHeader>
              </Card>
              {oneChapter.chapter_images.map((imageObj, idx) => (
                <div
                  id={`${oneChapter.id}---${idx}`}
                  key={`${oneChapter.id}-${idx}`}
                  // onLoad={()=>anyChapterImageLoaded(oneChapter, idx, `${oneChapter.id}---${idx}`)}
                  className='flex w-full justify-center'
                >
                  {
                    !imageObj.simple_render ?
                      <Img
                        className="w-full max-w-[800px] mb-1 bg-gray-600"
                        src={imageObj.image_urls}
                        // onLoad={()=>{setSuccessRender(1)}}
                        onError={()=>{}}
                        decode={false}
                        loader={
                          <Skeleton className="my-2 h-6 w-6 rounded-full" />
                        }
                      />
                    :
                      <>
                        <img
                          className="w-full max-w-[800px] mb-1 bg-gray-600"
                          loading="lazy"
                          src={imageObj.image_urls[0]}
                        />
                      </>
                  }
                </div>
              ))}
              <div
                id={`${oneChapter.id}-bottom`}
              ><hr/></div>
              <div
                className='h-[270px] bg-gradient-to-b from-primary to-transparent mb-40'
              ></div>
            </div>
          ))}
          {onApiCallSt && <Button className="w-full my-4">Please wait, loading next chapter...</Button>}
          <div className='h-[800px]'></div>
        </div>
      </div>
    </DefaultLayout>
  )
}

export async function getServerSideProps(context) {
  var query = context.query

  var manga = {}

  try {
    const response = await animapuApi.GetMangaDetail({
      manga_source: query.manga_source,
      manga_id: query.id,
    })
    const body = await response.json()
    if (response.status == 200) {
      manga = body.data
    }

  } catch (e) {
    console.error(e)
  }

  return { props: { manga: manga } }
}
