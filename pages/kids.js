import { useEffect, useState } from "react"
import { toast } from "react-toastify"

import animapuApi from "@/apis/AnimapuApi"
import MangaCardV2 from "@/components/MangaCardV2"

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

  return <div className="mx-4 my-4 pb-8 md:mx-0">
    <h1 className="mb-6 text-2xl font-semibold">Kids Corner</h1>
    {mangas.length ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {mangas.map((manga) => <MangaCardV2 manga={manga} key={`${manga.source}-${manga.source_id}`} />)}
    </div> : <p className="text-muted-foreground">No kid-friendly manga yet.</p>}
  </div>
}
