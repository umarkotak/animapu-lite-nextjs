import Link from "next/link"
import { BookMarked, Sun } from "lucide-react"
import UserDropdown from "@/components/layouts/UserDropdown"

export default function HomeHeader({ activeMedia }) {
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
        <UserDropdown />
      </header>
      <nav className="mt-5 grid grid-cols-4 gap-3 sm:grid-cols-5 lg:grid-cols-6">
        <Link className="flex aspect-square min-w-0 flex-col items-center justify-center gap-2 rounded-2xl bg-white/5 text-xs transition hover:bg-white/10 sm:text-sm" href={quickAction.href}><QuickActionIcon className="size-6 sm:size-7 lg:size-9" /><span className="truncate">{quickAction.label}</span></Link>
      </nav>
    </section>
  )
}
