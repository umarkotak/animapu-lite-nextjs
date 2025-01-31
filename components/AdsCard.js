import { useState, useRef, useEffect } from 'react'
import { useRouter } from "next/router"
import Link from 'next/link'

import animapuApi from "../apis/AnimapuApi"
import Manga from "../models/Manga"
import { BookIcon, BookmarkIcon, Eye, EyeIcon, Heart, HeartIcon, PlayIcon, Share2Icon, StarIcon, XIcon } from 'lucide-react'
import { toast } from 'react-toastify'
import * as Cronitor from "@cronitorio/cronitor-rum"
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Badge } from './ui/badge'

export default function AdsCard({variant}) {
  const [affiliateLinkList, setAffiliateLinkList] = useState([])

  useEffect(() => {
    GetAffiliateLinks()
  }, [])

  async function GetAffiliateLinks() {
    try {
      const response = await animapuApi.GetRandomAffiliateLinks(1)
      const body = await response.json()
      if (response.status == 200) {
        setAffiliateLinkList(body.data)
        return
      }

    } catch (e) {
      console.error(e)
    }
  }

  async function trackClick(codename) {
    Cronitor.track(`ADS_CLICK_${codename}`)
  }

  return(<>
    {affiliateLinkList.map((oneAds) => (
      <div
        className={`w-full max-w-[175px] h-[265px] mx-auto border overflow-hidden rounded-xl border-primary`}
        key={`${new Date}-${oneAds.short_link}`}
      >
        <Link href={oneAds.short_link} target="_blank" onClick={()=>trackClick(oneAds.short_link)}>
          <div className="flex flex-col relative shadow-xl rounded-xl">
            <div className="overflow-hidden rounded-xl">
              <div className="bg-black rounded-xl">
                <img
                  className={`w-full object-contain object-top h-[265px] rounded-xl hover:scale-105 transition z-0 cursor-pointer`}
                  src={oneAds.image_url}
                  alt="thumb"
                />
              </div>
            </div>
            <div>
              <div className="absolute bottom-0 p-2 text-white rounded-b-xl w-full hover:text-primary">
                <p className="text-xs leading-1 line-clamp-4">
                  <Badge>ads</Badge> {oneAds.name}
                </p>
              </div>
            </div>
          </div>
        </Link>
      </div>
    ))}
  </>)
}
