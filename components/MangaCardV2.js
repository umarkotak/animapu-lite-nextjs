import { useState, useEffect } from "react"
import {
  Book,
  Bookmark,
  Download,
  Eye,
  Heart,
  Play,
  Share2,
  X,
  ChevronDown,
  Search
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import animapuApi from "@/apis/AnimapuApi"

// Shimmer Loading Card
function MangaCardShimmer({ manga }) {
  return (
    <div
      className="w-full max-w-[175px] h-[265px] mx-auto rounded-xl"
      key={`card-${manga.source}-${manga.source_id}`}
    >
      <div className="w-[175px] h-[265px] rounded-xl">
        <div className="flex flex-col justify-end relative z-10 animate-pulse shadow-xl">
          <div className="w-full h-[265px] rounded-xl bg-slate-500" />
          <div className="absolute bg-black bg-opacity-75 p-2 text-white z-10 rounded-b-xl w-full">
            <div className="h-2 bg-slate-500 rounded mb-2" />
            <div className="h-2 bg-slate-500 rounded mb-2" />
            <div className="h-3 w-12 bg-blue-500 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Card Component
export default function MangaCardV2({ manga, show_hover_source, show_updated_at, disableBookmarkIcon }) {
  const [showDrawer, setShowDrawer] = useState(false)
  const [followed, setFollowed] = useState(manga.is_in_library)

  const lastReadText = manga.last_link ? `continue: ch ${manga.last_chapter_read}` : null

  const coverImage = manga.cover_image?.[0]?.image_urls?.[0] || "/images/default-book.png"

  const handleBookmark = async () => {
    if (!manga.source_id) return

    const newFollowedState = !followed
    setFollowed(newFollowedState)

    try {
      const params = { source: manga.source, source_id: manga.source_id }
      // Simulated API call
      console.log(followed ? 'Remove from library' : 'Add to library', params)

      // Simulate success
      console.log(followed ? "Manga removed from library!" : "Manga saved to library!")
    } catch (e) {
      setFollowed(!newFollowedState)
      console.error(`Error: ${e}`)
    }
  }

  if (manga.shimmer) {
    return <MangaCardShimmer manga={manga} />
  }

  return (
    <>
      <div
        className="w-full max-w-[175px] h-[265px] mx-auto group"
        key={`${manga.source}-${manga.source_id}`}
        id={`${manga.source}-${manga.source_id}`}
      >
        <div className="flex flex-col relative shadow-xl rounded-xl">
          {!disableBookmarkIcon && (
            <div className="absolute top-1 right-1 p-1 rounded-lg text-black hover:text-[#ec294b] z-10">
              <button
                onClick={handleBookmark}
                className="drop-shadow-sm bg-white bg-opacity-50 backdrop-blur rounded-full p-1"
              >
                <Bookmark
                  strokeWidth={3}
                  size={20}
                  className={followed ? "text-[#ec294b] fill-[#ec294b]" : ""}
                />
              </button>
            </div>
          )}

          <div className="overflow-hidden rounded-xl">
            <div className="bg-black rounded-xl" onClick={() => setShowDrawer(true)}>
              <img
                className="w-full object-cover h-[265px] rounded-xl group-hover:scale-105 transition z-0 cursor-pointer"
                src={coverImage}
                alt={manga.title}
              />
            </div>
          </div>

          <div>
            {show_hover_source && (
              <div className="absolute bottom-16 left-1 px-2 py-1 leading-none bg-black bg-opacity-90 text-[12px]">
                <small>{manga.source}</small>
              </div>
            )}
            {show_updated_at && (
              <div className="absolute bottom-16 left-1 px-2 py-1 leading-none bg-black bg-opacity-90 text-[12px]">
                <small>last update: {manga.updated_at}</small>
              </div>
            )}
            <div
              className="absolute bottom-0 p-2 text-white rounded-b-xl w-full bg-black/80 backdrop-blur-sm cursor-pointer"
              onClick={() => setShowDrawer(true)}
            >
              <p className="text-sm line-clamp-2 group-hover:text-blue-400">
                {manga.title}
              </p>
              <div className="flex justify-between items-center text-sm text-[#75b5f0] mt-1">
                <span>{manga.latest_chapter_number !== 0 ? `Ch ${manga.latest_chapter_number}` : "Read"}</span>
                {lastReadText && <span className="text-[12px]">{lastReadText}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <MangaDrawer
        manga={manga}
        open={showDrawer}
        onOpenChange={setShowDrawer}
        followed={followed}
        onFollowChange={setFollowed}
      />
    </>
  )
}

// Drawer Component
function MangaDrawer({ manga, open, onOpenChange, followed, onFollowChange }) {
  const [mangaDetails, setMangaDetails] = useState({ ...manga, chapters: [] })
  const [continueManga, setContinueManga] = useState({ last_link: "#", last_chapter_read: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [chapterSearch, setChapterSearch] = useState("")

  const coverImage = mangaDetails.cover_image?.[0]?.image_urls?.[0] || "/images/default-book.png"

  useEffect(() => {
    if (open) {
      fetchMangaDetails()
      checkContinuePossible()
    }
  }, [open])

  const fetchMangaDetails = async () => {
    setIsLoading(true)
    try {
      const response = await animapuApi.GetMangaDetail({
        manga_source: manga.source,
        manga_id: manga.source_id,
      })
      const body = await response.json()

      if (response.status === 200) {
        setMangaDetails(body.data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const checkContinuePossible = () => {
    if (manga.last_chapter_read) {
      setContinueManga({
        last_link: manga.last_link,
        last_chapter_read: manga.last_chapter_read
      })
    }
  }

  const handleBookmark = async () => {
    if (!manga.source_id) return

    const newFollowedState = !followed
    onFollowChange(newFollowedState)

    try {
      console.log(followed ? 'Remove from library' : 'Add to library')
      console.log(followed ? "Manga removed from library!" : "Manga saved to library!")
    } catch (e) {
      onFollowChange(!newFollowedState)
      console.error(`Error: ${e}`)
    }
  }

  const handleShare = () => {
    const shareText = `Read *${mangaDetails.title}* for free at https://animapu.vercel.app/mangas/${mangaDetails.source}/${mangaDetails.source_id}`
    navigator.clipboard.writeText(shareText)
    console.log("Link copied!")
  }

  const getStartReadChapterId = () => {
    return mangaDetails.chapters?.at(-1)?.id || 1
  }

  // Filter chapters based on search
  const filteredChapters = mangaDetails.chapters?.filter(chapter => {
    if (!chapterSearch) return true

    const searchTerm = chapterSearch.toLowerCase().trim()
    const chapterTitle = chapter.title.toLowerCase()
    const chapterNumber = chapter.number?.toString() || ""

    return chapterTitle.includes(searchTerm) || chapterNumber.includes(searchTerm)
  }) || []

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[90vh]">
        <div className="mt-4 flex flex-col h-full overflow-hidden mx-auto w-full max-w-[768px]">
          {/* Header Section - Fixed */}
          <div className="flex-shrink-0 px-4 pb-4">
            <div className="flex items-start gap-4">
              {/* Cover Image */}
              <div className="flex-shrink-0">
                <img
                  src={coverImage}
                  alt={mangaDetails.title}
                  className="w-24 h-32 object-cover rounded-lg shadow-lg"
                />
              </div>

              {/* Title & Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <Badge variant="secondary" className="mb-2">{mangaDetails.source}</Badge>
                    <h2 className="text-lg font-bold line-clamp-2 mb-1">
                      {mangaDetails.title || <div className="h-6 bg-gray-300 rounded animate-pulse w-3/4" />}
                    </h2>
                    {mangaDetails.latest_chapter_number && (
                      <p className="text-sm text-muted-foreground">
                        Latest: Ch {mangaDetails.latest_chapter_number}
                      </p>
                    )}
                  </div>
                  <DrawerClose asChild>
                    <Button size="icon" variant="ghost">
                      <X size={20} />
                    </Button>
                  </DrawerClose>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button
                    size="sm"
                    className="bg-[#ec294b] hover:bg-[#B11F38] text-white"
                    onClick={handleBookmark}
                  >
                    <Heart size={14} className={followed ? "fill-current" : ""} />
                    {followed ? "Following" : "Follow"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleShare}>
                    <Share2 size={14} />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section - Scrollable */}
          <Tabs defaultValue="chapters" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="w-full rounded-none">
              <TabsTrigger value="chapters" className="flex-1">
                Chapters {mangaDetails.chapters?.length > 0 && `(${mangaDetails.chapters.length})`}
              </TabsTrigger>
              <TabsTrigger value="about" className="flex-1">About</TabsTrigger>
            </TabsList>

            {/* Chapters Tab */}
            <TabsContent value="chapters" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className="h-full px-4 py-2">
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-12 bg-accent rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : mangaDetails.chapters?.length > 0 ? (
                  <div className="space-y-2 pb-4">
                    {/* Continue Reading Button */}
                    {continueManga.last_link && continueManga.last_link !== "#" && (
                      <Button
                        size="lg"
                        className="w-full bg-[#3db3f2] hover:bg-[#318FC2] text-white mb-3"
                      >
                        <Play size={18} />
                        Continue Reading - Ch {continueManga.last_chapter_read}
                      </Button>
                    )}

                    {/* Start Reading Button */}
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full mb-4"
                    >
                      <Book size={18} />
                      Start from Beginning
                    </Button>

                    {/* Chapter Search Input */}
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                      <Input
                        type="text"
                        placeholder="Search by chapter number..."
                        value={chapterSearch}
                        onChange={(e) => setChapterSearch(e.target.value)}
                        className="pl-10"
                      />
                      {chapterSearch && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 px-2"
                          onClick={() => setChapterSearch("")}
                        >
                          <X size={14} />
                        </Button>
                      )}
                    </div>

                    {/* Search Results Count */}
                    {chapterSearch && (
                      <div className="text-sm text-muted-foreground mb-2">
                        Found {filteredChapters.length} chapter{filteredChapters.length !== 1 ? 's' : ''}
                      </div>
                    )}

                    <div className="border-t pt-4">
                      <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                        {chapterSearch ? 'Search Results' : 'All Chapters'}
                      </h3>
                      {filteredChapters.length > 0 ? (
                        filteredChapters.map((chapter) => (
                          <div
                            key={chapter.id}
                            className="group flex items-center gap-2 mb-2 p-3 rounded-lg border hover:bg-accent transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-sm truncate">
                                  {chapter.title}
                                </span>
                                <ChevronDown className="rotate-[-90deg] text-muted-foreground group-hover:text-foreground transition-colors" size={16} />
                              </div>
                            </div>
                            <Button size="icon" variant="ghost" className="flex-shrink-0">
                              <Download size={16} />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <Search size={48} className="text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">No chapters found matching "{chapterSearch}"</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={() => setChapterSearch("")}
                          >
                            Clear Search
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Book size={48} className="text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No chapters available yet</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* About Tab */}
            <TabsContent value="about" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className="h-full px-4 py-4">
                <div className="space-y-4 pb-4">
                  {mangaDetails.description ? (
                    <>
                      <div>
                        <h3 className="font-semibold mb-2">Description</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {mangaDetails.description}
                        </p>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" className="w-full">
                          <Eye size={16} />
                          View Full Details
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-muted-foreground mb-4">No description available</p>
                      <Button variant="outline">
                        <Eye size={16} />
                        View Full Details
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export {MangaDrawer}