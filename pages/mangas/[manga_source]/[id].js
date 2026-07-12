import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from "next/router"
import Link from 'next/link'
import { ArrowLeft, BookOpen, Bookmark, Check, ChevronRight, Copy, Library, Play, Share2, Tag } from 'lucide-react'

import animapuApi from "../../../apis/AnimapuApi"
import Manga from "../../../models/Manga"
import { toast } from 'react-toastify'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function MangaDetail(props) {
  const router = useRouter()
  const query = router.query
  const manga = props.manga
  const chapters = Array.isArray(manga.chapters) ? manga.chapters : []
  const coverImage = manga?.cover_image?.[0]?.image_urls?.[0] || "/images/default-book.png"
  const mangaSource = manga.source || query.manga_source
  const mangaId = manga.source_id || query.id
  const secondarySourceId = query.secondary_source_id || manga.secondary_source_id
  const [continueManga, setContinueManga] = useState({ last_link: "#", last_chapter_read: 0 })
  const [followed, setFollowed] = useState(false)

  const listKey = "ANIMAPU_LITE:FOLLOW:LOCAL:LIST"
  const detailKey = `ANIMAPU_LITE:FOLLOW:LOCAL:DETAIL:${manga.source}:${manga.source_id}:${manga.secondary_source_id}`

  function isContinuePossible() {
    try {
      const mangaObj = new Manga(manga, localStorage.getItem("ANIMAPU_LITE:USER:UNIQUE_SHA"))

      if (localStorage.getItem("ANIMAPU_LITE:USER:LOGGED_IN") === "true") {
        const onlineHistory = localStorage.getItem(mangaObj.GetOnlineHistoryKey())
        if (onlineHistory) {
          setContinueManga(JSON.parse(onlineHistory))
          return
        }
      }

      const localHistory = localStorage.getItem(mangaObj.GetLocalHistoryKey())
      if (localHistory) {
        setContinueManga(JSON.parse(localHistory))
      }
    } catch (e) {}
  }

  function isInLibrary() {
    return typeof window !== "undefined" && Boolean(localStorage.getItem(detailKey))
  }

  useEffect(() => {
    setFollowed(isInLibrary())
    isContinuePossible()
  }, [manga.source, manga.source_id, manga.secondary_source_id])

  function handleFollow() {
    if (!manga.source_id) { return }

    const libraryArrayString = localStorage.getItem(listKey)
    const libraryArray = libraryArrayString ? JSON.parse(libraryArrayString) : []
    const nextLibrary = libraryArray.filter((savedManga) => (
      `${savedManga.source}-${savedManga.source_id}` !== `${manga.source}-${manga.source_id}`
    ))

    if (followed) {
      localStorage.setItem(listKey, JSON.stringify(nextLibrary))
      localStorage.removeItem(detailKey)
      setFollowed(false)
      toast.info("Manga dihapus dari library kamu.")
      return
    }

    nextLibrary.unshift(manga)
    localStorage.setItem(listKey, JSON.stringify(nextLibrary))
    localStorage.setItem(detailKey, JSON.stringify(manga))
    setFollowed(true)
    toast.info("Manga ini udah masuk library kamu!")
  }

  function startReadDecider() {
    return chapters.at(-1)?.id || 1
  }

  function readHref(chapterId) {
    const secondarySourceQuery = secondarySourceId ? `?secondary_source_id=${secondarySourceId}` : ""
    return `/mangas/${mangaSource}/${mangaId}/read/${chapterId}${secondarySourceQuery}`
  }

  function shareManga() {
    navigator.clipboard.writeText(`Read *${manga.title}* for free at ${window.location.href}`)
    toast.info("Link berhasil dicopy!")
  }

  return (
    <div className="px-4 py-5 sm:px-6">
      <Head>
        <title>{manga.title ? `${manga.title} - Animapu` : "Animapu"}</title>
        <meta itemProp="description" content={manga.title || ""} />
        <meta itemProp="image" content={coverImage} />
        <meta name="og:title" content={manga.title || "Animapu"} />
        <meta name="og:description" content={manga.title || ""} />
        <meta name="og:image" content={coverImage} />
        <meta name="twitter:description" content={manga.title || ""} />
        <meta name="twitter:image" content={coverImage} />
      </Head>

      <div className="mx-auto flex max-w-4xl flex-col gap-5">
        <Button variant="ghost" size="sm" className="w-fit" onClick={() => router.back()}>
          <ArrowLeft size={16} /> Back
        </Button>

        <Card className="overflow-hidden border-border/70 bg-card">
          <CardContent className="grid gap-5 p-4 sm:grid-cols-[190px_1fr] sm:p-6">
            <div className="mx-auto w-full max-w-[190px] sm:mx-0">
              <img
                className="aspect-[2/3] w-full rounded-xl object-cover shadow-xl"
                src={coverImage}
                alt={`Cover of ${manga.title || "manga"}`}
              />
            </div>

            <div className="flex min-w-0 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Badge variant="secondary" className="mb-2 max-w-full truncate">{manga.source || "Manga"}</Badge>
                  <h1 className="text-2xl font-semibold leading-tight sm:text-3xl">{manga.title || "Untitled manga"}</h1>
                </div>
                <Button variant="ghost" size="icon" onClick={shareManga} aria-label="Copy manga link">
                  <Share2 size={18} />
                </Button>
              </div>

              {manga.description && <p className="mt-4 text-sm leading-6 text-muted-foreground whitespace-pre-line">{manga.description}</p>}

              {manga.genres?.length > 0 && <div className="mt-4 flex flex-wrap gap-2">
                {manga.genres.map((genre, index) => (
                  <Badge key={`${genre}-${index}`} variant="outline" className="gap-1 font-normal"><Tag size={12} />{genre}</Badge>
                ))}
              </div>}

              <div className="mt-6 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                <Button asChild className="col-span-2 sm:col-auto">
                  <Link href={readHref(startReadDecider())}><BookOpen size={16} /> Start reading</Link>
                </Button>
                {continueManga.last_link && continueManga.last_link !== "#" && <Button asChild variant="secondary" className="col-span-2 sm:col-auto">
                  <Link href={continueManga.last_link}><Play size={16} /> Continue ch. {continueManga.last_chapter_read}</Link>
                </Button>}
                <Button variant={followed ? "secondary" : "outline"} onClick={handleFollow}>
                  {followed ? <Check size={16} /> : <Bookmark size={16} />}
                  {followed ? "In library" : "Add to library"}
                </Button>
                <Button variant="outline" size="icon" onClick={shareManga} aria-label="Copy manga link">
                  <Copy size={16} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold"><Library size={19} /> Chapters</h2>
                <p className="text-sm text-muted-foreground">{chapters.length} available chapter{chapters.length === 1 ? "" : "s"}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {chapters.map((chapter, index) => (
                <Link
                  key={chapter.id || `${chapter.title}-${index}`}
                  href={readHref(chapter.id)}
                  className="group flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-3 transition-colors hover:bg-accent"
                >
                  <span className="min-w-0 truncate text-sm font-medium">{chapter.title || `Chapter ${index + 1}`}</span>
                  <ChevronRight size={18} className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
              {chapters.length === 0 && <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">No chapters are available yet.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export async function getServerSideProps(context) {
  const query = context.query

  try {
    const response = await animapuApi.GetMangaDetail({
      manga_source: query.manga_source,
      manga_id: query.id,
      secondary_source_id: query.secondary_source_id,
    })
    const body = await response.json()
    if (response.status === 200) {
      return { props: { manga: body.data } }
    }
  } catch (e) {
    console.error(e)
  }

  return {
    props: {
      manga: {
        cover_image: [{ image_urls: ["/images/default-book.png"] }],
        chapters: [],
      },
    },
  }
}
