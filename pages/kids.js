import { useEffect, useState } from "react"
import Link from "next/link"
import { HistoryIcon } from "lucide-react"
import { toast } from "react-toastify"

import animapuApi from "@/apis/AnimapuApi"
import HomeHeader from "@/components/HomeHeader"
import MangaCardV2 from "@/components/MangaCardV2"
import UnifiedHistory from "@/components/UnifiedHistory"

const placeholders = [
  { source: "shimmer", source_id: "kids-1", shimmer: true },
  { source: "shimmer", source_id: "kids-2", shimmer: true },
]

export default function Kids() {
  const [mangas, setMangas] = useState(placeholders)

  useEffect(() => {
    async function loadKidsMangas() {
      try {
        const response = await animapuApi.GetKidsMangas()
        const body = await response.json()
        if (response.status !== 200) {
          throw new Error(body.error?.message || "Unable to load Kids Corner")
        }
        setMangas(body.data)
      } catch (e) {
        toast.error(e.message)
        setMangas([])
      }
    }
    loadKidsMangas()
  }, [])

  return <div className="relative mx-4 my-4 pb-8 md:mx-0">
    <div className="pointer-events-none absolute -top-16 left-1/2 hidden h-64 w-screen -translate-x-1/2 rounded-b-[50%] bg-gradient-to-b from-purple-500/30 via-fuchsia-500/20 to-pink-500/0 blur-3xl sm:block" />
    <div className="relative">
      <div className="mb-8"><HomeHeader activeMedia="manga" /></div>
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between font-medium"><div className="flex items-center gap-2"><HistoryIcon size={20} /> Continue</div><Link className="text-sm text-primary hover:underline" href="/history">See all</Link></div>
        <UnifiedHistory compact />
      </section>
      <h1 className="mb-6 text-2xl font-semibold">Kids Corner</h1>
      {mangas.length ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {mangas.map((manga) => <MangaCardV2 manga={manga} key={`${manga.source}-${manga.source_id}`} />)}
      </div> : <p className="text-muted-foreground">No kid-friendly manga yet.</p>}
    </div>
  </div>
}
