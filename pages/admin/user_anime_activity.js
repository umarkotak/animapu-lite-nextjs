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
import AnimeCardBar from "@/components/AnimeCardBar"
import AnimeCard from "@/components/AnimeCard"

export default function UserActivity() {
  const [usersAnimeActivity, setUsersAnimeActivity] = useState([])

  useEffect(() => {
    GetUsersAnimeActivities()
  }, [])

  async function GetUsersAnimeActivities() {
    try {
      const response = await animapuApi.GetUsersAnimeActivities(1000)
      const body = await response.json()
      if (response.status == 200) {
        setUsersAnimeActivity(body.data.users)
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
            {usersAnimeActivity.map((oneUsersAnimeActivity) => (
              <Card className="border-none" key={oneUsersAnimeActivity.visitor_id}>
                <CardHeader className="py-4 px-0">
                  <CardTitle>{oneUsersAnimeActivity.email !== "" ? oneUsersAnimeActivity.email : "Guest"}</CardTitle>
                  <CardDescription className="break-all">visitor id: {oneUsersAnimeActivity.visitor_id}</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex flex-row gap-4 overflow-auto">
                    {oneUsersAnimeActivity.anime_histories.map((oneAnimeData) => (
                      <AnimeCardBar anime={oneAnimeData} key={`${oneAnimeData.source}-${oneAnimeData.id}`} source={oneAnimeData.source} show_last_access={true} />
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
