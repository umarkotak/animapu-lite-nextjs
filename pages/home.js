import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import animapuApi from "@/apis/AnimapuApi"
import Latest from "./latest"
import MangaCardBarHistory from "@/components/MangaCardBarHistory"
import Link from "next/link"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { BookIcon, BookMarkedIcon, Clapperboard, EyeIcon, HistoryIcon, HomeIcon, Megaphone, MoveRightIcon, SearchIcon } from "lucide-react"
import { useSwipeable } from "react-swipeable"
import AnimeSourceHome from "./anime/latest"
import AnimeHistory from "./anime/history"
import { Separator } from "@/components/ui/separator"

const CarouselData = [
  {image_url: "/images/animehub_cover_2.png", target_url: "https://trakteer.id/marumaru", text: "support animapu disini"},
  {image_url: "/images/animehub_cover_3.png", target_url: "/anime/latest", text: "nonton anime"},
]

export default function Home() {
  const [mangaHistories, setMangaHistories] = useState([])
  const [user, setUser] = useState({})

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
    setUser(animapuApi.GetUserLogin())
  }, [])

  return (
    <div className="my-4 mx-4 md:mx-0">
      {(!user.logged_in || user.logged_in === "") && <Card className="mb-4 border-none gap-2 flex flex-row justify-between items-center bg-red-950 p-2">
        <div>To use animapu you have to log in first.</div>
        <Link href="/login">
          <Button variant="default" size="sm" className="bg-red-800 text-white">Login</Button>
        </Link>
      </Card>}

      <div className="mb-6 border-none">
        <div className="p-0 pb-4">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2"><HistoryIcon /> Continue Read</span>
            <Link href="/history"><Button size="sm">See All</Button></Link>
          </div>
        </div>
        <div className="p-0">
          <div className="flex flex-row gap-4 overflow-auto">
            {mangaHistories.map((manga) => (
              <div className="flex-none" key={"continue-"+manga.source+manga.source_id}>
                <MangaCardBarHistory manga={manga} key={`${manga.source}-${manga.source_id}`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6 border-none">
        <div className="p-0 pb-4">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2"><EyeIcon /> Continue Watch</span>
            <Link href="/anime/history"><Button size="sm">See All</Button></Link>
          </div>
        </div>
        <div className="p-0">
          <AnimeHistory discoveryBar={true} />
        </div>
      </div>

      <div className="mb-6 border-none">
        <div className="p-0 pb-4">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2"><Clapperboard /> Watch Anime</span>
            <Link href="/anime/latest"><Button size="sm">See All</Button></Link>
          </div>
        </div>
        <div className="p-0">
          <AnimeSourceHome discoveryBar={true} />
        </div>
      </div>

      <Latest content_only={true} />
    </div>
  )
}
