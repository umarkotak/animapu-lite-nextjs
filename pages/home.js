import { useEffect } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/router"
import Link from "next/link"
import { HistoryIcon } from "lucide-react"
import HomeHeader from "@/components/HomeHeader"
import HomeMediaMenu from "@/components/HomeMediaMenu"
import UnifiedHistory from "@/components/UnifiedHistory"

const Latest = dynamic(() => import("./latest"))
const AnimeLatest = dynamic(() => import("./anime/latest"))

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
      <div className="pointer-events-none absolute -top-16 left-1/2 hidden h-64 w-screen -translate-x-1/2 rounded-b-[50%] bg-gradient-to-b from-purple-500/30 via-fuchsia-500/20 to-pink-500/0 blur-3xl sm:block" />
      <div className="relative">
        <div className="mb-8"><HomeHeader /></div>
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between font-medium"><div className="flex items-center gap-2"><HistoryIcon size={20} /> Continue</div><Link className="text-sm text-primary hover:underline" href="/history">See all</Link></div>
          <UnifiedHistory compact />
        </section>
        {activeMedia === "anime" ? <AnimeLatest contentOnly /> : <Latest content_only hideSourceSelector />}
        <HomeMediaMenu activeMedia={activeMedia} onMediaChange={changeMedia} />
      </div>
    </div>
  )
}
