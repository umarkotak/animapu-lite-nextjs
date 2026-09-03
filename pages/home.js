import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/router"
import Link from "next/link"
import { ArrowRight, HistoryIcon, Timer } from "lucide-react"
import HomeHeader from "@/components/HomeHeader"
import HomeMediaMenu from "@/components/HomeMediaMenu"
import UnifiedHistory from "@/components/UnifiedHistory"

const Latest = dynamic(() => import("./latest"))
const AnimeLatest = dynamic(() => import("./anime/latest"))

export default function Home() {
  const router = useRouter()
  const activeMedia = router.query.tab === "anime" ? "anime" : "manga"
  const [isLegacyHost, setIsLegacyHost] = useState(false)
  const [secondsRemaining, setSecondsRemaining] = useState(10)

  useEffect(() => {
    if (window.location.hostname !== "animapu.vercel.app") return

    setIsLegacyHost(true)
    const redirect = () => window.location.replace(`https://animapu.my.id${window.location.pathname}${window.location.search}${window.location.hash}`)
    const interval = window.setInterval(() => setSecondsRemaining((seconds) => Math.max(0, seconds - 1)), 1000)
    const timeout = window.setTimeout(redirect, 10000)

    return () => {
      window.clearInterval(interval)
      window.clearTimeout(timeout)
    }
  }, [])

  useEffect(() => {
    // TODO: Remove this temporary Anime source override.
    localStorage.setItem("ANIMAPU_LITE:ACTIVE_ANIME_SOURCE", "kuramanime")

    if (router.isReady && !router.query.tab) {
      router.replace({ pathname: router.pathname, query: { ...router.query, tab: "manga" } }, undefined, { shallow: true, scroll: false })
    }
  }, [router])

  function changeMedia(tab) {
    if (tab === activeMedia) return
    router.push({ pathname: router.pathname, query: { ...router.query, tab } }, undefined, { shallow: true, scroll: false })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function goToNewSite() {
    window.location.replace(`https://animapu.my.id${window.location.pathname}${window.location.search}${window.location.hash}`)
  }

  if (isLegacyHost) {
    return <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-zinc-950 px-6 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,.45),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,.3),transparent_40%)]" />
      <section className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl sm:p-12">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[.25em] text-fuchsia-200">Animapu has moved</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">We have a new home.</h1>
        <p className="mt-5 text-lg leading-relaxed text-white/75">Animapu is now available at <span className="font-semibold text-white">animapu.my.id</span>.</p>
        <button className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 font-semibold text-zinc-950 transition hover:bg-white/90" onClick={goToNewSite}>Go to animapu.my.id <ArrowRight className="size-5" /></button>
        <p className="mt-5 flex items-center justify-center gap-2 text-sm text-white/60"><Timer className="size-4" /> Redirecting automatically in {secondsRemaining}s</p>
      </section>
    </main>
  }

  return (
    <div className="relative mx-4 my-4 pb-24 md:mx-0">
      <div className="pointer-events-none absolute -top-16 left-1/2 hidden h-64 w-screen -translate-x-1/2 rounded-b-[50%] bg-gradient-to-b from-purple-500/30 via-fuchsia-500/20 to-pink-500/0 blur-3xl sm:block" />
      <div className="relative">
        <div className="mb-8"><HomeHeader activeMedia={activeMedia} /></div>
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
