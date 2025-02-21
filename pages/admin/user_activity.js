import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GraduationCap, MoreHorizontal, Plus, Trash } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import animapuApi from "@/apis/AnimapuApi"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenuContent, DropdownMenuTrigger, DropdownMenu, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import MangaCardBarHistory from "@/components/MangaCardBarHistory"

export default function UserActivity() {
  const [usersMangaActivity, setUsersMangaActivity] = useState([])
  const [tokopediaAffiliateLinkParams, setTokopediaAffiliateLinkParams] = useState({})

  useEffect(() => {
    GetUsersMangaActivities()
  }, [])

  async function GetUsersMangaActivities() {
    try {
      const response = await animapuApi.GetUsersMangaActivities(1000)
      const body = await response.json()
      if (response.status == 200) {
        setUsersMangaActivity(body.data.users)
        return
      }

    } catch (e) {
      toast.error(`error: ${e}`)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="p-4">
          <CardTitle>Users Manga Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-col gap-6">
            {usersMangaActivity.map((oneUsersMangaActivity) => (
              <Card className="border-none" key={oneUsersMangaActivity.visitor_id}>
                <CardHeader className="py-4 px-0">
                  <CardTitle>{oneUsersMangaActivity.email !== "" ? oneUsersMangaActivity.email : "Guest"}</CardTitle>
                  <CardDescription className="break-all">visitor id: {oneUsersMangaActivity.visitor_id}</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex flex-row gap-4 overflow-auto">
                    {oneUsersMangaActivity.manga_histories.map((manga) => (
                      <div className="flex-none" key={oneUsersMangaActivity.visitor_id+manga.source+manga.source_id}>
                        <MangaCardBarHistory manga={manga} key={`${manga.source}-${manga.source_id}`} show_last_access={true} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
