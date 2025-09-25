import { Button } from "@/components/ui/button"
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
      <Card>
        <CardHeader className="p-4">
          <CardTitle>Menu</CardTitle>
          <CardDescription>admin menu</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Link href="/admin/affiliate_link"><Button className="w-full">Affiliate Link Management</Button></Link>
            <Link href="/admin/user_activity"><Button className="w-full">User Manga Activity</Button></Link>
            <Link href="/admin/user_anime_activity"><Button className="w-full">User Anime Activity</Button></Link>
            <Link href="/admin/voice_recorder"><Button className="w-full">Voice Recorder</Button></Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
