import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import animapuApi from "@/apis/AnimapuApi"
import Link from "next/link"
import { BookMarked, Sun, CheckCheck, List, Clock } from "lucide-react"
import UserDropdown from "@/components/layouts/UserDropdown"

export default function HomeHeader({ activeMedia, animeSource }) {
  const router = useRouter()
  const [capabilities, setCapabilities] = useState([])
  const specialFilter = router.query.special_filter || ""

  useEffect(() => {
    setCapabilities([])
    if (activeMedia !== "anime" || !animeSource) return
    const controller = new AbortController()
    async function loadCapabilities() {
      try {
        const response = await animapuApi.GetAnimeCapabilities({ anime_source: animeSource, signal: controller.signal })
        const body = await response.json()
        if (!controller.signal.aborted && response.ok) setCapabilities(body.data || [])
      } catch (error) {
        if (error.name !== "AbortError") console.error(error)
      }
    }
    loadCapabilities()
    return () => controller.abort()
  }, [activeMedia, animeSource])

  const animeFilters = [
    { value: "", label: "Latest", icon: Clock, enabled: true },
    { value: "completed", label: "Completed", icon: CheckCheck, enabled: capabilities.some((capability) => capability.get_completed === true) },
    { value: "all", label: "All", icon: List, enabled: capabilities.some((capability) => capability.get_all === true) },
  ]

  const quickAction = activeMedia === "anime"
    ? { href: "/anime/season", icon: Sun, label: "Season" }
    : { href: "/library", icon: BookMarked, label: "Library" }
  const QuickActionIcon = quickAction.icon

  return (
    <section>
      <header className="flex items-center justify-between">
        <Link className="flex items-center gap-3" href="/home?tab=manga">
          <img className="size-9 rounded-xl" src="/images/cover192.png" alt="Animapu" />
          <h1 className="font-semibold">Animapu</h1>
        </Link>
        <div className="flex items-center gap-3">
          <Link className="rounded-lg px-3 py-2 text-sm transition hover:bg-accent" href="/kids">Kids</Link>
          <UserDropdown />
        </div>
      </header>
      <nav className="mt-5 grid grid-cols-4 gap-3 sm:grid-cols-5 lg:grid-cols-6">
        <Link className="flex aspect-square min-w-0 flex-col items-center justify-center gap-2 rounded-2xl bg-white/5 text-xs transition hover:bg-white/10 sm:text-sm" href={quickAction.href}><QuickActionIcon className="size-6 sm:size-7 lg:size-9" /><span className="truncate">{quickAction.label}</span></Link>
        {activeMedia === "anime" && animeFilters.filter((filter) => filter.enabled).map((filter) => {
          const Icon = filter.icon
          const query = { ...router.query, tab: "anime" }
          if (filter.value) query.special_filter = filter.value
          else delete query.special_filter
          return <Link key={filter.value} shallow scroll={false} aria-current={specialFilter === filter.value ? "page" : undefined} className={`flex aspect-square min-w-0 flex-col items-center justify-center gap-2 rounded-2xl text-xs transition sm:text-sm ${specialFilter === filter.value ? "bg-primary text-primary-foreground" : "bg-white/5 hover:bg-white/10"}`} href={{ pathname: "/home", query }}><Icon className="size-6 sm:size-7 lg:size-9" /><span className="truncate">{filter.label}</span></Link>
        })}
      </nav>
    </section>
  )
}
