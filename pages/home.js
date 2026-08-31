import { useEffect } from "react"
import { useRouter } from "next/router"
import { HistoryIcon } from "lucide-react"
import HomeHeader from "@/components/HomeHeader"
import HomeMediaMenu from "@/components/HomeMediaMenu"
import UnifiedHistory from "@/components/UnifiedHistory"
import Latest from "./latest"
import AnimeLatest from "./anime/latest"

export default function Home() {
  const router = useRouter()
  const activeMedia = router.query.tab === "anime" ? "anime" : "manga"

  useEffect(() => {
    if (router.isReady && !router.query.tab) {
      router.replace({ pathname: router.pathname, query: { ...router.query, tab: "manga" } }, undefined, { shallow: true, scroll: false })
    }
  }, [router])

  function changeMedia(tab) {
    if (tab === activeMedia) return
    router.push({ pathname: router.pathname, query: { ...router.query, tab } }, undefined, { shallow: true, scroll: false })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="relative mx-4 my-4 pb-24 md:mx-0">
      <div className="pointer-events-none absolute -top-16 left-1/2 h-64 w-screen -translate-x-1/2 rounded-b-[50%] bg-gradient-to-b from-purple-500/30 via-fuchsia-500/20 to-pink-500/0 blur-3xl" />
      <div className="relative">
        <div className="mb-8"><HomeHeader /></div>
        <section className="mb-8">
          <div className="mb-4 flex items-center gap-2 font-medium"><HistoryIcon size={20} /> Continue</div>
          <UnifiedHistory compact />
        </section>
        {activeMedia === "anime" ? <AnimeLatest contentOnly /> : <Latest content_only hideSourceSelector />}
        <HomeMediaMenu activeMedia={activeMedia} onMediaChange={changeMedia} />
      </div>
    </div>
  )
}
