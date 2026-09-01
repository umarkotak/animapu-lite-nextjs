import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, Snowflake, Flower2, Sun, Leaf, Calendar } from 'lucide-react'

import animapuApi from '@/apis/AnimapuApi'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import AnimeCard from '@/components/AnimeCard'

// Constants
const SEASONS = ['winter', 'spring', 'summer', 'fall']
const MIN_YEAR = 1999
const MIN_SEASON = 'fall'

// Season utility functions
const getSeasonFromMonth = (month) => {
  if (month >= 1 && month <= 3) return 'winter'
  if (month >= 4 && month <= 6) return 'spring'
  if (month >= 7 && month <= 9) return 'summer'
  return 'fall'
}

const getSeasonIcon = (seasonName) => {
  const iconProps = { className: 'h-4 w-4' }
  switch (seasonName) {
    case 'winter': return <Snowflake {...iconProps} />
    case 'spring': return <Flower2 {...iconProps} />
    case 'summer': return <Sun {...iconProps} />
    case 'fall': return <Leaf {...iconProps} />
    default: return <Calendar {...iconProps} />
  }
}

const getCurrentSeasonInfo = () => {
  const now = new Date()
  return {
    year: now.getFullYear(),
    season: getSeasonFromMonth(now.getMonth() + 1),
  }
}

const generateSeasonOptions = () => {
  const { year: maxYear, season: maxSeason } = getCurrentSeasonInfo()
  const options = []

  for (let year = maxYear; year >= MIN_YEAR; year--) {
    const startSeasonIndex = year === MIN_YEAR ? SEASONS.indexOf(MIN_SEASON) : 0
    const endSeasonIndex = year === maxYear ? SEASONS.indexOf(maxSeason) : SEASONS.length - 1

    for (let i = endSeasonIndex; i >= startSeasonIndex; i--) {
      options.push({
        value: `${year}-${SEASONS[i]}`,
        year: year.toString(),
        season: SEASONS[i],
        label: `${year} - ${SEASONS[i].charAt(0).toUpperCase() + SEASONS[i].slice(1)}`,
      })
    }
  }

  return options
}

