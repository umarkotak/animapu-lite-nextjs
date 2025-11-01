import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { toast } from "react-toastify"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import animapuApi from "@/apis/AnimapuApi"
import ChangeSourceModalOnly from "@/components/ChangeSourceModalOnly"
import MangaCardV2 from "@/components/MangaCardV2"
import AdsCard from "@/components/AdsCard"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

var onApiCall = false
var page = 1
var dummyMangas = [
  {source: "shimmer", source_id: "shimmer-1", shimmer: true},
  {source: "shimmer", source_id: "shimmer-2", shimmer: true},
]
var tempMangas = []
var scrolledToSelect = false
export default function Latest({content_only}) {
  let router = useRouter()
  const query = router.query

  const [activeSource, setActiveSource] = useState("")
  const [mangas, setMangas] = useState(dummyMangas)
  const [isLoadMoreLoading, setIsLoadMoreLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  async function GetLatestManga(append) {
    if (onApiCall) {return}
    onApiCall = true

    if (append) {
      page = page + 1
    } else {
      tempMangas = []
      page = 1
      scrolledToSelect = false
    }

    try {
      setIsLoadMoreLoading(true)

      const response = await animapuApi.GetLatestManga({
        manga_source: animapuApi.GetActiveMangaSource(),
        page: page
      })
      const body = await response.json()

      if (response.status !== 200) {
        toast.error(`${body.error.error_code} || ${body.error.message}`)
        setIsLoadMoreLoading(false)
        onApiCall = false
        return
      }

      var mangasData = body.data
      // mangasData = injectObjectEveryNthElement(mangasData, {
      //   is_ads: true
      // }, 10)

      router.push({
        pathname: window.location.pathname,
        query: {...query, page: page},
      }, undefined, { shallow: true })

      if (append) {
        tempMangas = tempMangas.concat(mangasData)
      } else {
        tempMangas = mangasData
      }
      setMangas(tempMangas)

    } catch (e) {
      toast.error(e.message)
    }

    onApiCall = false
    setIsLoadMoreLoading(false)

    var back_page = parseInt(query.back_page)
    if (back_page > 1 && page < back_page) {
      GetLatestManga(true)
    }
  }

  useEffect(() => {
    if (scrolledToSelect) { return }
    var targetMangaCardID = query.selected
    try {
      document.querySelector(`#${targetMangaCardID}`).scrollIntoView( { behavior: "smooth", block: "start" } )
      scrolledToSelect = true
    } catch (e) {}
  }, [mangas])

  useEffect(() => {
    setActiveSource(animapuApi.GetActiveMangaSource())
    GetLatestManga(false)
  }, [])

  function injectObjectEveryNthElement(array, object, n) {
    return array.reduce((acc, item, index) => {
        acc.push(item);
        if ((index + 1) % n === 0 && index !== array.length - 1) {
            acc.push(object);
        }
        return acc;
    }, []);
  }

  const handleScroll = () => {
    var position = window.pageYOffset
    var maxPosition = document.documentElement.scrollHeight - document.documentElement.clientHeight

    if (maxPosition-position <= 400) {
      if (onApiCall) {return}
      GetLatestManga(true)
    }
  }
  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  if (content_only) {
    return(
      <div className="flex flex-col gap-4">
        <div className="flex flex-row justify-between items-center px-4 py-8 h-full bg-accent rounded-xl">
          <div className="flex flex-col">
            <span className="text-xs">source:</span>
            <h1 className="text-3xl font-mono">{activeSource}</h1>
          </div>
          <div>
            <Button onClick={()=>{setShowModal(true)}} size="sm">Change Source</Button>
            <ChangeSourceModalOnly show={showModal} onClose={()=>setShowModal(false)} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 z-0">
          {/* <AdsCard /> */}
          {mangas.map((manga, idx) => (
            manga.is_ads
            ? <AdsCard key={`ads-${idx}`} />
            : <MangaCardV2 manga={manga} key={`${manga.source}-${manga.source_id}`} />
          ))}
        </div>

        {isLoadMoreLoading && <Button className="w-full">
          Loading...
        </Button>}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="flex justify-between items-center">
            <div>
              <h1 className="text-xl">{activeSource}</h1>
            </div>
            <div>
              <Button onClick={()=>{setShowModal(true)}}>Ganti Sumber</Button>
              <ChangeSourceModalOnly show={showModal} onClose={()=>setShowModal(false)} />
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 z-0">
        {/* <AdsCard /> */}
        {mangas.map((manga, idx) => (
          manga.is_ads
          ? <AdsCard />
          : <MangaCardV2 manga={manga} key={`${manga.source}-${manga.source_id}`} />
        ))}
      </div>

      {isLoadMoreLoading && <Button className="w-full">
        Loading...
      </Button>}
    </div>
  )
}
