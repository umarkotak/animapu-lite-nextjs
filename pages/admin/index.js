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
import { GraduationCap } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"
import { toast } from "react-toastify"
import { DefaultLayout } from "@/components/layouts/DefaultLayout"

export default function AdminIndex() {
  return (
    <DefaultLayout>
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader className="p-4">
            <CardTitle>Menu</CardTitle>
            <CardDescription>admin menu</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Link href="/admin/affiliate_link"><Button className="w-full">Affiliate Link Management</Button></Link>
              <Link href="/admin/user_activity"><Button className="w-full">User Activity</Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DefaultLayout>
  )
}
