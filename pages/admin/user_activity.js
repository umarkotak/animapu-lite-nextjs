import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, UserRound } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import animapuApi from "@/apis/AnimapuApi"
import HistoryCard from "@/components/HistoryCard"

export default function UserActivity() {
  const [usersActivity, setUsersActivity] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    GetUsersActivities()
  }, [])

  async function GetUsersActivities() {
    try {
      const response = await animapuApi.GetUsersActivities(1000)
      const body = await response.json()
      if (response.status == 200) {
        setUsersActivity(body.data.users)
        return
      }
      toast.error(`${body.error?.error_code || response.status} || ${body.error?.message || "Unable to load activity"}`)
    } catch (e) {
      toast.error(`error: ${e}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative mx-4 my-4 pb-24 md:mx-0">
      <div className="pointer-events-none absolute -top-16 left-1/2 hidden h-64 w-screen -translate-x-1/2 rounded-b-[50%] bg-gradient-to-b from-purple-500/30 via-fuchsia-500/20 to-pink-500/0 blur-3xl sm:block" />
      <div className="relative flex flex-col gap-6">
        <header>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[.2em] text-fuchsia-300"><Activity size={16} /> Admin</p>
          <h1 className="text-3xl font-bold tracking-tight">User activity</h1>
          <p className="mt-2 text-sm text-muted-foreground">Recent manga reading and anime watching activity from members and guests.</p>
        </header>

        {!isLoading && !usersActivity.length && <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-muted-foreground backdrop-blur-xl">No activity yet.</p>}

        <div className="flex flex-col gap-6">
          {usersActivity.map((userActivity) => (
            <Card className="overflow-hidden border-white/10 bg-white/5 backdrop-blur-xl" key={userActivity.visitor_id}>
              <CardHeader className="border-b border-white/10">
                <CardTitle className="flex items-center gap-2 text-base"><UserRound size={18} />{userActivity.email || "Guest"}</CardTitle>
                <CardDescription className="break-all">Visitor ID: {userActivity.visitor_id}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {userActivity.histories.map((history) => <HistoryCard history={history} key={`${history.media_type}-${history.source}-${history.source_id}`} />)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
