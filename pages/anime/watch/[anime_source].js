import { useState, useEffect } from 'react'
import { useRouter } from "next/router"
import { useAlert } from 'react-alert'

import BottomMenuBar from "../../../components/BottomMenuBar"

var onApiCall = false
var activeSourceIdxDirect = 0
export default function WatchFromSource() {
  let router = useRouter()
  const query = router.query

  const [animeSource, setAnimeSource] = useState("")
  const [sandboxMode, setSandboxMode] = useState("allow-top-navigation allow-same-origin allow-forms allow-scripts")

  useEffect(() => {
    if (!query) { return }

    if (query.anime_source === "animepahe") {
      setAnimeSource("https://animepahe.com/")

    } else if (query.anime_source === "animeindo") {
      setAnimeSource("https://185.224.82.193/")

    } else if (query.anime_source === "animension") {
      setSandboxMode("allow-top-navigation allow-same-origin allow-forms allow-scripts allow-popups")
      setAnimeSource("https://animension.to/")

    } else {
      setAnimeSource("https://animepahe.com/")
    }
  // eslint-disable-next-line
  }, [query])

  return (
    <div className="bg-[#d6e0ef]">
      <div className="h-screen">
        <iframe
          className="h-screen pb-10"
          title={animeSource}
          src={animeSource}
          sandbox={sandboxMode}
          allow="fullscreen"
          style={{
            "display": "block",
            "border": "none",
            "overflow": "hidden",
            "width": "100%"
          }}
          width="100%"
          frameBorder="0"
        />
      </div>
      {/* <div className="mb-4"></div> */}

      <BottomMenuBar no_need_screen={true} />
    </div>
  )
}
