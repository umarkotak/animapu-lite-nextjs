import { Activity } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link"

export default function AdminIndex() {
  return (
    <div className="flex flex-col gap-4">
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <CardHeader className="p-4">
          <CardTitle>Menu</CardTitle>
          <CardDescription>admin menu</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-2">
            <Link href="/admin/user_activity" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium transition hover:border-primary/60 hover:bg-white/10"><Activity size={18} />User activity</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
