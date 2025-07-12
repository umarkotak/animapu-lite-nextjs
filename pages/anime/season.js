import { useState, useEffect } from 'react'

import animapuApi from "../../apis/AnimapuApi"
import { toast } from 'react-toastify'
import Link from 'next/link'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import MangaCardV2 from '@/components/MangaCardV2'
import { useParams } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/router'
import Select from 'react-select'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import AnimeSeasonCard from '@/components/AnimeSeasonCard'

var tempAllMangas = []
var limit = 16
var defaultSeasonIdx = 1
var defaultSelectedSeason = {
  value: `2025 - spring`,
  label: `2025 - spring`,
  season_name: `spring`,
  year: `2025`,
}

export default function AnimeSeason() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [seasonFilters, setSeasonFilters] = useState([])
  const [animePerSeasons, setAnimePerSeasons] = useState([{animes: []}])
  const [selectedSeason, setSelectedSeason] = useState(defaultSelectedSeason)

  useEffect(() => {
    if (!window) { return }

    var tmpSeasonFilters = []

    // winter, spring, summer, fall
    var allSeasonContents = generateSeasonData(1999, "fall", 2025, "fall")

    allSeasonContents.forEach((oneSeasonContent) => {
      tmpSeasonFilters.push({
        value: `${oneSeasonContent.year} - ${oneSeasonContent.season_name}`,
        label: `${oneSeasonContent.year} - ${oneSeasonContent.season_name}`,
        season_name: oneSeasonContent.season_name,
        year: oneSeasonContent.year,
      })
    })

    setSeasonFilters(tmpSeasonFilters)
  }, [])

  function generateSeasonData(minYear, minSeason, maxYear, maxSeason) {
    const seasons = ["winter", "spring", "summer", "fall"]
    var data = [];

    for (let year = maxYear; year >= minYear; year--) {
      let startSeasonIndex = 0;
      let endSeasonIndex = seasons.length - 1;

      if (year === minYear) {
        startSeasonIndex = seasons.indexOf(minSeason);
      }

      if (year === maxYear) {
        endSeasonIndex = seasons.indexOf(maxSeason);
      }

      for (let i = endSeasonIndex; i >=startSeasonIndex ; i--) {
        data.push({
          year: year,
          season_name: seasons[i],
        });
      }
    }

    return data;
  }

  useEffect(() => {
    if (!seasonFilters || seasonFilters.length === 0) {
      return
    }

    var year = searchParams.get('year') || seasonFilters[defaultSeasonIdx].year
    var season = searchParams.get('season') || seasonFilters[defaultSeasonIdx].season_name

    GetAnimesBySeason(year, season, 0)
  }, [seasonFilters, searchParams])

  async function GetAnimesBySeason(year, season, iter) {
    if (iter >= 10) {
      toast.error("error get season")
      return
    }

    try {
      const response = await animapuApi.GetAnimesBySeason({
        anime_source: params.anime_source,
        year: year,
        season: season
      })
      const body = await response.json()
      if (response.status !== 200) {
        console.log("error", body)
        return
      }
      setAnimePerSeasons([body.data])
      setSelectedSeason({
        value: `${year} - ${season}`,
        label: `${year} - ${season}`,
        season_name: season,
        year: year,
      })

    } catch (e) {
      toast.error(`error get season, ${year}, ${season}. ${iter}`)
      // GetAnimesBySeason(year, season, iter + 1)
    }
  }

  function handleChange(selectedOption) {
    router.push(`/anime/season?year=${selectedOption.year}&season=${selectedOption.season_name}`)
  }

  function SeasonIconGenerator(seasonName) {
    if (seasonName === "winter") { return "fa-solid fa-snowflake" }
    if (seasonName === "spring") { return "fa-solid fa-fan" }
    if (seasonName === "summer") { return "fa-solid fa-sun" }
    if (seasonName === "fall") { return "fa-solid fa-leaf" }
    return "fa-solid fa-border-all"
  }

  function prevSeason() {
    var currIndex = 0

    if (!searchParams.get('year') && !searchParams.get('season')) {
      return
    }

    seasonFilters.forEach((val, idx) => {
      if (`${val.year}` === searchParams.get('year') && val.season_name === searchParams.get('season')) {
        currIndex = idx
      }
    })

    if (currIndex <= 0) {
      return
    }

    router.push(`/anime/season?year=${seasonFilters[currIndex-1].year}&season=${seasonFilters[currIndex-1].season_name}`)
  }

  function nextSeason() {
    var currIndex = 0

    if (!searchParams.get('year') && !searchParams.get('season')) {
      console.log("a")
      router.push(`/anime/season?year=${seasonFilters[1].year}&season=${seasonFilters[1].season_name}`)
      return
    }

    seasonFilters.forEach((val, idx) => {
      if (`${val.year}` === searchParams.get('year') && val.season_name === searchParams.get('season')) {
        currIndex = idx
      }
    })

    if (currIndex >= seasonFilters.length-1) {
      return
    }

    router.push(`/anime/season?year=${seasonFilters[currIndex+1].year}&season=${seasonFilters[currIndex+1].season_name}`)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-2 w-full">
        <Button
          onClick={()=>prevSeason()}
        >
          <ArrowLeft />
        </Button>
        <Select
          // defaultValue={seasonFilters[0]}
          options={seasonFilters}
          className='w-[180px] bg-background text-black'
          onChange={handleChange}
          placeholder={'Select season'}
          value={selectedSeason}
        />
        <Button
          onClick={()=>nextSeason()}
        >
          <ArrowRight />
        </Button>
      </div>

      <div className="flex flex-col mb-6">
        {animePerSeasons.map((oneSeason) => (
          <div className="flex flex-col gap-4" key={`season-${oneSeason?.release_year}-${oneSeason?.season_name}`}>
            <Card>
              <CardHeader className="p-4">
                <CardTitle>
                  {oneSeason?.release_year} - {oneSeason?.season_name}
                </CardTitle>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 z-0">
              {oneSeason.animes && oneSeason.animes.map((oneAnimeData) => (
                <AnimeSeasonCard oneAnimeData={oneAnimeData} key={`${oneAnimeData.source}-${oneAnimeData.id}`} source={params.anime_source} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
