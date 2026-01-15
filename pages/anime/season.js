import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import { ChevronLeft, ChevronRight, Snowflake, Flower2, Sun, Leaf, Calendar } from 'lucide-react'

import animapuApi from '@/apis/AnimapuApi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import AnimeSeasonCard from '@/components/AnimeSeasonCard'

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
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  // Memoize season options to avoid recalculation on every render
  const seasonOptions = useMemo(() => generateSeasonOptions(), [])

  const [animeData, setAnimeData] = useState({ animes: [], release_year: '', season_name: '' })
  const [isLoading, setIsLoading] = useState(false)

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
        anime_source: params?.anime_source,
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
  }, [params?.anime_source])

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
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* Sticky Season Navigator */}
      <div className="sticky top-12 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b py-2 -mx-2 px-2 sm:-mx-4 sm:px-4">
        <Card className="shadow-sm p-0">
          <CardContent className="p-2">
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Previous Season Button */}
              <Button
                variant="outline"
                onClick={goToPreviousSeason}
                disabled={!canGoPrevious}
                className="shrink-0 h-9 sm:h-10 px-2 sm:px-3 text-xs"
                aria-label="Previous season"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">
                  {canGoPrevious ? seasonOptions[currentIndex + 1]?.label : ''}
                </span>
              </Button>

              {/* Season Selector */}
              <Select value={currentSelection.value} onValueChange={handleSelectChange}>
                <SelectTrigger className="flex-1 min-w-0 sm:min-w-[180px]">
                  <div className="flex items-center gap-2 truncate">
                    <SelectValue placeholder="Select season" />
                  </div>
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {seasonOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {getSeasonIcon(option.season)}
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Next Season Button */}
              <Button
                variant="outline"
                onClick={goToNextSeason}
                disabled={!canGoNext}
                className="shrink-0 h-9 sm:h-10 px-2 sm:px-3 text-xs"
                aria-label="Next season"
              >
                <span className="hidden sm:inline mr-1">
                  {canGoNext ? seasonOptions[currentIndex - 1]?.label : ''}
                </span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-[240px] sm:h-[280px] md:h-[320px] rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {/* Anime Grid */}
      {!isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
          {animeData.animes?.map((anime) => (
            <AnimeSeasonCard
              key={`${anime.source}-${anime.id}`}
              oneAnimeData={anime}
              source={params?.anime_source}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!animeData.animes || animeData.animes.length === 0) && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No anime found for this season.</p>
        </Card>
      )}
    </div>
  )
}
