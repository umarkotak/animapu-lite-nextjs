import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Plus, Trash } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import animapuApi from "@/apis/AnimapuApi"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenuContent, DropdownMenuTrigger, DropdownMenu, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu"

export default function AffiliateLink() {
  const [affiliateLinkList, setAffiliateLinkList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [tokopediaAffiliateLinkParams, setTokopediaAffiliateLinkParams] = useState({})

  useEffect(() => {
    GetAffiliateLinks()
  }, [])

  async function GetAffiliateLinks() {
    try {
      const response = await animapuApi.GetAffiliateLinks(1000)
      const body = await response.json()
      if (response.status == 200) {
        setAffiliateLinkList(body.data)
        return
      }

    } catch (e) {
      toast.error(`error: ${e}`)
    }
  }

  async function DeleteAffiliateLink(id) {
    try {
      // const response = await animapuApi.GetAffiliateLinks(3)
      // const body = await response.json()
      // if (response.status == 200) {
      //   setAffiliateLinkList(body.data)
      //   return
      // }
      GetAffiliateLinks()

    } catch (e) {
      toast.error(`error: ${e}`)
    }
  }

  async function AddTokopediaAffiliateLink() {
    try {
      setIsLoading(true)
      const response = await animapuApi.PostAddTokopediaAffiliateLink(tokopediaAffiliateLinkParams)
      const body = await response.json()

      if (response.status == 200) {
        setTokopediaAffiliateLinkParams({})
        setIsLoading(false)
        GetAffiliateLinks()
        toast.success("affiliate link berhasil dimasukkan")
        return
      }

      setIsLoading(false)

    } catch (e) {
      setIsLoading(false)
      toast.error(`error: ${e}`)
    }
  }

  function HandleChange(e) {
    var {name, value} = e.target

    setTokopediaAffiliateLinkParams({
      ...tokopediaAffiliateLinkParams,
      [name]: value,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="p-4">
          <CardTitle>Add Affiliate Link</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input type="text" placeholder="tokopedia product affiliate link" name="link" value={tokopediaAffiliateLinkParams.link} onChange={HandleChange} />
            <Button onClick={()=>AddTokopediaAffiliateLink()} disabled={isLoading}><Plus /> Add</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="p-4">
          <CardTitle>Affiliate Link Management</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="border rounded-xl">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center"><Checkbox /></TableHead>
                  <TableHead className="text-center">ID</TableHead>
                  <TableHead className="text-center">Image</TableHead>
                  <TableHead className="text-center">Name</TableHead>
                  <TableHead className="text-center">Link</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {affiliateLinkList.map((affiliateLink) => (
                  <TableRow className="text-left text-xs" key={affiliateLink.short_link}>
                    <TableCell><Checkbox /></TableCell>
                    <TableCell>{affiliateLink.id}</TableCell>
                    <TableCell className><img src={affiliateLink.image_url} className="h-12 w-12 object-contain" /></TableCell>
                    <TableCell>{affiliateLink.name}</TableCell>
                    <TableCell>{affiliateLink.short_link}</TableCell>
                    <TableCell><DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm"><MoreHorizontal /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuItem onClick={()=>{DeleteAffiliateLink(affiliateLink.id)}}><Trash /> delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
