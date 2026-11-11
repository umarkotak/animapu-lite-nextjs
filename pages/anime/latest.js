import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import animapuApi from '@/apis/AnimapuApi'
import ChangeAnimeSourceModalOnly from '@/components/ChangeAnimeSourceModalOnly'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import AnimeCard from '@/components/AnimeCard'
import AnimeCardBar from '@/components/AnimeCardBar'

export default function AnimeLatest({discoveryBar, contentOnly = false, animeSource}) {
  const router = useRouter()
  const specialFilter = router.query.special_filter || ""
  const [activeSource, setActiveSource] = useState("")
  const [animes, setAnimes] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (router.isReady) setActiveSource(animeSource || animapuApi.GetActiveAnimeSource())
  }, [router.isReady, animeSource])

  useEffect(() => {
    if (!router.isReady || !activeSource) return
    const controller = new AbortController()
    let page = 1
    let onApiCall = false
    let endReached = false
    let frame
    setAnimes([])
    setError("")

    async function loadAnimes() {
      if (onApiCall || endReached) return
      onApiCall = true
      setLoading(true)
      setError("")
      try {
        const requestedPage = page
        const response = await animapuApi.GetLatestAnime({
          anime_source: activeSource,
          page: requestedPage,
          special_filter: specialFilter,
          signal: controller.signal,
        })
        const body = await response.json()
        if (!response.ok) throw new Error(body.error?.message || "Unable to load anime.")
        if (controller.signal.aborted) return
        const results = body.data || []
        endReached = results.length === 0
        setAnimes((current) => requestedPage === 1 ? results : current.concat(results))
        page += 1
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error.message)
          endReached = true
        }
      } finally {
        onApiCall = false
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadAnimes()
    const handleScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = undefined
        if (document.documentElement.scrollHeight - window.scrollY - window.innerHeight <= 1200) loadAnimes()
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      controller.abort()
      window.removeEventListener('scroll', handleScroll)
      cancelAnimationFrame(frame)
    }
  }, [router.isReady, activeSource, specialFilter])

  const status = error
    ? <p role="alert" className="py-8 text-center text-destructive">{error}</p>
    : !animes.length && <p role="status" className="py-8 text-center text-muted-foreground">{loading ? "Loading anime…" : "No anime found."}</p>

  if (discoveryBar) {
    if (status) return status
    return (
      <div className="flex flex-row gap-4 flex-nowrap overflow-auto">
        {animes.map((oneAnimeData) => (
          <AnimeCardBar anime={oneAnimeData} key={`${oneAnimeData.source}-${oneAnimeData.id}`} source={oneAnimeData.source} />
        ))}
      </div>
    )
  }

  if (contentOnly) {
    return status || <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 z-0">{animes.map((oneAnimeData) => <AnimeCard anime={oneAnimeData} key={`${oneAnimeData.source}-${oneAnimeData.id}`} source={oneAnimeData.source} />)}</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="flex justify-between items-center">
            <div>
              <h1 className="text-xl">{activeSource}</h1>
            </div>
            <div>
              <Button onClick={()=>{setShowModal(true)}}>Ganti Sumber</Button>
              <ChangeAnimeSourceModalOnly show={showModal} onClose={()=>setShowModal(false)} />
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {status || <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 z-0">
        {animes.map((oneAnimeData) => (
          <AnimeCard anime={oneAnimeData} key={`${oneAnimeData.source}-${oneAnimeData.id}`} source={oneAnimeData.source} />
        ))}
      </div>}
    </div>
  )
}
