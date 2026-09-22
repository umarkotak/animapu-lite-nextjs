import { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen, Eye, Minus, Play, Plus } from "lucide-react"
import { toast } from "react-toastify"
import animapuApi from "@/apis/AnimapuApi"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent } from "@/components/ui/drawer"

export default function HistoryDrawer({ history, open, onOpenChange }) {
  const isAnime = history.media_type === "anime"
  const [detail, setDetail] = useState({ chapters: [], episodes: [] })
  const [tags, setTags] = useState(history.tags || [])
  const [isAdmin, setIsAdmin] = useState(false)
  const [isUpdatingTag, setIsUpdatingTag] = useState(false)
  const hasKidsTag = tags.includes("for_kids:true")
  const hasNSFWTag = tags.includes("nsfw:true")

  useEffect(() => {
    if (!open) return

    async function loadDetail() {
      try {
        const response = isAnime
          ? await animapuApi.GetAnimeDetail({ anime_source: history.source, anime_id: history.source_id })
          : await animapuApi.GetMangaDetail({ manga_source: history.source, manga_id: history.source_id })
        const body = await response.json()
        if (response.status === 200) setDetail(body.data)
      } catch (error) {
        console.error(error)
      }
    }

    loadDetail()
  }, [open, isAnime, history.source, history.source_id])

  useEffect(() => {
    if (!open || isAnime) return
    animapuApi.GetAdminStatus()
      .then((response) => response.json())
      .then((body) => setIsAdmin(body.data?.is_admin === true))
      .catch(() => setIsAdmin(false))
  }, [open, isAnime])

  async function toggleTag(tag, hasTag, label) {
    setIsUpdatingTag(true)
    try {
      const response = await animapuApi.PutMangaTags({
        source: history.source,
        source_id: history.source_id,
        mode: hasTag ? "remove" : "add",
        tags: [tag],
      })
      const body = await response.json()
      if (response.status !== 200) throw new Error(body.error?.message || "Unable to update tag")
      setTags(body.data.tags)
      toast.info(`${hasTag ? "Removed from" : "Added to"} ${label}`)
    } catch (error) {
      toast.error(error.message)
    }
    setIsUpdatingTag(false)
  }

  const cover = detail.cover_urls?.[0] || detail.cover_image?.[0]?.image_urls?.[0] || history.cover_urls?.[0] || "/images/default-book.png"
  const title = detail.title || history.title
  const items = isAnime ? detail.episodes || [] : detail.chapters || []
  const startItem = items[0]
  const detailPath = isAnime ? `/anime/${history.source}/detail/${history.source_id}/watch/${startItem?.id}` : `/mangas/${history.source}/${history.source_id}`

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="min-h-[85vh] max-h-[85vh]">
        <div className="container mx-auto mt-4 flex max-w-[768px] gap-3 bg-accent p-3">
          <img className="h-40 w-28 flex-none rounded-lg object-cover shadow-md" src={cover} alt="" />
          <div className="flex min-w-0 flex-col gap-2">
            <span className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-primary">{isAnime ? <Play size={13} /> : <BookOpen size={13} />} {history.media_type}</span>
            <h2 className="text-lg font-semibold">{title}</h2>
            {detail.description && <p className="max-h-24 overflow-y-auto text-xs text-muted-foreground">{detail.description}</p>}
          </div>
        </div>

        <div className="container mx-auto flex max-w-[768px] flex-wrap gap-2 px-3 py-3">
          {(!isAnime || startItem) && <Button asChild size="xs"><Link href={detailPath}><Eye size={12} /> {isAnime ? "Start Watch" : "Detail"}</Link></Button>}
          {history.last_link && <Button asChild size="xs"><Link href={history.last_link}><Play size={12} /> Continue {isAnime ? `Ep ${history.progress}` : `Ch ${history.progress}`}</Link></Button>}
          {!isAnime && isAdmin && <>
            <Button disabled={isUpdatingTag} onClick={() => toggleTag("for_kids:true", hasKidsTag, "Kids Corner")} size="xs">{hasKidsTag ? <Minus size={12} /> : <Plus size={12} />} Kids</Button>
            <Button disabled={isUpdatingTag} onClick={() => toggleTag("nsfw:true", hasNSFWTag, "NSFW")} size="xs" variant={hasNSFWTag ? "destructive" : "default"}>NSFW</Button>
          </>}
        </div>

        <div className="container mx-auto h-[40vh] max-w-[768px] overflow-y-auto px-3 pb-4">
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <Button asChild className="justify-start" key={item.id} variant="secondary">
                <Link href={isAnime ? `/anime/${history.source}/detail/${history.source_id}/watch/${item.id}` : `/mangas/${history.source}/${history.source_id}/read/${item.id}`}>
                  {isAnime ? `Episode ${item.number}` : item.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