export default function AnimeSeason() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Memoize season options to avoid recalculation on every render
  const seasonOptions = useMemo(() => generateSeasonOptions(), [])

  const [animeData, setAnimeData] = useState({ animes: [], release_year: '', season_name: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [showSeasonDrawer, setShowSeasonDrawer] = useState(false)

  // Get current selection from URL or default to first option
  const currentSelection = useMemo(() => {
    const urlYear = searchParams.get('year')
    const urlSeason = searchParams.get('season')

    if (urlYear && urlSeason) {
      return seasonOptions.find(opt => opt.year === urlYear && opt.season === urlSeason) || seasonOptions[0]
    }
    return seasonOptions[0]
  }, [searchParams, seasonOptions])

  // Find current index for navigation
  const currentIndex = useMemo(() => {
    return seasonOptions.findIndex(opt => opt.value === currentSelection.value)
  }, [seasonOptions, currentSelection])

  // Fetch anime data
  const fetchAnimesBySeason = useCallback(async (year, season) => {
    setIsLoading(true)
    try {
      const response = await animapuApi.GetAnimesBySeason({
        anime_source: animapuApi.GetActiveAnimeSource(),
        year,
        season,
      })
      const body = await response.json()

      if (response.status !== 200) {
        toast.error(`Failed to fetch anime for ${year} ${season}`)
        return
      }

      setAnimeData(body.data || { animes: [], release_year: year, season_name: season })
    } catch (error) {
      toast.error(`Error fetching anime: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch data when selection changes
  useEffect(() => {
    if (currentSelection) {
      fetchAnimesBySeason(currentSelection.year, currentSelection.season)
    }
  }, [currentSelection, fetchAnimesBySeason])

  // Navigation handlers
  const navigateToSeason = useCallback((option) => {
    router.push(`/anime/season?year=${option.year}&season=${option.season}`)
  }, [router])

  const handleSelectChange = useCallback((value) => {
    const selected = seasonOptions.find(opt => opt.value === value)
    if (selected) {
      setShowSeasonDrawer(false)
      navigateToSeason(selected)
    }
  }, [seasonOptions, navigateToSeason])

  const goToPreviousSeason = useCallback(() => {
    if (currentIndex < seasonOptions.length - 1) {
      navigateToSeason(seasonOptions[currentIndex + 1])
    }
  }, [currentIndex, seasonOptions, navigateToSeason])

  const goToNextSeason = useCallback(() => {
    if (currentIndex > 0) {
      navigateToSeason(seasonOptions[currentIndex - 1])
    }
  }, [currentIndex, seasonOptions, navigateToSeason])

  const canGoPrevious = currentIndex < seasonOptions.length - 1
  const canGoNext = currentIndex > 0

  return (
    <div className="relative min-h-screen overflow-x-clip px-4 py-5 pb-28">
      <div className="pointer-events-none absolute -top-16 left-1/2 h-64 w-screen -translate-x-1/2 rounded-b-[50%] bg-gradient-to-b from-purple-500/30 via-fuchsia-500/20 to-pink-500/0 blur-3xl" />
      <div className="relative flex flex-col gap-6">
        <header className="flex items-center gap-2">
          <Button aria-label="Go home" onClick={() => router.push('/home')} size="icon" variant="ghost"><ArrowLeft size={20} /></Button>
          <h1 className="text-xl font-semibold">Season</h1>
        </header>

        {isLoading && <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">{[...Array(8)].map((_, i) => <div key={i} className="h-[240px] rounded-xl bg-muted animate-pulse sm:h-[280px] md:h-[320px]" />)}</div>}

        {!isLoading && <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {animeData.animes?.map((anime) => <AnimeCard anime={anime} key={`${anime.source}-${anime.id}`} showScore source={anime.source || animapuApi.GetActiveAnimeSource()} />)}
        </div>}

        {!isLoading && (!animeData.animes || animeData.animes.length === 0) && <Card className="p-8 text-center"><p className="text-muted-foreground">No anime found for this season.</p></Card>}
      </div>

      <div className="fixed inset-x-0 bottom-2 z-40 flex justify-center px-2">
        <div className="flex items-center rounded-2xl border border-white/15 bg-background/65 p-2.5 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <Button aria-label="Previous season" className="h-11 rounded-2xl px-4" disabled={!canGoPrevious} onClick={goToPreviousSeason} size="sm" variant="ghost"><ChevronLeft size={18} /><span className="hidden sm:inline">Previous</span></Button>
          <Button className="h-11 min-w-40 rounded-2xl px-4" onClick={() => setShowSeasonDrawer(true)} size="sm" variant="default">{getSeasonIcon(currentSelection.season)}<span>{currentSelection.label}</span><ChevronDown size={18} /></Button>
          <Button aria-label="Next season" className="h-11 rounded-2xl px-4" disabled={!canGoNext} onClick={goToNextSeason} size="sm" variant="ghost"><span className="hidden sm:inline">Next</span><ChevronRight size={18} /></Button>
        </div>
      </div>

      <Drawer open={showSeasonDrawer} onOpenChange={setShowSeasonDrawer}>
        <DrawerContent className="mx-auto max-h-[80vh] max-w-2xl">
          <DrawerHeader><DrawerTitle>Select season</DrawerTitle></DrawerHeader>
          <div className="overflow-y-auto px-4 pb-6">
            <div className="flex flex-col gap-2">
              {seasonOptions.map((option) => <Button className="h-auto justify-start p-3" key={option.value} onClick={() => handleSelectChange(option.value)} variant={option.value === currentSelection.value ? 'default' : 'secondary'}>{getSeasonIcon(option.season)}{option.label}</Button>)}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
