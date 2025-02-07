import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from "next/router"
import { Img } from 'react-image'
import Link from 'next/link'
import * as Cronitor from "@cronitorio/cronitor-rum";

import animapuApi from "../../../../../apis/AnimapuApi"
import { toast } from 'react-toastify'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronDownIcon, XIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import AdsCard from '@/components/AdsCard'

var tempChapters = []
var onApiCall = false
var tempLoadedImageUrls = {}
export default function ReadManga(props) {
  let router = useRouter()
  const query = router.query
  const pathName = usePathname()

  const [manga, setManga] = useState(props.manga)
  const [chapters, setChapters] = useState([])
  const [onApiCallSt, setOnApiCallSt] = useState(onApiCall)
  const [showChaptersModal, setShowChaptersModal] = useState(false)
  const [loadedImageUrls, setLoadedImageUrls] = useState({})

  useEffect(() => {
    tempChapters = []
    setChapters(tempChapters)

    if (!manga.source_id || manga.source_id === "") {
      GetMangaDetail()
      return
    }

    GetChapter(false, query.chapter_id)
  }, [manga, pathName])

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

      var chapterData = body.data

      if (response.status == 200) {
        if (append) {
          tempChapters = tempChapters.concat([chapterData])
        } else {
          tempChapters = [chapterData]
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

    try {
      var failCount = 0
      for (let i = 0; i < chapterData.chapter_images.length; i++) {
        if (failCount > 15) { break }

        const imageObj = chapterData.chapter_images[i];

        for (let j = 0; j < imageObj.image_urls.length; j++) {
          const oneImageUrl = imageObj.image_urls[j];

          const image = new Image();
          image.src = oneImageUrl;

          await new Promise((resolve, reject) => {
            image.onload = () => {
              tempLoadedImageUrls[imageObj.image_urls.join(";")] = true
              resolve()
            };
            image.onerror = () => {
              failCount = failCount + 1
              reject()
            };
          });

          setLoadedImageUrls({...tempLoadedImageUrls})
        }
      }
      console.warn(tempLoadedImageUrls)
    } catch(e) {
      console.warn("ERR", e)
    }
  }

  const handleScroll = () => {
    var position = window.pageYOffset
    var maxPosition = document.documentElement.scrollHeight - document.documentElement.clientHeight

    if (maxPosition-position <= 1200) {
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

  async function HandleBookmark() {
    if (!manga.source_id) { return }

    try {
      var callParams = {source: manga.source, source_id: manga.source_id}
      const response = await animapuApi.PostAddMangaToLibrary(callParams)
      const body = await response.json()
      if (response.status !== 200) {
        toast.error(`${body.error.error_code} || ${body.error.message}`)
        return
      }
    } catch (e) {
      toast.error(`Error: ${e}`)
    }

    toast.info("Manga ini udah disimpen ke library kamu!")
  }

  function ShareUrlText() {
    if (chapters.length === 0) { return }

    var ShareUrl = `Read *${manga.title.trim()}* - *Chapter ${chapters[0].number}* for free at ${window.location.href}`

    navigator.clipboard.writeText(ShareUrl)

    toast.info("Link berhasil dicopy!")
  }

  return (
    <>
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
        <Card className="border-none">
          <CardHeader className="p-0 pb-2">
            <CardTitle className='text-2xl tracking-wide'>[{manga.source}] {manga.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex justify-start gap-2">
            <Button size="sm" onClick={()=>HandleBookmark()}>bookmark</Button>
            <Button size="sm" onClick={()=>ShareUrlText()}>share</Button>
          </CardContent>
        </Card>

        <Drawer open={showChaptersModal} onOpenChange={setShowChaptersModal}>
          <DrawerContent>
            <div className='overflow-auto max-h-[450px] mx-auto w-full max-w-md'>
              <DrawerHeader className="text-left">
                <DrawerTitle>Select Chapters</DrawerTitle>
              </DrawerHeader>
              <div className='flex flex-col gap-2 p-4'>
                {manga.chapters.map((mangaChapter) => (
                  <Link
                    href={`/mangas/${manga.source}/${manga.source_id}/read/${mangaChapter.id}`}
                    onClick={()=>{setShowChaptersModal(false)}}
                    key={`/mangas/${manga.source}/${manga.source_id}/read/${mangaChapter.id}`}
                  >
                    <Button variant="outline" className="w-full">
                      {mangaChapter.title}
                    </Button>
                  </Link>
                ))}
              </div>
              <DrawerFooter className="pt-2">
                <DrawerClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>

        <div>
          {chapters.map((oneChapter) => (
            <div key={`chapter-${oneChapter.id}-${oneChapter.number}`}>
              <div className='mb-4'>
                <AdsCard variant={"manga_chapter"} limit={2} />
              </div>

              <Card className="sticky top-12 border-none rounded-none">
                <CardContent className="p-0 flex justify-between gap-1">
                  <Button size="sm" variant="outline" onClick={()=>setShowChaptersModal(!showChaptersModal)}>
                    Select Chapter
                    <ChevronDownIcon size={14} />
                  </Button>
                  <div className='flex items-center gap-1'>
                    <a href={oneChapter.source_link}>
                      <Button size="sm" variant="outline">read on source</Button>
                    </a>
                    <Button size="sm" variant="outline">
                      Chapter - {oneChapter.number}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className='flex flex-col items-center gap-1 w-full max-w-[800px]'>
                {oneChapter.chapter_images.map((imageObj, idx) => (
                  <div
                    id={`${oneChapter.id}---${idx}`}
                    key={`${oneChapter.id}-${idx}`}
                    // onLoad={()=>anyChapterImageLoaded(oneChapter, idx, `${oneChapter.id}---${idx}`)}
                    className='flex w-full justify-center'
                  >
                    { loadedImageUrls[imageObj.image_urls.join(";")] && <Img
                        loading='lazy'
                        className="w-full"
                        src={imageObj.image_urls}
                        // onLoad={()=>{setSuccessRender(1)}}
                        onError={()=>{}}
                        decode={false}
                        loader={
                          <Skeleton className="my-2 h-6 w-6 rounded-full" />
                        }
                      /> }
                  </div>
                ))}
              </div>
              <div
                id={`${oneChapter.id}-bottom`}
              ><hr/></div>
              <div
                className='h-[150px] bg-gradient-to-b from-primary to-transparent mb-40'
              ></div>
            </div>
          ))}
          {onApiCallSt && <Button className="w-full my-4 text-xl">Please wait, loading next chapter...</Button>}
          <div className='h-[150px]'></div>
        </div>
      </div>
    </>
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
