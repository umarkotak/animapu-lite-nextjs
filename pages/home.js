import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import animapuApi from "@/apis/AnimapuApi"
import Latest from "./latest"
import MangaCardBarHistory from "@/components/MangaCardBarHistory"
import Link from "next/link"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Megaphone } from "lucide-react"
import { useSwipeable } from "react-swipeable"

const CarouselData = [
  {image_url: "/images/animehub_cover_2.png", target_url: "/anime/latest", text: "watch anime"},
  {image_url: "/images/animehub_cover_3.png", target_url: "/anime/latest", text: "nonton anime"},
]

export default function Home() {
  const [mangaHistories, setMangaHistories] = useState([])

  async function GetOnlineReadHistories() {
    try {
      const response = await animapuApi.GetUserReadHistoriesV2(5, 1)
      const body = await response.json()

      if (response.status !== 200) {
        toast.error(`${body.error.error_code} || ${body.error.message}`)
        setMangaHistories([])
        return
      }

      setMangaHistories(body.data)

    } catch (e) {
      toast.error(e.message)
      setMangaHistories([])
    }
  }

  useEffect(() => {
    GetOnlineReadHistories()
  }, [])

  return (
    <>
      <div className="mb-6">
        <Carousel
          opts={{
            loop: true,
          }}
        >
          <CarouselContent>
            {CarouselData.map((oneCarouselData, idx) => (
              <CarouselItem key={"carousel"+idx+oneCarouselData.target_url}>
                <a href={oneCarouselData.target_url}>
                  <CardContent className="p-0 relative">
                    <img src={oneCarouselData.image_url} className="h-[100px] md:h-[180px] w-full object-cover rounded-xl" />
                    <div className="absolute bottom-0 w-full h-2/4 bg-gradient-to-t from-black to-transparent rounded-xl" />
                    {/* <div className="absolute bottom-2 right-auto left-auto">
                    </div> */}
                  </CardContent>
                  <span className="text-xs flex justify-center">{oneCarouselData.text}</span>
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      <Card className="mb-4">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="flex justify-between items-center">
            <span>Continue Read</span>
            <Link href="/history"><Button size="sm">See All</Button></Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-row gap-4 overflow-auto">
            {mangaHistories.map((manga) => (
              <div className="flex-none" key={"continue-"+manga.source+manga.source_id}>
                <MangaCardBarHistory manga={manga} key={`${manga.source}-${manga.source_id}`} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="flex justify-start items-center gap-2">
            <Megaphone />
            <span>Pengumuman</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          fitur nonton anime sudah dapat digunakan kembali!
        </CardContent>
      </Card>

      <Latest content_only={true} />
    </>
  )
}
