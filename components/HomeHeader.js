import Link from "next/link"
import { BookMarked, History, Search, Sun } from "lucide-react"
import UserDropdown from "@/components/layouts/UserDropdown"

const quickActions = [
  { href: "/search", icon: Search, label: "Search" },
  { href: "/library", icon: BookMarked, label: "Library" },
  { href: "/anime/season", icon: Sun, label: "Season" },
  { href: "/history", icon: History, label: "History" },
]

export default function HomeHeader() {
  return (
    <section>
      <header className="flex items-center justify-between">
        <Link className="flex items-center gap-3" href="/home?tab=manga">
          <img className="size-9 rounded-xl" src="/images/cover192.png" alt="Animapu" />
          <h1 className="font-semibold">Animapu</h1>
        </Link>
        <UserDropdown />
      </header>
      <nav className="mt-5 grid grid-cols-4 gap-3">
        {quickActions.map(({ href, icon: Icon, label }) => <Link className="flex aspect-square min-w-0 flex-col items-center justify-center gap-2 rounded-2xl bg-white/5 text-xs transition hover:bg-white/10" href={href} key={href}><Icon size={20} /><span className="truncate">{label}</span></Link>)}
      </nav>
    </section>
  )
}
