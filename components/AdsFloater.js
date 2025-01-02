import { useState, useRef, useEffect } from 'react'
import { useRouter } from "next/router"
import Link from 'next/link'

import animapuApi from "../apis/AnimapuApi"
import Manga from "../models/Manga"
import { BookIcon, Eye, EyeIcon, Heart, HeartIcon, PlayIcon, Share2Icon, StarIcon, XIcon } from 'lucide-react'
import { toast } from 'react-toastify'
import * as Cronitor from "@cronitorio/cronitor-rum"

export default function AdsFloater() {
  const [prayerTimes, setPrayerTimes] = useState({})
  const [adsList, setAdsList] = useState([
    {
      "codename": "kentang-mustofa",
      "link": "https://tokopedia.link/PDkVcWWVOPb",
      "image": "https://images.tokopedia.net/img/cache/900/VqbcmM/2024/2/26/006c2c90-bf67-4195-bde6-de58107390c4.jpg",
      "name": "Kentang Mustofa Kacang Teri toples 1 ltr - Kacang Teri",
    },
    {
      "codename": "slice-beef",
      "link": "https://tokopedia.link/3Kbn0gxWOPb",
      "image": "https://images.tokopedia.net/img/cache/900/VqbcmM/2024/6/12/3e3b7e1e-1c50-4464-bc45-1c7fe63dca15.jpg",
      "name": "Hijrahfood Slice Beef US Shortplate | Daging Lapis Iris Shabu / Sukiyaki / Yakiniku / Yoshinoya - 250 gram",
    },
    {
      "codename": "celana-pendek",
      "link": "https://tokopedia.link/6VOnaKzWOPb",
      "image": "https://images.tokopedia.net/img/cache/900/VqbcmM/2024/10/9/b65129d5-825f-4ac2-a581-04650a2af9fd.jpg",
      "name": "promo 4 pcs celana pendek pria wanita dewasa santai baby terry saku resleting jumbo - 3PCS, XL 60-70 KG",
    },
  ])
  
  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch('https://api.aladhan.com/v1/calendarByCity?city=Jakarta&country=Indonesia&method=2&month=12&year=2024');
        const data = await response.json(); // Parse the response as JSON
        setPrayerTimes(data.data[0].timings);
      } catch (err) {
        console.error(err)
      }
    };

    fetchPrayerTimes();
  }, [])

  async function trackClick(codename) {
    Cronitor.track(`ADS_CLICK_${codename}`)
  }

  return(<>
    <div className='fixed w-[270px] top-[60px] z-0 left-1/2 hidden xl:block text-white' style={{transform: `translate(-660px, 0%)`}}>
      <div className='w-full flex flex-col gap-2'>
        <div className='bg-[#2b2d42] p-2 rounded border-white border'>
          Pengumuman
        </div>
        <div className='bg-[#3b3e5a] flex flex-col gap-1 p-2 rounded text-sm'>
          <p>- Berikan donasi agar server animapu tetap bisa berjalan gratis.</p>
          <p>- Akan ada update penambahan iklan.</p>
          <p>- Ada kemungkinan fitur history akan terdampak.</p>
          <p>- Gunakan animehub untuk menonton anime.</p>
        </div>

        <div className='bg-[#2b2d42] p-2 rounded border-white border'>
          Jadwal Sholat
        </div>
        <div className='bg-[#3b3e5a] flex justify-between p-2 rounded text-xs'>
          <span>Subuh</span>
          <span>{prayerTimes.Fajr}</span>
        </div>
        <div className='bg-[#3b3e5a] flex justify-between p-2 rounded text-xs'>
          <span>Sunrise</span>
          <span>{prayerTimes.Sunrise}</span>
        </div>
        <div className='bg-[#3b3e5a] flex justify-between p-2 rounded text-xs'>
          <span>Dhuhr</span>
          <span>{prayerTimes.Dhuhr}</span>
        </div>
        <div className='bg-[#3b3e5a] flex justify-between p-2 rounded text-xs'>
          <span>Asr</span>
          <span>{prayerTimes.Asr}</span>
        </div>
        <div className='bg-[#3b3e5a] flex justify-between p-2 rounded text-xs'>
          <span>Maghrib</span>
          <span>{prayerTimes.Maghrib}</span>
        </div>
        <div className='bg-[#3b3e5a] flex justify-between p-2 rounded text-xs'>
          <span>Isha</span>
          <span>{prayerTimes.Isha}</span>
        </div>
      </div>
    </div>

    <div className='absolute w-[270px] top-[60px] z-0 left-1/2 hidden xl:block text-white' style={{transform: `translate(390px, 0%)`}}>
      <div className='w-full flex flex-col gap-2'>
        <div className='bg-[#2b2d42] p-2 rounded border-white border'>
          Ads / Iklan
        </div>
        {adsList.map((oneAds) => (
          <div className='w-full overflow-hidden rounded-lg relative border border-white' key={oneAds.codename}>
            <Link href={oneAds.link} target="_blank" onClick={()=>trackClick(oneAds.codename)}>
              <img className='cursor-pointer hover:scale-105 transition' src={oneAds.image} />
              <div className='bottom-0 w-full bg-black bg-opacity-70 backdrop-blur-sm absolute p-2 text-sm line-clamp-3 rounded-b-lg'>
                {oneAds.name}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  </>)
}
