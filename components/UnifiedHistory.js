import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import animapuApi from "@/apis/AnimapuApi"
import HistoryCard from "@/components/HistoryCard"

const placeholders = [{ shimmer: true }, { shimmer: true }, { shimmer: true }, { shimmer: true }]

export default function UnifiedHistory({ compact = false }) {
  const [histories, setHistories] = useState(placeholders)

  useEffect(() => {
    async function loadHistories() {
      try {
        const response = await animapuApi.GetHistories(compact ? 5 : 10000, 1)
        const body = await response.json()
        if (response.status !== 200) {
          toast.error(`${body.error.error_code} || ${body.error.message}`)
          setHistories([])
          return
        }
        setHistories(body.data)
      } catch (error) {
        toast.error(error.message)
        setHistories([])
      }
    }

    loadHistories()
  }, [compact])

  if (!histories.length) {
    return <p className="py-8 text-sm text-muted-foreground">No reading or watch history yet.</p>
  }

  return <div className={compact ? "flex flex-nowrap gap-4 overflow-x-auto pb-2" : "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"}>{histories.map((history, index) => <HistoryCard compact={compact} history={history} key={history.shimmer ? index : `${history.media_type}-${history.source}-${history.source_id}`} />)}</div>
}
