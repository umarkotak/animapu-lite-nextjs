import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/router"
import UnifiedHistory from "@/components/UnifiedHistory"
import { Button } from "@/components/ui/button"

export default function History() {
  const router = useRouter()

  return (
    <div className='relative min-h-screen overflow-x-clip px-4 py-5'>
      <div className="pointer-events-none absolute -top-16 left-1/2 h-64 w-screen -translate-x-1/2 rounded-b-[50%] bg-gradient-to-b from-purple-500/30 via-fuchsia-500/20 to-pink-500/0 blur-3xl" />
      <div className="relative flex flex-col gap-4">
        <header className="flex items-center gap-2">
          <Button aria-label="Go home" onClick={() => router.push("/home")} size="icon" variant="ghost"><ArrowLeft size={20} /></Button>
          <h1 className="text-xl font-semibold">History</h1>
        </header>
        <UnifiedHistory />
      </div>
    </div>
  )
}
