import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { useRouter } from "next/router"
import { Img } from 'react-image'
import Link from 'next/link'
import * as Cronitor from "@cronitorio/cronitor-rum";
import { jsPDF } from "jspdf";
import { saveAs } from 'file-saver';

import animapuApi from "../../../../../apis/AnimapuApi"
import { toast } from 'react-toastify'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Bookmark, ChevronDownIcon, ChevronLeft, DownloadIcon, LinkIcon, Settings2, Share2Icon, XIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import AdsCard from '@/components/AdsCard'
import { LoadingSpinner } from '@/components/ui/icon'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import ScrollProgress from '@/components/ScrollProgress'

var tempChapters = []
var onApiCall = false
var tempLoadedImageUrls = {}
var tempFailedImageUrls = {}
export default function ReadManga(props) {
  let router = useRouter()
  const query = router.query
  const pathName = usePathname()

  const [manga, setManga] = useState(props.manga)
  const [chapters, setChapters] = useState([])
  const [onApiCallSt, setOnApiCallSt] = useState(onApiCall)
  const [showChaptersModal, setShowChaptersModal] = useState(false)
  const [loadedImageUrls, setLoadedImageUrls] = useState({})
  const [failedImageUrls, setFailedImageUrls] = useState({})
  const [chapterFilter, setChapterFilter] = useState("")
  const [selectedChapterId, setSelectedChapterId] = useState(query.chapter_id || "")

  useEffect(() => {
    if (animapuApi.GetUserLogin().logged_in === "") {
      toast.error("Please login first to start reading")
      router.push("/login")
    }

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
              resolve()
            };
          });

          setLoadedImageUrls({...tempLoadedImageUrls})
        }
      }

      chapterData.chapter_images.forEach((imageObj) => {
        tempFailedImageUrls[imageObj.image_urls.join(";")] = true
      })
      setFailedImageUrls({...tempFailedImageUrls})

    } catch(e) {
      toast.error(`error: ${e}`)
    }
  }

  const handleScroll = () => {
    var position = window.pageYOffset
    var maxPosition = document.documentElement.scrollHeight - document.documentElement.clientHeight

    // bigger will be fetch next chapter earlier
    if (maxPosition-position <= 3600) {
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

  async function HandleDownloadChapter(oneChapter) {
    DownloadMangaChapterPdf(oneChapter)
  }

  async function DownloadMangaChapterPdf(oneChapter) {
    try {
      const response = await animapuApi.DownloadMangaChapterPdf({
        manga_source: oneChapter.source,
        manga_id: oneChapter.source_id,
        chapter_id: oneChapter.id,
      })
      if (response.status == 200) {
        toast.success(`download chapter ${oneChapter.number} success`)
        return
      }

    } catch (e) {
      console.error(e)
    }
  }

  function DownloadMangaChapterPdfUri(oneChapter) {
    var pdfUrl = animapuApi.DownloadMangaChapterPdfUri({
      manga_source: oneChapter.source,
      manga_id: oneChapter.source_id,
      chapter_id: oneChapter.id,
    })

    // saveAs(pdfUrl, `${manga.title} - chapter ${oneChapter.number}`);

    // toast.info("downloading manga")
    return pdfUrl
  }

  useEffect(() => {
    if (showChaptersModal) {
      // Small delay to ensure the drawer animation has started
      setTimeout(() => {
        const currentChapterElement = document.getElementById('current-chapter');
        if (currentChapterElement) {
          currentChapterElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 100);
    }
  }, [showChaptersModal]);

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

      <div className="flex flex-col gap-4 mt-2">
        <div className="">
          <div>
            <div className='text-3xl tracking-wide'>{manga.title}</div>
          </div>
          <div>
            source: {manga.source}
          </div>
        </div>

        <Drawer open={showChaptersModal} onOpenChange={setShowChaptersModal}>
          <DrawerContent>
            <div className='overflow-auto h-[450px] mx-auto w-full max-w-md'>
              <DrawerHeader className="text-left">
                <DrawerTitle>Select Chapters</DrawerTitle>
              </DrawerHeader>
              <div className='p-4'>
                <Input
                  placeholder="search chapter"
                  value={chapterFilter}
                  onChange={(e) => {setChapterFilter(e.target.value)}}
                />
              </div>
              <div className='flex flex-col gap-2 p-4'>
                {manga.chapters.filter((mangaChapter) => mangaChapter.title.includes(chapterFilter)).map((mangaChapter) => {
                  const isCurrentChapter = mangaChapter.id === selectedChapterId;
                  return (
                    <Link
                      key={`/mangas/${manga.source}/${manga.source_id}/read/${mangaChapter.id}`}
                      href={`/mangas/${manga.source}/${manga.source_id}/read/${mangaChapter.id}`}
                      onClick={()=>{setShowChaptersModal(false)}}
                      id={isCurrentChapter ? 'current-chapter' : undefined}
                    >
                      <Button variant={isCurrentChapter ? "default" : "outline"} className="w-full">
                        {mangaChapter.title}
                      </Button>
                    </Link>
                  );
                })}
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
              {/* <div className='mb-4'>
                <AdsCard variant={"manga_chapter"} limit={2} />
              </div> */}

              <div className="sticky top-0 bg-accent">
                <div className="p-0 flex flex-col">
                  <div className='flex justify-between items-center gap-1'>
                    <div className='flex items-center gap-1'>
                      <Button size="sm" variant="outline" onClick={()=>{
                        router.back()
                      }}>
                        <ChevronLeft size={14} />
                      </Button>
                      <Button size="sm" variant="outline" onClick={()=>{
                        setSelectedChapterId(oneChapter.id);
                        setShowChaptersModal(!showChaptersModal);
                      }}>
                        {onApiCallSt && <LoadingSpinner />}
                        Chapter - {oneChapter.number}
                        <ChevronDownIcon size={14} />
                      </Button>
                    </div>
                    <div className='flex items-center gap-1'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline"><Settings2 /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                          <DropdownMenuLabel>Menu</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuGroup>
                            {oneChapter.source_link !== ""
                              ? <a href={oneChapter.source_link !== "" ? oneChapter.source_link : "#"}>
                                <DropdownMenuItem>
                                  read on original source
                                  <DropdownMenuShortcut><LinkIcon size={12} /></DropdownMenuShortcut>
                                </DropdownMenuItem>
                              </a>
                              : <DropdownMenuItem onClick={() => {toast.error("link unavailable") }}>
                                read on original source
                                <DropdownMenuShortcut><LinkIcon size={12} /></DropdownMenuShortcut>
                              </DropdownMenuItem>
                            }
                            <DropdownMenuItem onClick={() => {ShareUrlText()}}>
                              share
                              <DropdownMenuShortcut><Share2Icon size={12} /></DropdownMenuShortcut>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {HandleBookmark()}}>
                              bookmark
                              <DropdownMenuShortcut><Bookmark size={12} /></DropdownMenuShortcut>
                            </DropdownMenuItem>
                            {/* <DropdownMenuItem onClick={() => {DownloadMangaChapterPdfUri(oneChapter)}}>
                              download as pdf (beta)
                              <DropdownMenuShortcut><DownloadIcon size={12} /></DropdownMenuShortcut>
                            </DropdownMenuItem> */}
                            <a
                              href={DownloadMangaChapterPdfUri(oneChapter)}
                              onClick={()=>{toast.info("we are preparing your file, just wait...")}}
                            ><DropdownMenuItem>
                              download as pdf
                              <DropdownMenuShortcut><DownloadIcon size={12} /></DropdownMenuShortcut>
                            </DropdownMenuItem></a>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <ScrollProgress
                    topElementId={`${oneChapter.id}-top`}
                    bottomElementId={`${oneChapter.id}-bottom`}
                    showPercentage={false}
                    className=""
                  />
                </div>
              </div>

              <div id={`${oneChapter.id}-top`} className=''></div>
              <div className='flex flex-col items-center gap-1 w-full max-w-[800px]'>
                {oneChapter.chapter_images.map((imageObj, idx) => (
                  loadedImageUrls[imageObj.image_urls.join(";")]
                  ? <Img
                    key={`rendered-image-${oneChapter.id}-${idx}`}
                    loading='lazy'
                    className="w-full"
                    src={imageObj.image_urls}
                    // onLoad={()=>{setSuccessRender(1)}}
                    onError={()=>{}}
                    decode={false}
                    loader={
                      <LoadingSpinner />
                    }
                  />
                  : failedImageUrls[imageObj.image_urls.join(";")]
                  ? null
                  : <div
                    key={`loading-image-${oneChapter.id}-${idx}`}
                  >
                    <LoadingSpinner />
                  </div>
                ))}
              </div>
              <div id={`${oneChapter.id}-bottom`} className='h-[150px] bg-gradient-to-b from-primary to-transparent mb-40'></div>
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

async function imagesToPdf(imageUrls, pdfFileName = 'images.pdf') {
  if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
    console.error('Invalid image URLs array.');
    return;
  }

  try {
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true
     });

    let y = 0;
    const margin = 10; // Margin in PDF units (default is points)

    for (let j = 0; j < imageUrls.length; j++) {
      var imageUrl = imageUrls[j]

      try {
        const img = new Image();
        img.setAttribute('crossorigin', 'anonymous')
        // img.crossOrigin = "anonymous"

        await new Promise((resolve, reject) => {
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            ctx.drawImage(img, 0, 0);

            const dataUrl = canvas.toDataURL('image/png');

            console.warn("DATA", new Date, dataUrl)
            resolve()
          };

          img.onerror = () => {
            resolve()
          };

          img.src = imageUrl;
        });

      } catch (error) {
        console.warn(`Failed to load image: ${imageUrl}. Skipping.`, error);
      }
    }

    // pdf.save(pdfFileName);
    console.log(`PDF saved as ${pdfFileName}`);

  } catch (error) {
    console.error('Error creating PDF:', error);
  }
}

async function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image from ${url}`));
    img.crossOrigin = "anonymous"; //Crucial for cross-origin images.
    img.src = url;
  });
}

function convertImageToBase64(url, callback) {
  const img = new Image();
  // img.crossOrigin = "Anonymous"; // This is required if the image is from a different origin
  img.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.height = img.naturalHeight;
      canvas.width = img.naturalWidth;
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      callback(dataUrl);
  };
  img.src = url;
}
