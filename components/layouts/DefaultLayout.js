import { usePathname } from "next/navigation"

export function DefaultLayout({ children }) {
  const pathname = usePathname()

  return <main className={`mx-auto w-full ${pathname?.includes("/watch/") ? "" : "max-w-[768px]"}`}>{children}</main>
}
