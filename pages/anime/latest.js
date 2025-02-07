'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Select from 'react-select'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'

import AnimeSourceCard from '@/components/AnimeSourceCard'
import AnimeHistoryCard from '@/components/AnimeHistoryCard'
import animapuApi from '@/apis/AnimapuApi'

var page = 1
var onApiCall = false
export default function AnimeSourceHome() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [animes, setAnimes] = useState([])

  var endReached = false

  useEffect(() => {
    GetLatestAnime(false)
  }, [params, searchParams])

  async function GetLatestAnime(append) {
    if (!window) {return}

    if (onApiCall) {return}
    onApiCall = true

    if (endReached) {return}

    if (!append) {
      page = 1
    }

    try {
      const response = await animapuApi.GetLatestAnime({
        anime_source: params.anime_source,
        page: page,
      })
      const body = await response.json()
      if (response.status !== 200) {
        console.log("error", body)
        onApiCall = false
        return
      }

      if (body.data && body.data.length <= 0) {
        endReached = true
        onApiCall = false
        return
      }

      if (append) {
        setAnimes(animes.concat(body.data))
      } else {
        setAnimes(body.data)
      }
      page = page + 1
      onApiCall = false

    } catch (e) {
      console.error(e.message)
      onApiCall = false
    }
  }

  const [triggerNextPage, setTriggerNextPage] = useState(0)
  const handleScroll = () => {
    var position = window.pageYOffset
    var maxPosition = document.documentElement.scrollHeight - document.documentElement.clientHeight

    if (maxPosition-position <= 1200) {
      setTriggerNextPage(position)
    }
  }
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])
  useEffect(() => {
    GetLatestAnime(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerNextPage])

  const [showChangeSourceModal, setShowChangeSourceModal] = useState(false)

  const [animeHistories, setAnimeHistories] = useState([])
  useEffect(() => {
    if (!localStorage) { return }
    var keyHistoryList = "ANIMEHUB-LITE:HISTORY_LIST:V2"
    if (!localStorage.getItem(keyHistoryList)) { return }
    var episodeHistories = JSON.parse(localStorage.getItem(keyHistoryList))
    const filteredArray = filterDuplicateObjects(episodeHistories);
    setAnimeHistories(filteredArray)
  }, [])

  return (
    <main className="pb-[100px] p-4 min-h-screen">
      <div className="max-w-[1200px] mx-auto mb-6 w-full">
        <div className='text-lg mb-2'>Continue Watch</div>
        <div className='grid gap-x-8 auto-cols-[10.5rem] grid-flow-col overflow-x-auto w-full'>
          {animeHistories.map((oneAnimeEpisodeData) => (
            <div className='w-full h-[240px]' key={oneAnimeEpisodeData.pathname}>
              <AnimeHistoryCard
                oneAnimeEpisodeData={oneAnimeEpisodeData}
              />
            </div>
          ))}
        </div>
      </div>
      {showChangeSourceModal &&
        <div className='fixed bg-black bg-opacity-60 backdrop-blur h-screen w-full left-0 top-0 z-50'>
          <div className='w-full h-screen absolute left-0 top-0 z-0' onClick={()=>setShowChangeSourceModal(false)}></div>
          <div className='relative mt-24 mx-auto max-w-md oveflow-hidden rounded-xl z-30'>
            <div className="relative bg-gray-800 rounded-t-xl shadow z-10 overflow-hidden mx-4 p-4">
              Change Source
            </div>
            <div className="relative bg-gray-600 rounded-b-xl shadow z-10 overflow-hidden mx-4 p-4 flex flex-col text-center">
              <Link
                className='w-full p-4 bg-blue-300 hover:bg-blue-400 rounded-xl text-black'
                href="/animes/animension"
                onClick={()=>{
                  localStorage.setItem("ANIMEHUB:ACTIVE_SOURCE", "animension")
                  setActiveSource("animension")
                }}
              >
                Animension
              </Link>
              <Link
                className='w-full p-4 bg-blue-300 hover:bg-blue-400 rounded-xl mt-2 text-black'
                href="/animes/otakudesu"
                onClick={()=>{
                  localStorage.setItem("ANIMEHUB:ACTIVE_SOURCE", "otakudesu")
                  setActiveSource("otakudesu")
                }}
              >
                Otakudesu
              </Link>
              <Link
                className='w-full p-4 bg-blue-300 hover:bg-blue-400 rounded-xl mt-2 text-black'
                href="/animes/gogo_anime"
                onClick={()=>{
                  localStorage.setItem("ANIMEHUB:ACTIVE_SOURCE", "gogo_anime")
                  setActiveSource("gogo_anime")
                }}
              >
                Gogo Anime
              </Link>
            </div>
          </div>
        </div>
      }
      <div className="flex flex-col mb-6 max-w-[1200px] mx-auto">
        <div className='mb-6 flex justify-between items-center bg-gray-800 rounded-xl p-2'>
          {/* <div className='text-2xl'>{params.anime_source}</div> */}
          <div>
            <button
              className='bg-gray-900 hover:bg-gray-700 text-white p-2 rounded-xl text-sm'
              onClick={()=>setShowChangeSourceModal(true)}
            >Change Source</button>
          </div>
        </div>

        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-8 gap-y-8'>
          {animes.map((oneAnimeData) => (
            <AnimeSourceCard oneAnimeData={oneAnimeData} key={`${oneAnimeData.source}-${oneAnimeData.id}`} source={params.anime_source} />
          ))}
        </div>
      </div>
    </main>
  )

  function filterDuplicateObjects(array) {
    // Create a Map to store unique objects based on their 'id' property
    const uniqueObjects = new Map();
    var preservedArr = []

    // Iterate through the array in reverse order to prioritize the most recent objects
    for (let i = 0; i <= array.length - 1; i++) {
      const object = array[i];
      const id = object.anime_id;

      // If the object's 'id' is not already in the Map, add it
      if (!uniqueObjects.has(id)) {
        uniqueObjects.set(id, object)
        preservedArr.push(object)
      }
    }

    // Return an array of the unique objects from the Map
    return preservedArr
  }
}
