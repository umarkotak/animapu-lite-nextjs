import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { BookIcon, BookmarkIcon, DownloadIcon, EyeIcon, PlayIcon, Share2Icon } from 'lucide-react'
import { toast } from 'react-toastify'
import Link from 'next/link'
import animapuApi from "../apis/AnimapuApi"
import Manga from "../models/Manga"
import { Button } from "./ui/button"
import { Drawer, DrawerContent } from "@/components/ui/drawer"

export function MangaCardDrawer(props) {
  let router = useRouter()
  const query = router.query

  const [show, setShow] = useState(false)
  const [manga, setManga] = useState(initManga(props.manga))

  function initManga(initialManga) {
    initialManga.chapters = []
    return initialManga
  }

  async function GetMangaDetail() {
    try {
      const response = await animapuApi.GetMangaDetail({
        manga_source: props.manga.source,
        manga_id: props.manga.source_id,
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

  useEffect(() => {
    setShow(props.showModal)
  }, [props])

  useEffect(() => {
    if (show) { GetMangaDetail() }

    props.setShowModal(show)
  }, [show])

  const [chapters, setChapters] = useState([{id: 1}])
  const [continueManga, setContinueManga] = useState({last_link: "#", last_chapter_read: 0})
  const [followed, setFollowed] = useState(props.manga.is_in_library)

  function isContinuePossible() {
    try {
      var mangaObj = new Manga(props.manga, localStorage.getItem("ANIMAPU_LITE:USER:UNIQUE_SHA"))

      if (props.manga.last_chapter_read) {
        setContinueManga({last_link: props.manga.last_link, last_chapter_read: props.manga.last_chapter_read})
      }
    } catch (e) {
    }
  }

  useEffect(() => {
    setChapters(manga.chapters)
    isContinuePossible()
  }, [manga])

  async function HandleBookmark() {
    if (!manga.source_id) { return }

    if (followed) {
      setFollowed(false)
    } else {
      setFollowed(true)
    }

    // API CALL
    try {
      var callParams = {source: manga.source, source_id: manga.source_id}
      if (followed) {
        const response = await animapuApi.PostRemoveMangaFromLibrary(callParams)
        const body = await response.json()
        if (response.status !== 200) {
          toast.error(`${body.error.error_code} || ${body.error.message}`)
          return
        }
      } else {
        const response = await animapuApi.PostAddMangaToLibrary(callParams)
        const body = await response.json()
        if (response.status !== 200) {
          toast.error(`${body.error.error_code} || ${body.error.message}`)
          return
        }
      }
    } catch (e) {
      toast.error(`Error: ${e}`)
    }

    if (followed) {
      toast.info("Manga ini udah dihapus dari library kamu!")
    } else {
      toast.info("Manga ini udah disimpen ke library kamu!")
    }
  }

  async function handleUpvote() {
    if (!manga.source_id) { return }

    try {
      manga.star = true
      const response = await animapuApi.PostUpvoteManga(manga)
      const body = await response.json()
      if (response.status !== 200) {
        toast.error(`${body.error.error_code} || ${body.error.message}`)
        return
      }
      toast.info("Upvote sukses!")

    } catch (e) {
      toast.error(e.message)
    }
  }

  function startReadDecider(chapters) {
    try {
      return chapters.at(-1).id
    } catch {
      return 1
    }
  }

  useEffect(() => {
    if (show) {
      router.push({
        pathname: window.location.pathname,
        query: {
          ...query,
          back_page: query.page,
          selected: `${props.manga.source}-${props.manga.source_id}`,
        },
      }, undefined, { shallow: true })
      return
    }

  }, [show])

  return(
    <div>
      {!props.disableBookmarkIcon && <div className="absolute top-1 right-1 p-1 rounded-lg text-black hover:text-[#ec294b] z-10" onClick={() => HandleBookmark()}>
        <button className="drop-shadow-sm bg-white bg-opacity-50 backdrop-blur rounded-full p-1">
          <span className={`${followed ? "text-[#ec294b]": ""}`}><BookmarkIcon strokeWidth={3} size={20} /></span>
        </button>
      </div>}
      {
        show &&
        <Drawer open={show} onOpenChange={setShow}>
          <DrawerContent className="min-h-[85vh] max-h-[85vh]">
            <div className="mt-4 bg-accent container mx-auto max-w-[768px] flex gap-2 p-3">
              <div className="flex-none">
                <img
                  className={`h-50 w-30 shadow-md object-cover rounded-lg ${manga.title ? "" : "animate-pulse"}`}
                  src={(manga.cover_image && manga.cover_image[0].image_urls[0]) || "/images/default-book.png"}
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-end items-center gap-2">
                  <Button
                    size="xs"
                    variant="default"
                    className=""
                    onClick={(e)=>{
                      navigator.clipboard.writeText(`Read *${manga.title}* for free at https://animapu.vercel.app/mangas/${manga.source}/${manga.source_id}?secondary_source_id=${manga.secondary_source_id}`)
                      toast.info("Link berhasil dicopy!")
                    }}
                  >
                    <Share2Icon size={10} /> Share</Button>
                  <Button
                    size="xs"
                    variant="default"
                    onClick={() => HandleBookmark()}
                  >
                    <BookmarkIcon size={10} />
                    {followed ? "Un-Follow" : "Follow"}
                  </Button>
                </div>
                <h1 className="text-lg">
                  { manga.title ? manga.title : <div className="h-3 bg-gray-600 rounded animate-pulse w-1/2"></div> }
                </h1>
                {
                  manga.description ?
                  <p className="text-xs max-h-32 overflow-hidden overflow-y-scroll">
                    {manga.description}
                  </p>
                  :
                  <div></div>
                }
              </div>
            </div>
            <div className="container mx-auto max-w-[768px]">
              <div className="flex items-center gap-2 flex-wrap px-3 py-2">
                <Button
                  size="xs"
                  variant="default"
                  onClick={() => { router.push(`/mangas/${manga.source}/${manga.source_id}?secondary_source_id=${manga.secondary_source_id}`) }}
                >
                  <EyeIcon size={10} />
                  Detail
                </Button>
                <Button
                  size="xs"
                  variant="default"
                  onClick={() => { router.push(`/mangas/${manga.source}/${manga.source_id}/read/${startReadDecider(chapters)}?secondary_source_id=${manga.secondary_source_id}`) }}
                >
                  <BookIcon size={10} />
                  Start Read
                </Button>
                {continueManga.last_link && continueManga.last_link !== "#" &&
                  <Button
                    size="xs"
                    variant="default"
                    className="bg-blue-400 text-white"
                    onClick={() => { router.push(continueManga.last_link ||'#') }}
                  >
                    <PlayIcon size={10} />
                    Cont Ch {continueManga.last_chapter_read}
                  </Button>
                }
              </div>
            </div>
            <div className="container mx-auto px-3 max-w-[768px]">
              <div className="mt-3 flex flex-col gap-2 h-[35vh] overflow-hidden overflow-y-scroll">
                {manga.chapters.map((chapter, idx) => (
                  <div className="flex flex-row items-center gap-2" key={chapter.title}>
                    <a
                      href={animapuApi.DownloadMangaChapterPdfUri({
                        manga_source: manga.source,
                        manga_id: manga.source_id,
                        chapter_id: chapter.id,
                      })}
                      onClick={()=>{toast.info("we are preparing your file, just wait...")}}
                    >
                      <Button size="sm" className="w-full"><DownloadIcon /></Button>
                    </a>
                    <div className="w-full">
                      <Link
                        href={`/mangas/${manga.source}/${manga.source_id}/read/${chapter.id}`}
                      >
                        <Button size="sm" className="w-full">{chapter.title}</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      }
    </div>
  )
}